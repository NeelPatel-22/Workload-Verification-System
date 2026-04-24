export function validateWorkloads(workloads) {
  const issues = [];

  workloads.forEach((workload) => {
    // Invalid input check (such as missing fte values, total and missing research values)
    const invalidFields = [];

    if (workload.fte == null) {
      invalidFields.push("fte");
    } else if (isNaN(workload.fte)) {
      invalidFields.push("fte");
    } else if (workload.fte < 0) {
      invalidFields.push("fte");
    }

    if (workload.total == null) {
      invalidFields.push("total");
    } else if (isNaN(workload.total)) {
      invalidFields.push("total");
    } else if (workload.total < 0) {
      invalidFields.push("total");
    }

    if (workload.research == null) {
      invalidFields.push("research");
    } else if (isNaN(workload.research)) {
      invalidFields.push("research");
    } else if (workload.research < 0) {
      invalidFields.push("research");
    }

    // Creating issue for any invalid or missing field
    if (invalidFields.length > 0) {
      issues.push({
        id: issues.length + 1,
        staffId: workload.staffId,
        staffName: workload.name,
        department: workload.department,
        type: "Invalid Input Data",
        severity: "error",
        description: `Invalid or missing values found for: ${invalidFields.join(", ")}.`,
      });
      return;
    }

    let researchRatio = 0;

    let calculatedBand = "";

    // Handling invalid total work value (used to calculate band ratio)
    if (workload.total <= 0) {
      issues.push({
      id: issues.length + 1,
      staffId: workload.staffId,
      staffName: workload.name,
      department: workload.department,
      type: "Invalid Total Workload",
      severity: "error",
      description: "Total assigned workload must be greater than 0",
    });
    } else {
      researchRatio = workload.research / workload.total;
      
      // Calculating TR band ratio
      if (researchRatio >= 0.7) {
        calculatedBand = "Research Focused";
      } else if (researchRatio >= 0.3) {
        calculatedBand = "Balanced T&R";
      } else {
        calculatedBand = "Teaching Focused";
      }

    if (calculatedBand !== workload.targetBand) {
      issues.push({
        id: issues.length + 1,
        staffId: workload.staffId,
        staffName: workload.name,
        department: workload.department,
        type: "T:R Band Mismatch",
        severity: "warning",
        description: `Expected target band is ${workload.targetBand}, but based on validation rules the calculated band is ${calculatedBand}.`,
      });
    }

    const expectedTotal = workload.fte * 100;
    const underloadDifference = expectedTotal - workload.total;

    // Handling overload issue

    if (workload.total > expectedTotal) {
      issues.push({
        id: issues.length + 1,
        staffId: workload.staffId,
        staffName: workload.name,
        department: workload.department,
        type: "FTE Overload Mismatch",
        severity: "error",
        description: `Expected total workload is ${expectedTotal}, but assigned workload is ${workload.total}, which exceeds the allowed FTE allocation.`,
      });
    }

    // Handling underload issue

    if (underloadDifference > 5) {
      issues.push({
        id: issues.length + 1,
        staffId: workload.staffId,
        staffName: workload.name,
        department: workload.department,
        type: "FTE Underload Mismatch",
        severity: "warning",
        description: `Expected total workload is ${expectedTotal}, but assigned workload is ${workload.total}, which is below the acceptable allocation range.`,
      });
    }
  }
  });

  return issues;
}