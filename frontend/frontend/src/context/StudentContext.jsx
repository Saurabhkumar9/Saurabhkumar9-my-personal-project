import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // Import toast here

const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Get all students
  const getAllStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin/fetch-students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setStudents(response.data.data.students || []);
      } else {
        setError(response.data.message || "Failed to fetch students");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error loading students";
      setError(errorMsg);
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new student - FIXED VERSION
  const createStudent = async (batchId, studentData) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        toast.error("Authentication required");
        return { success: false, error: "Authentication required" };
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin/register/student/${batchId}`,
        studentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setStudents((prev) => [response.data.data, ...prev]);
        toast.success(
          response.data.message || "Student registered successfully!"
        );
        return { success: true, data: response.data.data };
      } else {
        toast.error(response.data.message || "Failed to create student");
        return { success: false, error: response.data.message };
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to create student";

      // Handle specific error cases
      if (err.response?.status === 409) {
      } else if (err.response?.status === 400) {
        toast.error("Please check all required fields");
      } else {
        toast.error(errorMsg);
      }

      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Delete student
  const deleteStudent = async (studentId) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      console.log(token);
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/admin/delete/student/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setStudents((prev) =>
          prev.filter((student) => student._id !== studentId)
        );
        // toast.success("Student deleted successfully");
        return { success: true };
      } else {
        toast.error(response.data.message || "Failed to delete student");
        return { success: false, error: response.data.message };
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to delete student";
      toast.error(errorMsg);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Load students when component mounts
  useEffect(() => {
    const user1 = JSON.parse(localStorage.getItem("user"));

    // console.log(user1?.role); // NOW works

    if (user1?.role === "admin") {
      getAllStudents();
    }
  }, []);

  const value = {
    students,
    loading,
    error,
    getAllStudents,
    createStudent,
    deleteStudent,
    clearError,
  };

  return (
    <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within StudentProvider");
  }
  return context;
};
