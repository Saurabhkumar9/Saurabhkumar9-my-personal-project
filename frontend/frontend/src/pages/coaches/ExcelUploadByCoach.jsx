import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ExcelUploadByCoach = () => {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const [uploadedData, setUploadedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const REQUIRED_COLUMNS = ["name", "fatherName", "motherName", "phone", "aadharNumber", "schoolName"];

  const ACCEPTED_COLUMN_VARIANTS = {
    name: ["name", "student name", "studentname", "name of student", "full name"],
    fatherName: ["fathername", "father name", "father's name", "father", "fathername"],
    motherName: ["mothername", "mother name", "mother's name", "mother", "mothername"],
    phone: ["phone", "phone number", "mobile", "mobile number", "contact", "contact number"],
    aadharNumber: ["aadharnumber", "aadhar number", "aadhar", "aadhar no", "aadhar card number"],
    schoolName: ["schoolname", "school name", "school", "institute", "institution name"]
  };

  const normalizeColumnName = (columnName) => {
    return columnName.toString().toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  };

  const findMatchingRequiredColumn = (fileColumn) => {
    const normalizedFileColumn = normalizeColumnName(fileColumn);
    for (const requiredColumn of REQUIRED_COLUMNS) {
      const acceptedVariants = ACCEPTED_COLUMN_VARIANTS[requiredColumn] || [requiredColumn];
      const normalizedVariants = acceptedVariants.map(variant => normalizeColumnName(variant));
      if (normalizedVariants.includes(normalizedFileColumn)) return requiredColumn;
    }
    return null;
  };

  const validateHeaders = (fileColumns) => {
    const missingColumns = [];
    for (const requiredColumn of REQUIRED_COLUMNS) {
      const foundColumn = fileColumns.find(fileCol => findMatchingRequiredColumn(fileCol) === requiredColumn);
      if (!foundColumn) missingColumns.push(requiredColumn);
    }
    return { missingColumns };
  };

  const transformDataWithMapping = (data) => {
    return data.map(row => {
      const transformedRow = {};
      Object.keys(row).forEach(fileColumn => {
        const requiredColumn = findMatchingRequiredColumn(fileColumn);
        if (requiredColumn) transformedRow[requiredColumn] = row[fileColumn];
      });
      return transformedRow;
    });
  };

  const validateRowData = (data) => {
    const errors = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // because row 1 is header

      // NAME
      if (!row.name?.toString().trim()) {
        errors.push(`Row ${rowNumber}: Name is required`);
      }

      // FATHER NAME
      if (!row.fatherName?.toString().trim()) {
        errors.push(`Row ${rowNumber}: Father Name is required`);
      }

      // PHONE (10 digits)
      const phone = row.phone?.toString().trim();
      if (!phone) {
        errors.push(`Row ${rowNumber}: Phone is required`);
      } 

      // AADHAR NUMBER (12 digits)
      const aadhar = row.aadharNumber?.toString().trim();
      if (!aadhar) {
        errors.push(`Row ${rowNumber}: Aadhar is required`);
      } 
    });

    return errors;
  };

  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        const headerRow = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" })[0];
        if (!headerRow?.length) {
          toast.error("Excel file is empty or headers missing!");
          return;
        }

        const fileColumns = headerRow.filter(col => col !== "");
        const { missingColumns } = validateHeaders(fileColumns);

        if (missingColumns.length > 0) {
          toast.error(`Missing columns: ${missingColumns.join(", ")}`);
          return;
        }

        // FIXED: Add range: 1 to skip header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          defval: "", 
          header: fileColumns,
          range: 1 // Skip first row (headers)
        });

        if (!jsonData.length) {
          toast.error("No data found after headers!");
          return;
        }

        const transformedData = transformDataWithMapping(jsonData);
        
        // Process ALL rows without skipping any
        const allData = transformedData.filter(row => {
          const hasData = Object.values(row).some(value => 
            value?.toString().trim() !== ''
          );
          return hasData;
        });

        if (allData.length === 0) {
          toast.error("No data found in the Excel file!");
          return;
        }

        const validationErrors = validateRowData(allData);
        
        if (validationErrors.length > 0) {
          validationErrors.slice(0, 3).forEach(error => toast.error(error));
          if (validationErrors.length > 3) toast.warning(`And ${validationErrors.length - 3} more errors...`);
          return;
        }

        setUploadedData(allData);
        toast.success(`Processed ${allData.length} student records from Excel!`);

      } catch (error) {
        console.error("Error processing Excel:", error);
        toast.error("Error processing Excel file");
      } finally {
        setIsProcessing(false);
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      toast.error("Error reading file");
      setIsProcessing(false);
      event.target.value = '';
    };

    reader.readAsArrayBuffer(file);
  };

  const confirmBulkUpload = () => {
    if (!uploadedData.length) {
      toast.error("Please upload Excel file first");
      return;
    }

    if (!batchId) {
      toast.error("Batch ID missing");
      return;
    }

    if (window.confirm(`Are you sure you want to register ${uploadedData.length} students? This action cannot be undone.`)) {
      handleBulkUpload();
    }
  };

  const handleBulkUpload = async () => {
    setIsUploading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/coach/bulk-upload-students/${batchId}`,
        { array: uploadedData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const result = response.data;

      if (result.success) {
        toast.success(`Uploaded: ${result.insertedCount}, Skipped: ${result.skippedCount}`);
        setUploadedData([]);
      } else {
        toast.error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response);
      toast.error(error.response?.data?.message || "Network error. Please check console for details.");
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDownloadTemplate = () => {
    if (window.confirm("Download Excel template with sample format?")) {
      downloadTemplate();
    }
  };

  const downloadTemplate = () => {
    try {
      const templateData = [
        ["name", "fatherName", "motherName", "phone", "aadharNumber", "schoolName"],
        ["John Doe", "Robert Doe", "Mary Doe", "9876543210", "123456789012", "ABC Public School"],
        ["Jane Smith", "Michael Smith", "Sarah Smith", "9876543211", "123456789013", "XYZ High School"]
      ];

      const ws = XLSX.utils.aoa_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "student_template.xlsx");
      toast.success("Template downloaded!");
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const confirmClearData = () => {
    if (uploadedData.length > 0 && window.confirm("Clear all uploaded data?")) {
      setUploadedData([]);
      toast.info("Data cleared");
    }
  };

  const confirmNavigateBack = () => {
    if (window.confirm("Go back? Unsaved data will be lost.")) {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4">
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Bulk Student Registration
          </h1>
          <p className="text-gray-600">
            Upload Excel file to add multiple students at once
            {batchId && <span className="block text-sm text-purple-600 mt-1">Batch ID: {batchId}</span>}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Upload Excel File</h2>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelUpload}
              className="hidden"
              id="excel-upload"
              disabled={isProcessing}
            />
            <label
              htmlFor="excel-upload"
              className={`cursor-pointer px-6 py-3 rounded-lg transition-colors inline-block ${
                isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              } text-white`}
            >
              {isProcessing ? "Processing..." : "Choose Excel File"}
            </label>
            <p className="text-gray-500 text-sm mt-4">Supported: .xlsx, .xls, .csv</p>
            {uploadedData.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-green-700 font-medium">✅ {uploadedData.length} students ready</p>
              </div>
            )}
          </div>

          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Format Requirements:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Columns: name, fatherName, motherName, phone, aadharNumber, schoolName</li>
              <li>• First row must contain headers</li>
              <li>• Phone: 10 digits, Aadhar: 12 digits</li>
              <li>• All non-empty rows will be processed exactly as they appear</li>
            </ul>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={confirmDownloadTemplate} className="flex-1 py-2.5 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Download Template
            </button>
            <button onClick={confirmNavigateBack} className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Back to Single
            </button>
          </div>

          {uploadedData.length > 0 && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={confirmBulkUpload}
                disabled={isUploading}
                className={`flex-1 py-3 px-4 rounded-lg ${
                  isUploading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                {isUploading ? "Uploading..." : `Register ${uploadedData.length} Students`}
              </button>
              <button onClick={confirmClearData} className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50">
                Clear
              </button>
            </div>
          )}
        </div>

        {uploadedData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Preview ({uploadedData.length} students)</h3>
              <span className="text-sm text-green-600 font-medium">Ready for upload</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {REQUIRED_COLUMNS.map(column => (
                      <th key={column} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uploadedData.slice(0, 10).map((student, index) => (
                    <tr key={index}>
                      {REQUIRED_COLUMNS.map(column => (
                        <td key={column} className="px-4 py-2 text-sm text-gray-900">
                          {student[column] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {uploadedData.length > 10 && (
                <p className="text-center text-gray-500 mt-2">
                  ... and {uploadedData.length - 10} more rows (showing first 10)
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelUploadByCoach;