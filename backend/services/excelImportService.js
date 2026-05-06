import xlsx from "xlsx";

const SHEETS = {
  STAFF: "Source Information - Staff",
  UNITS: "Source Information - Units",
  ROLES: "Source Information - Roles",
  TEACHING: "Data Entry - Teaching",
  HDR: "Data Entry - HDR",
  ASSIGNED_ROLE: "Data Entry - Assigned Role",
};

const FORMULA_ERROR_VALUES = new Set([
  "#DIV/0!",
  "#VALUE!",
  "#N/A",
  "#REF!",
  "#NAME?",
  "#NUM!",
  "#NULL!",
]);

function clean(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function isJunkStaffValue(value) {
  const text = clean(value);
  const lower = text.toLowerCase();

  if (!text) return true;

  const junkValues = new Set([
    "0",
    ",",
    "-",
    "n/a",
    "na",
    "#n/a",
    "staff member",
    "select staff member",
  ]);

  if (junkValues.has(lower)) return true;
  if (/^,+$/.test(text)) return true;

  return false;
}

function rowHasMeaningfulValues(row, startIndex = 0) {
  return row.slice(startIndex).some((value) => {
    const text = clean(value);
    if (!text) return false;
    if (text === "0") return false;
    if (FORMULA_ERROR_VALUES.has(text)) return false;
    return true;
  });
}

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;

  const cleaned = String(value).replace(/,/g, "").trim();
  if (!cleaned || FORMULA_ERROR_VALUES.has(cleaned)) return fallback;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((Number(value) || 0) * factor) / factor;
}

function parseStaffId(staffMember, staffNumber = "") {
  const numberSource =
    clean(staffNumber) || clean(staffMember).match(/(\d{4,})$/)?.[1] || "";

  const parsed = Number.parseInt(numberSource, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeBand(value) {
  const text = clean(value).toLowerCase();
  if (!text) return "";

  if (
    text.includes("balanced") ||
    text.includes("t&r") ||
    text.includes("t & r") ||
    (text.includes("teaching") && text.includes("research"))
  ) {
    return "Balanced Teaching & Research";
  }

  if (text.includes("teaching")) return "Teaching Focused";
  if (text.includes("research")) return "Research Focused";

  return clean(value);
}

function calculateBand(teachingPoints, researchPoints) {
  const denominator = teachingPoints + researchPoints;
  if (denominator <= 0) return "Unknown";

  const teachingRatio = teachingPoints / denominator;

  if (teachingRatio < 0.3) return "Research Focused";
  if (teachingRatio > 0.7) return "Teaching Focused";

  return "Balanced Teaching & Research";
}

function inferDepartmentFromUnit(unitCode) {
  const code = clean(unitCode).toUpperCase();

  if (code.startsWith("CITS") || code.startsWith("CYBR") || code.startsWith("COMP")) {
    return "CSSE";
  }

  if (code.startsWith("MATH") || code.startsWith("STAT")) {
    return "Mathematics";
  }

  if (code.startsWith("PHYS") || code.startsWith("ASTR") || code.startsWith("BIOP")) {
    return "Physics";
  }

  return null;
}

function sheetRows(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error(`Missing required worksheet: ${sheetName}`);
  }

  return xlsx.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
    raw: false,
  });
}

function addIssue(issues, issue) {
  issues.push({
    staffId: issue.staffId ?? null,
    staffName: issue.staffName ?? null,
    department: issue.department ?? null,
    type: issue.type,
    severity: issue.severity || "warning",
    description: issue.description,
    sourceSheet: issue.sourceSheet || null,
    sourceRow: issue.sourceRow || null,
  });
}

function scanRowForFormulaErrors(
  row,
  issues,
  sourceSheet,
  sourceRow,
  staffMember,
  staffId,
  department
) {
  row.forEach((value) => {
    const text = clean(value);

    if (FORMULA_ERROR_VALUES.has(text)) {
      addIssue(issues, {
        staffId,
        staffName: staffMember,
        department,
        type: "Formula Error",
        severity: "error",
        description: `Formula error ${text} found in ${sourceSheet} row ${sourceRow}.`,
        sourceSheet,
        sourceRow,
      });
    }
  });
}

function buildEmptyAgg() {
  return {
    teaching: 0,
    assignedRole: 0,
    service: 0,
    hdr: 0,
    unitDepartments: new Set(),
  };
}

function ensureAgg(map, staffId) {
  if (!map.has(staffId)) map.set(staffId, buildEmptyAgg());
  return map.get(staffId);
}

async function insertIssue(db, importBatchId, issue) {
  await db.run(
    `INSERT INTO validation_issues
    (importBatchId, staffId, staffName, department, type, severity, description, sourceSheet, sourceRow, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      importBatchId,
      issue.staffId,
      issue.staffName,
      issue.department,
      issue.type,
      issue.severity,
      issue.description,
      issue.sourceSheet,
      issue.sourceRow,
      new Date().toISOString(),
    ]
  );
}

export async function importExcelWorkbook({ db, filePath, originalName, uploadedBy }) {
  const workbook = xlsx.readFile(filePath, {
    cellDates: true,
    cellFormula: false,
  });

  const userRows = await db.all("SELECT staffId, name, department FROM users");
  const userByStaffId = new Map(userRows.map((user) => [user.staffId, user]));

  const issues = [];
  const staffByMember = new Map();
  const unitCodes = new Set();
  const workloadAgg = new Map();

  const staffRows = sheetRows(workbook, SHEETS.STAFF);
  const unitRows = sheetRows(workbook, SHEETS.UNITS);
  const roleRows = sheetRows(workbook, SHEETS.ROLES);
  const teachingRows = sheetRows(workbook, SHEETS.TEACHING);
  const hdrRows = sheetRows(workbook, SHEETS.HDR);
  const assignedRoleRows = sheetRows(workbook, SHEETS.ASSIGNED_ROLE);

  const parsedStaff = [];

  for (let i = 1; i < staffRows.length; i++) {
    const row = staffRows[i];
    const sourceRow = i + 1;

    const staffMember = clean(row[2]);
    const staffName = clean(row[3]);
    const staffNumber = clean(row[4]);

    if (isJunkStaffValue(staffMember)) continue;

    const staffId = parseStaffId(staffMember, staffNumber);
    const fte = toNumber(row[5], null);
    const targetBand = normalizeBand(row[10]);
    const existingUser = userByStaffId.get(staffId);

    const record = {
      staffId,
      staffMember,
      staffName,
      staffNumber,
      staffType: clean(row[0]),
      fte,
      function: clean(row[6]),
      targetTeachingPercent: toNumber(row[7], null),
      targetResearchPercent: toNumber(row[8], null),
      targetTRBalance: toNumber(row[9], null),
      targetBand,
      department: existingUser?.department || null,
    };

    scanRowForFormulaErrors(
      row,
      issues,
      SHEETS.STAFF,
      sourceRow,
      staffMember,
      staffId,
      record.department
    );

    if (!staffId) {
      addIssue(issues, {
        staffName: staffMember,
        type: "Missing Staff ID",
        severity: "error",
        description: `Could not identify a staff number for ${staffMember}.`,
        sourceSheet: SHEETS.STAFF,
        sourceRow,
      });

      continue;
    }

    if (!existingUser) {
      addIssue(issues, {
        staffId,
        staffName: staffMember,
        type: "Unknown Staff ID",
        severity: "error",
        description: `${staffMember} has staff ID ${staffId}, but that staff ID is not linked to a system user.`,
        sourceSheet: SHEETS.STAFF,
        sourceRow,
      });

      continue;
    }

    if (fte === null) {
      addIssue(issues, {
        staffId,
        staffName: staffMember,
        department: record.department,
        type: "Missing FTE",
        severity: "error",
        description: `Missing or invalid FTE for ${staffMember}.`,
        sourceSheet: SHEETS.STAFF,
        sourceRow,
      });
    }

    if (!targetBand) {
      addIssue(issues, {
        staffId,
        staffName: staffMember,
        department: record.department,
        type: "Missing Target Band",
        severity: "warning",
        description: `Missing target T:R band for ${staffMember}.`,
        sourceSheet: SHEETS.STAFF,
        sourceRow,
      });
    }

    parsedStaff.push(record);
    staffByMember.set(staffMember, record);
  }

  const parsedUnits = [];

  for (let i = 1; i < unitRows.length; i++) {
    const row = unitRows[i];
    const sourceRow = i + 1;

    const unitCode = clean(row[0]);
    if (!unitCode) continue;

    const record = {
      unitCode,
      unitName: clean(row[1]),
      groupedUnit: clean(row[2]),
      enrolment: toNumber(row[3], null),
      expectedUCTariff: toNumber(row[4], null),
      cwsHoursPerStudent: toNumber(row[5], null),
    };

    scanRowForFormulaErrors(row, issues, SHEETS.UNITS, sourceRow, null, null, null);

    if (!record.unitName) {
      addIssue(issues, {
        type: "Missing Unit Name",
        severity: "warning",
        description: `Unit ${unitCode} has no unit name.`,
        sourceSheet: SHEETS.UNITS,
        sourceRow,
      });
    }

    unitCodes.add(unitCode);
    parsedUnits.push(record);
  }

  const parsedRoles = [];

  for (let i = 1; i < roleRows.length; i++) {
    const row = roleRows[i];
    const sourceRow = i + 1;

    const roleName = clean(row[1]);
    if (!roleName) continue;

    scanRowForFormulaErrors(row, issues, SHEETS.ROLES, sourceRow, null, null, null);

    parsedRoles.push({
      category: clean(row[0]),
      roleName,
      hours: toNumber(row[2], null),
      points: toNumber(row[3], null),
      notes: clean(row[4]),
      name: clean(row[5]),
      rolePillars: clean(row[6]),
    });
  }

  const parsedTeaching = [];

  for (let i = 2; i < teachingRows.length; i++) {
    const row = teachingRows[i];
    const sourceRow = i + 1;

    const unitCode = clean(row[0]);
    const staffMember = clean(row[2]);

    if (!unitCode && isJunkStaffValue(staffMember)) continue;

    const staff = staffByMember.get(staffMember);
    const staffId = staff?.staffId ?? parseStaffId(staffMember);
    const inferredDept = inferDepartmentFromUnit(unitCode);

    scanRowForFormulaErrors(
      row,
      issues,
      SHEETS.TEACHING,
      sourceRow,
      staffMember,
      staffId,
      staff?.department || inferredDept
    );

    if (!unitCode) {
      addIssue(issues, {
        staffId,
        staffName: staffMember,
        department: staff?.department || inferredDept,
        type: "Missing Unit Code",
        severity: "error",
        description: `Teaching row ${sourceRow} has no unit code.`,
        sourceSheet: SHEETS.TEACHING,
        sourceRow,
      });
    } else if (!unitCodes.has(unitCode)) {
      addIssue(issues, {
        staffId,
        staffName: staffMember,
        department: staff?.department || inferredDept,
        type: "Unknown Unit Code",
        severity: "error",
        description: `Teaching row references ${unitCode}, but it is not listed in Source Information - Units.`,
        sourceSheet: SHEETS.TEACHING,
        sourceRow,
      });
    }

    if (isJunkStaffValue(staffMember)) {
      addIssue(issues, {
        department: inferredDept,
        type: "Missing Staff Member",
        severity: "error",
        description: `Teaching row ${sourceRow} has no staff member.`,
        sourceSheet: SHEETS.TEACHING,
        sourceRow,
      });
    } else if (!staff) {
      addIssue(issues, {
        staffId: userByStaffId.has(staffId) ? staffId : null,
        staffName: staffMember,
        department: inferredDept,
        type: "Unknown Staff Member",
        severity: "error",
        description: `${staffMember} appears in Data Entry - Teaching but is not listed in Source Information - Staff.`,
        sourceSheet: SHEETS.TEACHING,
        sourceRow,
      });
    }

    const duplicateCount = toNumber(row[6], 0);

    if (duplicateCount > 1) {
      addIssue(issues, {
        staffId,
        staffName: staffMember,
        department: staff?.department || inferredDept,
        type: "Duplicate Teaching Allocation",
        severity: "warning",
        description: `${unitCode} and ${staffMember} appears ${duplicateCount} times in teaching allocations.`,
        sourceSheet: SHEETS.TEACHING,
        sourceRow,
      });
    }

    const totalTeachingPoints = toNumber(row[9], 0);

    if (staff?.staffId) {
      const agg = ensureAgg(workloadAgg, staff.staffId);
      agg.teaching += totalTeachingPoints;
      if (inferredDept) agg.unitDepartments.add(inferredDept);
    }

    parsedTeaching.push({
      sourceRow,
      unitCode,
      staffType: clean(row[1]),
      staffMember,
      staffId: userByStaffId.has(staffId) ? staffId : null,
      enrolment: toNumber(row[3], null),
      duplicateCount,
      totalTeachingHours: toNumber(row[8], 0),
      totalTeachingPoints,
      unitCoordinationPoints: toNumber(row[11], 0),
      teachingActivityPoints: toNumber(row[13], 0),
      unitSupervisionPoints: toNumber(row[15], 0),
      newUnitDevelopmentPoints: toNumber(row[17], 0),
      totalDepartmentHours: toNumber(row[18], 0),
      isUnitCoordinator: clean(row[19]),
    });
  }

  const parsedHdr = [];

  for (let i = 3; i < hdrRows.length; i++) {
    const row = hdrRows[i];
    const sourceRow = i + 1;

    const staffMember = clean(row[0]);

    if (isJunkStaffValue(staffMember)) {
      if (rowHasMeaningfulValues(row, 1)) {
        addIssue(issues, {
          staffName: "Missing staff member",
          type: "Missing Staff Member",
          severity: "error",
          description: `HDR row ${sourceRow} has workload data but no valid staff member.`,
          sourceSheet: SHEETS.HDR,
          sourceRow,
        });
      }

      continue;
    }

    const staff = staffByMember.get(staffMember);
    const staffId = staff?.staffId ?? parseStaffId(staffMember);

    scanRowForFormulaErrors(
      row,
      issues,
      SHEETS.HDR,
      sourceRow,
      staffMember,
      staffId,
      staff?.department
    );

    if (!staff) {
      addIssue(issues, {
        staffId: userByStaffId.has(staffId) ? staffId : null,
        staffName: staffMember,
        department: null,
        type: "Unknown Staff Member",
        severity: "error",
        description: `${staffMember} appears in Data Entry - HDR but is not listed in Source Information - Staff.`,
        sourceSheet: SHEETS.HDR,
        sourceRow,
      });
    }

    const workloadPoints = toNumber(row[6], 0);

    if (staff?.staffId) {
      ensureAgg(workloadAgg, staff.staffId).hdr += workloadPoints;
    }

    parsedHdr.push({
      sourceRow,
      staffMember,
      staffId: userByStaffId.has(staffId) ? staffId : null,
      fullTimeStudents: toNumber(row[1], 0),
      fullTimeProportion: toNumber(row[2], 0),
      partTimeStudents: toNumber(row[3], 0),
      partTimeProportion: toNumber(row[4], 0),
      totalSupervisionHours: toNumber(row[5], 0),
      workloadPoints,
    });
  }

  const parsedAssignedRoles = [];

  for (let i = 2; i < assignedRoleRows.length; i++) {
    const row = assignedRoleRows[i];
    const sourceRow = i + 1;

    const staffMember = clean(row[0]);

    if (isJunkStaffValue(staffMember)) {
      const assignedRoleTotalPoints = toNumber(row[3], 0);
      const roleNames = [row[4], row[6], row[8], row[10], row[12], row[14]]
        .map(clean)
        .filter(Boolean);

      if (assignedRoleTotalPoints > 0 || roleNames.length > 0) {
        addIssue(issues, {
          staffName: "Missing staff member",
          type: "Missing Staff Member",
          severity: "error",
          description: `Assigned Role row ${sourceRow} has ${round(
            assignedRoleTotalPoints
          )} role points but no valid staff member. Roles: ${
            roleNames.length > 0 ? roleNames.join(", ") : "No role name provided"
          }.`,
          sourceSheet: SHEETS.ASSIGNED_ROLE,
          sourceRow,
        });
      }

      continue;
    }

    const staff = staffByMember.get(staffMember);
    const staffId = staff?.staffId ?? parseStaffId(staffMember);

    scanRowForFormulaErrors(
      row,
      issues,
      SHEETS.ASSIGNED_ROLE,
      sourceRow,
      staffMember,
      staffId,
      staff?.department
    );

    if (!staff) {
      addIssue(issues, {
        staffId: userByStaffId.has(staffId) ? staffId : null,
        staffName: staffMember,
        department: null,
        type: "Unknown Staff Member",
        severity: "error",
        description: `${staffMember} appears in Data Entry - Assigned Role but is not listed in Source Information - Staff.`,
        sourceSheet: SHEETS.ASSIGNED_ROLE,
        sourceRow,
      });
    }

    const selfDirectedServicePoints = toNumber(row[2], 0);
    const assignedRoleTotalPoints = toNumber(row[3], 0);

    if (staff?.staffId) {
      const agg = ensureAgg(workloadAgg, staff.staffId);
      agg.service += selfDirectedServicePoints;
      agg.assignedRole += assignedRoleTotalPoints;
    }

    parsedAssignedRoles.push({
      sourceRow,
      staffMember,
      staffId: userByStaffId.has(staffId) ? staffId : null,
      fte: toNumber(row[1], 0),
      selfDirectedServicePoints,
      assignedRoleTotalPoints,
      role1: clean(row[4]),
      points1: toNumber(row[5], 0),
      role2: clean(row[6]),
      points2: toNumber(row[7], 0),
      role3: clean(row[8]),
      points3: toNumber(row[9], 0),
      role4: clean(row[10]),
      points4: toNumber(row[11], 0),
      role5: clean(row[12]),
      points5: toNumber(row[13], 0),
      role6: clean(row[14]),
      points6: toNumber(row[15], 0),
    });
  }

  const workloads = [];

  for (const staff of parsedStaff) {
    if (!staff.staffId) continue;

    const agg = workloadAgg.get(staff.staffId) || buildEmptyAgg();
    const existingUser = userByStaffId.get(staff.staffId);
    const inferredDepartments = [...agg.unitDepartments];

    const department =
      staff.department || existingUser?.department || inferredDepartments[0] || "Unassigned";

    const fte = staff.fte ?? 0;
    const expectedTotal = fte * 100;

    const teaching = round(agg.teaching);
    const assignedRole = round(agg.assignedRole);
    const service = round(agg.service);
    const hdSupervision = round(agg.hdr);
    const research = round(expectedTotal - teaching - assignedRole - service - hdSupervision);
    const total = round(teaching + assignedRole + service + hdSupervision + research);

    const targetBand = staff.targetBand || "Unknown";
    const calcBand = calculateBand(teaching, research);
    const hasDiscrepancy = normalizeBand(targetBand) !== normalizeBand(calcBand) ? 1 : 0;

    if (research < 0) {
      addIssue(issues, {
        staffId: staff.staffId,
        staffName: staff.staffMember,
        department,
        type: "Negative Research Workload",
        severity: "error",
        description: `${staff.staffMember} has ${research} research points after teaching, service, HDR, and assigned roles are deducted from expected workload ${round(expectedTotal)}.`,
        sourceSheet: "Calculated Workload Summary",
      });
    }

    const componentTotal = teaching + assignedRole + service + hdSupervision + research;

    if (Math.abs(componentTotal - expectedTotal) > 0.05) {
      addIssue(issues, {
        staffId: staff.staffId,
        staffName: staff.staffMember,
        department,
        type: "FTE Total Mismatch",
        severity: "warning",
        description: `Workload components sum to ${round(componentTotal)} but expected ${round(expectedTotal)} based on FTE ${fte}.`,
        sourceSheet: "Calculated Workload Summary",
      });
    }

    if (hasDiscrepancy) {
      addIssue(issues, {
        staffId: staff.staffId,
        staffName: staff.staffMember,
        department,
        type: "T:R Band Mismatch",
        severity: "warning",
        description: `Target band is ${targetBand}, but calculated band is ${calcBand}.`,
        sourceSheet: "Calculated Workload Summary",
      });
    }

    workloads.push({
      staffId: staff.staffId,
      name: staff.staffMember,
      department,
      fte,
      teaching,
      assignedRole,
      service,
      hdSupervision,
      research,
      total,
      targetBand,
      calcBand,
      hasDiscrepancy,
    });
  }

  let importBatchId;

  await db.exec("BEGIN TRANSACTION");

  try {
    const batchResult = await db.run(
      `INSERT INTO import_batches (filename, uploadedBy, importedAt, status, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        originalName,
        uploadedBy?.username || uploadedBy?.name || "unknown",
        new Date().toISOString(),
        "processing",
        "Import started. Data is stored under this import batch.",
      ]
    );

    importBatchId = batchResult.lastID;

    for (const staff of parsedStaff) {
      await db.run(
        `INSERT INTO staff_sources
        (importBatchId, staffId, staffMember, staffName, staffNumber, staffType, fte, function, targetTeachingPercent, targetResearchPercent, targetTRBalance, targetBand, department)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          importBatchId,
          staff.staffId,
          staff.staffMember,
          staff.staffName,
          staff.staffNumber,
          staff.staffType,
          staff.fte,
          staff.function,
          staff.targetTeachingPercent,
          staff.targetResearchPercent,
          staff.targetTRBalance,
          staff.targetBand,
          staff.department,
        ]
      );
    }

    for (const unit of parsedUnits) {
      await db.run(
        `INSERT INTO units
        (importBatchId, unitCode, unitName, groupedUnit, enrolment, expectedUCTariff, cwsHoursPerStudent)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          importBatchId,
          unit.unitCode,
          unit.unitName,
          unit.groupedUnit,
          unit.enrolment,
          unit.expectedUCTariff,
          unit.cwsHoursPerStudent,
        ]
      );
    }

    for (const role of parsedRoles) {
      await db.run(
        `INSERT INTO roles
        (importBatchId, category, roleName, hours, points, notes, name, rolePillars)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          importBatchId,
          role.category,
          role.roleName,
          role.hours,
          role.points,
          role.notes,
          role.name,
          role.rolePillars,
        ]
      );
    }

    for (const row of parsedTeaching) {
      await db.run(
        `INSERT INTO teaching_workloads
        (importBatchId, sourceRow, unitCode, staffType, staffMember, staffId, enrolment, duplicateCount, totalTeachingHours, totalTeachingPoints, unitCoordinationPoints, teachingActivityPoints, unitSupervisionPoints, newUnitDevelopmentPoints, totalDepartmentHours, isUnitCoordinator)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          importBatchId,
          row.sourceRow,
          row.unitCode,
          row.staffType,
          row.staffMember,
          row.staffId,
          row.enrolment,
          row.duplicateCount,
          row.totalTeachingHours,
          row.totalTeachingPoints,
          row.unitCoordinationPoints,
          row.teachingActivityPoints,
          row.unitSupervisionPoints,
          row.newUnitDevelopmentPoints,
          row.totalDepartmentHours,
          row.isUnitCoordinator,
        ]
      );
    }

    for (const row of parsedHdr) {
      await db.run(
        `INSERT INTO hdr_workloads
        (importBatchId, sourceRow, staffMember, staffId, fullTimeStudents, fullTimeProportion, partTimeStudents, partTimeProportion, totalSupervisionHours, workloadPoints)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          importBatchId,
          row.sourceRow,
          row.staffMember,
          row.staffId,
          row.fullTimeStudents,
          row.fullTimeProportion,
          row.partTimeStudents,
          row.partTimeProportion,
          row.totalSupervisionHours,
          row.workloadPoints,
        ]
      );
    }

    for (const row of parsedAssignedRoles) {
      await db.run(
        `INSERT INTO assigned_role_workloads
        (importBatchId, sourceRow, staffMember, staffId, fte, selfDirectedServicePoints, assignedRoleTotalPoints, role1, points1, role2, points2, role3, points3, role4, points4, role5, points5, role6, points6)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          importBatchId,
          row.sourceRow,
          row.staffMember,
          row.staffId,
          row.fte,
          row.selfDirectedServicePoints,
          row.assignedRoleTotalPoints,
          row.role1,
          row.points1,
          row.role2,
          row.points2,
          row.role3,
          row.points3,
          row.role4,
          row.points4,
          row.role5,
          row.points5,
          row.role6,
          row.points6,
        ]
      );
    }

    for (const workload of workloads) {
      await db.run(
        `INSERT INTO workloads
        (importBatchId, staffId, name, department, fte, teaching, assignedRole, service, hdSupervision, research, total, targetBand, calcBand, hasDiscrepancy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          importBatchId,
          workload.staffId,
          workload.name,
          workload.department,
          workload.fte,
          workload.teaching,
          workload.assignedRole,
          workload.service,
          workload.hdSupervision,
          workload.research,
          workload.total,
          workload.targetBand,
          workload.calcBand,
          workload.hasDiscrepancy,
        ]
      );
    }

    for (const issue of issues) {
      await insertIssue(db, importBatchId, issue);
    }

    await db.run(
      `UPDATE import_batches
       SET status = ?, staffCount = ?, unitCount = ?, roleCount = ?, teachingRowCount = ?, hdrRowCount = ?, assignedRoleRowCount = ?, workloadCount = ?, issueCount = ?, notes = ?
       WHERE id = ?`,
      [
        "completed",
        parsedStaff.length,
        parsedUnits.length,
        parsedRoles.length,
        parsedTeaching.length,
        parsedHdr.length,
        parsedAssignedRoles.length,
        workloads.length,
        issues.length,
        "Imported from workbook source/data-entry sheets. Report sheets were not used as source data.",
        importBatchId,
      ]
    );

    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");

    if (importBatchId) {
      await db.run(
        `UPDATE import_batches
         SET status = ?, notes = ?
         WHERE id = ?`,
        ["failed", error.message, importBatchId]
      ).catch(() => {});
    }

    throw error;
  }

  return {
    importBatchId,
    imported: {
      staff: parsedStaff.length,
      units: parsedUnits.length,
      roles: parsedRoles.length,
      teachingRows: parsedTeaching.length,
      hdrRows: parsedHdr.length,
      assignedRoleRows: parsedAssignedRoles.length,
      workloads: workloads.length,
    },
    validationIssues: issues.length,
  };
}

export async function getLatestImportReport(db, user) {
  const latestImport = await db.get(
    "SELECT * FROM import_batches WHERE status = 'completed' ORDER BY id DESC LIMIT 1"
  );

  if (!latestImport) {
    return {
      latestImport: null,
      workloads: [],
      validationIssues: [],
      issueSummary: [],
    };
  }

  const issueParams = [latestImport.id];
  let issueWhere = "WHERE importBatchId = ?";

  const workloadParams = [latestImport.id];
  let workloadWhere = "WHERE importBatchId = ?";

  if (user.role === "hod") {
    issueWhere += " AND department = ?";
    issueParams.push(user.department);

    workloadWhere += " AND department = ?";
    workloadParams.push(user.department);
  }

  const validationIssues = await db.all(
    `SELECT * FROM validation_issues ${issueWhere} ORDER BY severity ASC, type ASC, staffName ASC`,
    issueParams
  );

  const workloads = await db.all(
    `SELECT * FROM workloads ${workloadWhere} ORDER BY department ASC, name ASC`,
    workloadParams
  );

  const issueSummary = await db.all(
    `SELECT type, severity, COUNT(*) as count
     FROM validation_issues ${issueWhere}
     GROUP BY type, severity
     ORDER BY count DESC`,
    issueParams
  );

  return {
    latestImport,
    workloads,
    validationIssues,
    issueSummary,
  };
}