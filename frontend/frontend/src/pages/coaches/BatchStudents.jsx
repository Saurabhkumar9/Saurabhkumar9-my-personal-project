import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { IoSearchSharp } from "react-icons/io5";

const API_BASE = import.meta.env.VITE_BASE_URL;

const BatchStudents = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedStudentFee, setSelectedStudentFee] = useState(null);

  // Fetch students data
  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!batchId) {
          setError("Batch ID is missing");
          return;
        }

        const studentsRes = await axios.get(
          `${API_BASE}/coach/fetch-student/belong-to-coach/${batchId}`
        );

        if (studentsRes.data.success && studentsRes.data.students) {
          const sortedStudents = sortStudents(studentsRes.data.students, "asc");
          setStudents(sortedStudents);
          setFilteredStudents(sortedStudents);
          // toast.success(`Loaded ${studentsRes.data.students.length} students successfully`);
        } else {
          setStudents([]);
          setFilteredStudents([]);
          toast.info("No students found in this batch");
        }
      } catch (error) {
        console.error("Error fetching batch data:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Failed to load batch information. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
        setStudents([]);
        setFilteredStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBatchData();
  }, [batchId]);

  // Helper functions
  const hasAttendanceForToday = (student) => {
    if (!student.attendance || !Array.isArray(student.attendance)) return false;

    const today = selectedDate;
    return student.attendance.some((record) => {
      const recordDate = record.date
        ? record.date.split("T")[0]
        : record.Date
        ? record.Date.split("T")[0]
        : "";
      return recordDate === today && record.status === "present";
    });
  };

  const getLastFeeStatus = (student) => {
    if (
      !student.fee ||
      !Array.isArray(student.fee) ||
      student.fee.length === 0
    ) {
      return { lastFeeMonth: "No fee record", status: "unpaid", amount: 0 };
    }

    
    const sortedFees = [...student.fee].sort((a, b) => {
      const monthOrder = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const getMonthIndex = (monthStr) => {
        
        const month = monthStr.split(" ")[0];
        return monthOrder.indexOf(month);
      };

      return getMonthIndex(b.month) - getMonthIndex(a.month);
    });

    const lastFee = sortedFees[0];
    return {
      lastFeeMonth: lastFee.month,
      status: lastFee.status,
      amount: lastFee.amount,
    };
  };

  const sortStudents = (studentsList, order) => {
    return [...studentsList].sort((a, b) => {
      const nameA = a.name?.toLowerCase() || "";
      const nameB = b.name?.toLowerCase() || "";
      return order === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  };

  const getMonthName = (monthNumber) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNumber - 1] || "Unknown Month";
  };

  // Search and filter
  const handleSearch = (term) => {
    setSearchTerm(term);
    const termLower = term.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.name?.toLowerCase().includes(termLower) ||
        student.fatherName?.toLowerCase().includes(termLower) ||
        student.phone?.includes(term) ||
        student.aadharNumber?.includes(term)
    );
    const sorted = sortStudents(filtered, sortOrder);
    setFilteredStudents(sorted);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
    const sorted = sortStudents(filteredStudents, order);
    setFilteredStudents(sorted);
  };

  // Update filtered students when students change
  useEffect(() => {
    const filtered =
      searchTerm.trim() === ""
        ? students
        : students.filter(
            (student) =>
              student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              student.fatherName
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              student.phone?.includes(searchTerm) ||
              student.aadharNumber?.includes(searchTerm)
          );

    const sorted = sortStudents(filtered, sortOrder);
    setFilteredStudents(sorted);
  }, [students, searchTerm, sortOrder]);

  // Selection functions
  const toggleStudentSelection = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id)
        ? prev.filter((studentId) => studentId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s._id));
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    if (
      filteredStudents.length > 0 &&
      selectedStudents.length === filteredStudents.length
    ) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedStudents, filteredStudents]);

  // Show fee history
  const showFeeHistory = (student) => {
    setSelectedStudentFee(student);
  };

  const closeFeeHistory = () => {
    setSelectedStudentFee(null);
  };

  // Confirmation dialog function
  const confirmAction = (message, onConfirm) => {
    if (window.confirm(message)) {
      onConfirm();
    }
  };

  // Common function for API calls
  const makeApiCall = async (
    apiCall,
    successMessage,
    errorMessage = "Failed to complete action. Please try again."
  ) => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student!");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiCall();

      // Show backend response if available
      if (response.data && response.data.message) {
        toast.success(response.data.message);
      } else {
        toast.success(successMessage);
      }

      // Refresh students data
      const studentsRes = await axios.get(
        `${API_BASE}/coach/fetch-student/belong-to-coach/${batchId}`
      );

      if (studentsRes.data.success && studentsRes.data.students) {
        const sortedStudents = sortStudents(
          studentsRes.data.students,
          sortOrder
        );
        setStudents(sortedStudents);
        setFilteredStudents(sortedStudents);
      }

      setSelectedStudents([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error:", error);
      const backendError = error.response?.data?.message || errorMessage;
      toast.error(backendError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action functions
  const markAttendance = () => {
    confirmAction(
      `Are you sure you want to mark ${selectedStudents.length} students as present for today?`,
      () =>
        makeApiCall(
          () =>
            axios.post(`${API_BASE}/coach/marked/attendance`, {
              presentStudents: selectedStudents,
            }),
          `Attendance marked for ${selectedStudents.length} students`,
          "Failed to mark attendance. Please try again."
        )
    );
  };

  const unmarkAttendance = () => {
    confirmAction(
      `Are you sure you want to unmark attendance for ${selectedStudents.length} students?`,
      () =>
        makeApiCall(
          () =>
            axios.post(`${API_BASE}/coach/unmarked/attendance`, {
              studentIds: selectedStudents,
            }),
          `Attendance unmarked for ${selectedStudents.length} students`,
          "Failed to unmark attendance. Please try again."
        )
    );
  };

  const payFeeForCurrentMonth = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const monthName = getMonthName(currentMonth);

    confirmAction(
      `Are you sure you want to mark fee as paid for ${selectedStudents.length} students for ${monthName} ${currentYear}?`,
      () =>
        makeApiCall(
          () =>
            axios.post(
              `${API_BASE}/coach/pay/fee/multiple-student/currentmonth`,
              {
                studentIds: selectedStudents,
                batchId: batchId,
                month: currentMonth,
                year: currentYear,
              }
            ),
          `Fee paid for ${selectedStudents.length} students for ${monthName} ${currentYear}`,
          "Failed to process fee payment. Please try again."
        )
    );
  };

  // Calculate attendance stats
  const getAttendanceStats = () => {
    const presentCount = students.filter((student) =>
      hasAttendanceForToday(student)
    ).length;
    const absentCount = students.length - presentCount;
    return { presentCount, absentCount };
  };

  const { presentCount, absentCount } = getAttendanceStats();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm">Loading batch information...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 p-4">
        <div className="text-red-600 text-lg font-bold">
          Error Loading Batch
        </div>
        <p className="text-gray-600 text-center max-w-sm text-sm">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Action Button Component - Reduced size
  const ActionButton = ({
    onClick,
    disabled,
    color,
    children,
    loadingText,
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2 py-1 sm:p-2 rounded-lg text-white font-medium text-xs transition-colors w-full sm:w-auto ${
        disabled ? "bg-gray-400 cursor-not-allowed" : color
      }`}
    >
      {isSubmitting ? (
        <span className="flex items-center gap-1 justify-center">
          <div className="w-3 h-3 border-1 border-white border-t-transparent rounded-full animate-spin"></div>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      {/* Fee History Modal (Modal size reduced) */}
      {selectedStudentFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-md font-semibold text-gray-800">
                Fee History - {selectedStudentFee.name}
              </h3>
              <button
                onClick={closeFeeHistory}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-3">
              {selectedStudentFee.fee && selectedStudentFee.fee.length > 0 ? (
                <div className="space-y-2">
                  {selectedStudentFee.fee.map((feeRecord, index) => (
                    <div
                      key={feeRecord._id || index}
                      className={`p-2 rounded-lg border text-sm ${
                        feeRecord.status === "paid"
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">
                          {feeRecord.month}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            feeRecord.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {feeRecord.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        Amount: ₹{feeRecord.amount}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No fee records found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto overflow-hidden">
        {/* Header Section - Reduced padding and text size */}
        <div className="  text-white p-3">
          <div className="flex  flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex  gap-2">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1 text-sm font-medium text-black  bg-purple-500 hover:bg-purple-600 px-2 py-1.5 rounded-lg transition-all duration-200"
              >
                ← Back to Dashboard
              </button>
            </div>

            <button
              onClick={() => navigate(`/coach/create/student/${batchId}`)}
              className="inline-flex items-center gap-1 bg-green-600 text-white hover:bg-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              + Add Student
            </button>
          </div>
        </div>

        {/* Content Section - Reduced padding */}
        <div className="p-3 sm:p-5">
          {/* Search and Filter Section - Stacked on mobile */}
          <div className="flex mb-4">
           
              
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-3/2 sm:w-1/2  px-3 py-2 border border-gray-300 border-r-0   text-sm"
                />
                <div className=" text-black px-3 border border-gray-300 border-l-0 pt-2 text-xl ">
                  <IoSearchSharp size={20}/>
                
            </div>
          </div>

          {/* Stats Summary - Now 2x2 on mobile, 4 in a row on desktop */}
          <div className="grid grid-cols-4  gap-3 mb-4">
            <div
              className={`bg-blue-50 border border-blue-200 rounded-lg p-2 text-start md:text-center transition-shadow duration-300 hover:shadow-md`}
            >
              <div className="text-sm sm:text-xl font-bold text-blue-600">
                {students.length}
              </div>
              <div className="text-blue-700 text-xs mt-0.5">Total Students</div>
            </div>
            <div
              className={`bg-green-50 border border-green-200 rounded-lg p-2 text-center transition-shadow duration-300 hover:shadow-md`}
            >
              <div className="text-sm sm:text-xl font-bold text-green-600">
                {presentCount}
              </div>
              <div className="text-green-700 text-xs mt-0.5">Present Today</div>
            </div>
            <div
              className={`bg-orange-50 border border-orange-200 rounded-lg p-2 text-center transition-shadow duration-300 hover:shadow-md`}
            >
              <div className="text-sm sm:text:xl font-bold text-orange-600">
                {absentCount}
              </div>
              <div className="text-orange-700 text-xs  mt-0.5">Absent Today</div>
            </div>
            <div
              className={`bg-purple-50 border border-purple-200 rounded-lg p-2 text-center transition-shadow duration-300 hover:shadow-md`}
            >
              <div className="text-sm sm:text:xl font-bold text-purple-600">
                {selectedStudents.length}
              </div>
              <div className="text-purple-700 text-xs mt-0.5">Selected</div>
            </div>
          </div>

          {/* Action Buttons - Compact layout */}
          <div className="flex p-2 gap-1 justify-between sm:justify-between">
            <div className="flex gap-1 sm:gap-2 justify-between sm:justify-between">
              <ActionButton
              onClick={markAttendance}
              disabled={isSubmitting || selectedStudents.length === 0}
              color="bg-green-600 hover:bg-green-700"
              loadingText="Marking..."
              className="text-xs px-2  py-2 sm:text-sm sm:px-4 sm:py-2"
            >
              Mark Present ({selectedStudents.length})
            </ActionButton>

            <ActionButton
              onClick={unmarkAttendance}
              disabled={isSubmitting || selectedStudents.length === 0}
              color="bg-red-600 hover:bg-red-700"
              loadingText="Unmarking..."
              className="text-sm px-1 py-1 sm:text-sm sm:px-4 sm:py-2"
            >
              Unmark Attendance ({selectedStudents.length})
            </ActionButton>
            </div>

            <ActionButton
              onClick={payFeeForCurrentMonth}
              disabled={isSubmitting || selectedStudents.length === 0}
              color="bg-blue-600 hover:bg-blue-700"
              loadingText="Processing..."
              className="text-sm px-1 py-1 sm:text-sm sm:px-4 sm:py-2"
            >
              Paid Fee (Current Month - {selectedStudents.length})
            </ActionButton>
          </div>

          {/* Students Table */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mt-4">
              <div className="text-gray-400 text-5xl mb-3">
                {searchTerm ? "🔍" : "👨‍🎓"}
              </div>
              <h3 className="text-gray-500 text-md font-semibold mb-1">
                {searchTerm ? "No Students Found" : "No Students Found"}
              </h3>
              <p className="text-gray-400 max-w-xs mx-auto text-sm">
                {searchTerm
                  ? "No students match your search criteria. Try different keywords."
                  : "There are no students currently enrolled in this batch."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => handleSearch("")}
                  className="mt-3 bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto border border-gray-200 rounded-lg mt-4">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-2 sm:p-3 text-left w-10">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={toggleSelectAll}
                          className="w-3 h-3 sm:w-4 sm:h-4 accent-purple-600 rounded"
                        />
                      </th>
                      <th className="p-2 sm:p-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                        Student Name
                      </th>
                      <th className="p-2 sm:p-3 text-left font-semibold text-gray-700 whitespace-nowrap hidden sm:table-cell">
                        Phone
                      </th>
                      <th className="p-2 sm:p-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                        Last Fee Status
                      </th>
                      <th className="p-2 sm:p-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                        Attendance
                      </th>
                      <th className="p-2 sm:p-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => {
                      const isPresent = hasAttendanceForToday(student);
                      const isSelected = selectedStudents.includes(student._id);
                      const lastFee = getLastFeeStatus(student);

                      return (
                        <tr
                          key={student._id}
                          className={`border-b border-gray-100 transition-colors ${
                            isSelected ? "bg-purple-50" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="p-2 sm:p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                toggleStudentSelection(student._id)
                              }
                              className="w-3 h-3 sm:w-4 sm:h-4 accent-purple-600 rounded"
                            />
                          </td>
                          <td className="p-2 sm:p-3">
                            <div className="font-medium text-gray-900">
                              {student.name}
                            </div>
                            {student.fatherName && (
                              <div className="text-gray-500 text-xs hidden sm:block">
                                Father: {student.fatherName}
                              </div>
                            )}
                            <div className="text-gray-600 text-xs block sm:hidden">
                              P: {student.phone}
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 text-gray-600 hidden sm:table-cell">
                            {student.phone}
                          </td>
                          <td className="p-2 sm:p-3">
                            <div
                              className="cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => showFeeHistory(student)}
                              title="Click to view full fee history"
                            >
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  lastFee.status === "paid"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {lastFee.lastFeeMonth.split(" ")[0]} -{" "}
                                {lastFee.status}
                              </span>
                              {lastFee.amount > 0 && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  ₹{lastFee.amount}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2 sm:p-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                isPresent
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {isPresent ? "Present" : "Absent"}
                            </span>
                          </td>
                          <td className="p-2 sm:p-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/coach/student/details/${student._id}`
                                  )
                                }
                                className="bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => showFeeHistory(student)}
                                className="bg-purple-500 text-white px-2 py-1 rounded-lg hover:bg-purple-600 transition-colors text-xs font-medium"
                              >
                                Fee
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 text-xs sm:text-sm text-gray-600">
                Showing **{filteredStudents.length}** of **{students.length}**
                students
                {searchTerm && ` for "${searchTerm}"`}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchStudents;
