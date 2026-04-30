import XLSX from "xlsx";

const selectedSheets = ["Report - Staff Member", "Data Entry - Teaching", "Data Entry - Assigned Role", "Data Entry - HDR",];

const CleanDataEntryTeaching = (rows) => {
  return rows
    .filter((row) => row[""] && row["_1"] && row[""] !== "Unit Code")
    .map((row) => {
      return {
        unitCode: row[""],
        staffType: row[" <-- filter dropdowns -->"] || "",
        staffName: row["_1"],
        teachingScaledHours: row["Total Teaching Workload"] || 0,
        teachingWLPoints: row["__EMPTY_5"] || 0,
      };
    });
};

const GroupingDataTeaching = (teachingRows) => {
  const groupedData = {};

  teachingRows.forEach((row) => {
    if (!groupedData[row.staffName]) {
      groupedData[row.staffName] = {
        StaffName: row.staffName,
        StaffType: row.staffType,
        TotalTeachingScaledHours: 0,
        TotalTeachingWLPoints: 0,
        UnitCodes: [],
      };
    }

    groupedData[row.staffName].TotalTeachingScaledHours += row.teachingScaledHours;
    groupedData[row.staffName].TotalTeachingWLPoints += row.teachingWLPoints;
    groupedData[row.staffName].UnitCodes.push(row.unitCode);
  });

  return Object.values(groupedData);
};

const parseExcel = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);

    const parsedData = {};

    selectedSheets.forEach((sheetName) => {
      if (workbook.Sheets[sheetName]) {
        parsedData[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      } else {
        parsedData[sheetName] = [];
      }
    });

    if (parsedData["Data Entry - Teaching"]) {
      parsedData["Data Entry - Teaching"] = GroupingDataTeaching(CleanDataEntryTeaching(parsedData["Data Entry - Teaching"]));
    }

    return parsedData;
  } catch (error) {
    console.error("Error parsing Excel file:", error.message);
    return {};
  }
};

export { parseExcel };