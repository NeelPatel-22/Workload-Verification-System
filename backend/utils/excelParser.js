import XLSX from "xlsx";

const selectedSheets = ["Report - Staff Member", "Data Entry - Teaching", "Data Entry - Assigned Role", "Data Entry - HDR",];

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

    return parsedData;
  } catch (error) {
    console.error("Error parsing Excel file:", error.message);
    return {};
  }
};

export { parseExcel };