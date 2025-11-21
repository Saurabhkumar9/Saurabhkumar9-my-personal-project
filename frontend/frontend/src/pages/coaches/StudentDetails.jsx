import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AttendanceModal from "../../components/ui/AttendanceModal";

const API_BASE = import.meta.env.VITE_BASE_URL;

const StudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState(null);
  const [feeRecords, setFeeRecords] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [open, setOpen] = useState(false);

  // Get token from localStorage (assuming it's needed for API calls)
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // Function to get headers with Authorization
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  // Fetch student data with fee details
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const studentRes = await axios.get(
        `${API_BASE}/coach/fetch-student-details/${studentId}`,
        getAuthHeaders()
      );

      if (studentRes.data.success && studentRes.data.student) {
        const studentData = studentRes.data.student;
        setStudent(studentData);
        
        setEditForm({
          name: studentData.name || "",
          fatherName: studentData.fatherName || "",
          motherName: studentData.motherName || "",
          phone: studentData.phone || "",
          aadharNumber: studentData.aadharNumber || "",
          schoolName: studentData.schoolName || "",
          address: studentData.address || "",
        });

        // Use batch fee from API response, default to 4000 if not available
        const batchFee = studentRes.data.batchfee || 4000;
        const monthlyFees = generateMonthlyFees(studentData.fee || [], batchFee);
        setFeeRecords(monthlyFees);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError("Failed to load student information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  // Generate monthly fee records (assuming a 12-month cycle for the current year)
  const generateMonthlyFees = (paidFees = [], batchFee = 4000) => {
    const currentYear = new Date().getFullYear();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return months.map((month, index) => {
      const monthYear = `${month} ${currentYear}`;
      
      // Find if this month is paid in database
      const paidFee = paidFees.find(fee => {
        // Handle common variations of month field from API
        const feeMonth = fee.month || fee.Month || fee.monthName; 
        return feeMonth === monthYear;
      });
      
      return {
        id: index + 1,
        month: monthYear,
        amount: batchFee, // Use the batch fee from API
        status: paidFee ? "paid" : "unpaid",
        paymentDate: paidFee ? (paidFee.date || paidFee.paymentDate || paidFee.Date || "").split('T')[0] : ""
      };
    });
  };

  // Handle fee payment/unpayment with confirmation
  const handleFeeAction = async (month, action) => {
    const actionText = action === 'pay' ? 'pay' : 'unpay';
    const confirmMessage = action === 'pay' 
      ? `Are you sure you want to mark the fee for ${month} as PAID?`
      : `Are you sure you want to UNPAY the fee for ${month}? This will remove the payment record.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setIsProcessing(true);
      const endpoint = action === 'pay' ? '/coach/pay/fee' : '/coach/unpay/fee';
      
      const response = await axios.post(`${API_BASE}${endpoint}`, {
        studentId: studentId,
        batchId: student.batchId,
        month: month
      }, getAuthHeaders());

      if (response.data.success) {
        const successMessage = action === 'pay' 
          ? `Fee for ${month} marked paid successfully!`
          : `Fee payment for ${month} removed successfully!`;
        
        toast.success(successMessage);
        await fetchStudentData(); // Refresh data
      }
    } catch (error) {
      console.error(`Error ${actionText}ing fee:`, error);
      const errorMessage = error.response?.data?.message || `Failed to ${actionText} fee`;
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle form input changes
  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  // Save updated student data
  const handleSaveEdit = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.post(
        `${API_BASE}/coach/update/student/${studentId}`,
        editForm,
        getAuthHeaders()
      );

      if (response.data.success) {
        setStudent(prev => ({ ...prev, ...editForm }));
        setIsEditing(false);
        toast.success("Student updated successfully!");
      } else {
        toast.error(response.data.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
        setIsProcessing(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditForm({
      name: student?.name || "",
      fatherName: student?.fatherName || "",
      motherName: student?.motherName || "",
      phone: student?.phone || "",
      aadharNumber: student?.aadharNumber || "",
      schoolName: student?.schoolName || "",
      address: student?.address || "",
    });
    setIsEditing(false);
  };

  // Delete student
  const handleDeleteStudent = async () => {
    if (window.confirm("Are you sure you want to delete this student permanently? This action cannot be undone.")) {
      try {
        const response = await axios.delete(
          `${API_BASE}/coach/delete/student/${studentId}`,
          getAuthHeaders()
        );

        if (response.data.success) {
          toast.success("Student deleted successfully!");
          navigate(-1);
        } else {
            toast.error(response.data.message || "Deletion failed");
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        toast.error(error.response?.data?.message || "Deletion failed");
      }
    }
  };

  // Calculate fee summary statistics
  const totalFees = feeRecords.reduce((sum, fee) => sum + fee.amount, 0);
  const paidFees = feeRecords.filter(f => f.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
  const pendingFees = feeRecords.filter(f => f.status === 'unpaid').reduce((sum, fee) => sum + fee.amount, 0);
  const paidMonths = feeRecords.filter(f => f.status === 'paid').length;
  const pendingMonths = feeRecords.filter(f => f.status === 'unpaid').length;

  // Format payment date for display
  const formatPaymentDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString; // Return original if formatting fails
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading student information...</p>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-6 p-4 bg-gray-50">
        <div className="text-red-600 text-xl font-bold">Error Loading Student</div>
        <p className="text-gray-600 text-center max-w-md">{error}</p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className=" p-2 sm:p-6 rounded-xl  mb-2 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="text-purple-600 hover:underline text-xs sm:text-sm mb-1 sm:mb-2"
              >
                ← Back to Previous Page
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{student?.name}</h1>
              <p className="text-gray-600 text-xs sm:text-sm">Batch: {student?.batchName}</p>
            </div>
            
            <div className="flex gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-600 transition-all text-xs sm:text-sm"
              >
                {isEditing ? "Cancel Edit" : "Edit Student"}
              </button>
              <button
                onClick={handleDeleteStudent}
                className="bg-red-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-red-600 transition-all text-xs sm:text-sm"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Student Information Card (using smaller text sizes for better fit) */}
          <div className=" p-2 sm:p-6 ">
          
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Student Information</h2>
          
            {isEditing ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Student Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Father Name</label>
                    <input
                      type="text"
                      name="fatherName"
                      value={editForm.fatherName}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Mother Name</label>
                    <input
                      type="text"
                      name="motherName"
                      value={editForm.motherName}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                    <input
                      type="text"
                      name="aadharNumber"
                      value={editForm.aadharNumber}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">School Name</label>
                    <input
                      type="text"
                      name="schoolName"
                      value={editForm.schoolName}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2 sm:pt-4">
                  <button
                    onClick={handleSaveEdit}
                    disabled={isProcessing}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isProcessing}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Student Name</label>
                    <p className="text-gray-900 text-sm font-medium">{student?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Father Name</label>
                    <p className="text-gray-900 text-sm">{student?.fatherName || 'N/A'}</p>
                  </div>

                </div>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Mother Name</label>
                    <p className="text-gray-900 text-sm">{student?.motherName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900 text-sm">{student?.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                    <p className="text-gray-900 text-sm">{student?.aadharNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">School Name</label>
                    <p className="text-gray-900 text-sm">{student?.schoolName || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900 text-sm">{student?.address || 'N/A'}</p>
                </div>
              </div>
            )}


<button
        onClick={() => setOpen(true)}
        className="bg-sky-500 text-white px-4 py-1 rounded mt-8"
      >Attendance history</button>
          </div>


          {/* Enhanced Fee Management Card */}
          <div className=" p-4 sm:p-6 ">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Fee Management</h2>
            
            {/* IMPROVED Fee Summary: grid-cols-2 for mobile, grid-cols-4 for larger screens */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 sm:mb-6">
                
                {/* Paid Amount Card */}
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                <p className="text-base sm:text-lg font-bold text-green-600">₹{paidFees}</p>
                <p className="text-xs text-green-700 font-medium whitespace-nowrap">Paid Amount</p>
                <p className="text-xs text-green-600 mt-1">{paidMonths} months</p>
              </div>

                {/* Pending Amount Card */}
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
                <p className="text-base sm:text-lg font-bold text-red-600">₹{pendingFees}</p>
                <p className="text-xs text-red-700 font-medium whitespace-nowrap">Pending Amount</p>
                <p className="text-xs text-red-600 mt-1">{pendingMonths} months</p>
              </div>

                {/* Monthly Fee Card - Moved next to Pending for better grouping on mobile*/}
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
                <p className="text-base sm:text-lg font-bold text-purple-600">₹{feeRecords[0]?.amount || 'N/A'}</p>
                <p className="text-xs text-purple-700 font-medium whitespace-nowrap">Monthly Fee</p>
                <p className="text-xs text-purple-600 mt-1">Per month</p>
              </div>
                
                {/* Total Fees Card - Moved to the end to prioritize Paid/Pending/Monthly */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
                <p className="text-base sm:text-lg font-bold text-blue-600">₹{totalFees}</p>
                <p className="text-xs text-blue-700 font-medium whitespace-nowrap">Total Fees</p>
                <p className="text-xs text-blue-600 mt-1">12 months</p>
              </div>
                
            </div>

            {/* Fee Records List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 sm:pr-2">
              {feeRecords.map((fee) => (
                <div 
                  key={fee.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border gap-2 ${
                    fee.status === 'paid' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex-1 min-w-0"> {/* Added min-w-0 to allow content to shrink */}
                    <div className="flex items-center gap-2 flex-wrap"> {/* Added flex-wrap for tight spaces */}
                      <p className="font-medium text-sm text-gray-800 whitespace-nowrap">{fee.month}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                        fee.status === 'paid' 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {fee.status === 'paid' ? 'PAID' : 'PENDING'}
                      </span>
                    </div>
                    
                    {fee.status === 'unpaid' && (
                        <p className="text-xs text-red-700 mt-1">
                            Amount: **₹{fee.amount}**
                        </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {fee.status === 'paid' ? (
                      <button
                        onClick={() => handleFeeAction(fee.month, 'unpay')}
                        disabled={isProcessing}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? "Wait..." : "Unmark"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFeeAction(fee.month, 'pay')}
                        disabled={isProcessing}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? "Wait..." : "Mark Paid"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

           <AttendanceModal
        isOpen={open}
        onClose={() => setOpen(false)}
        student={student}
      />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;