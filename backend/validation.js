export function validateWorkloads(workloads) {
  const issues = [];

  workloads.forEach((workload) => {
    const researchRatio = workload.research / workload.total;

    let calculatedBand = "";

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
  });

  return issues;
}