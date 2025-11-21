import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

export const CoachContext = createContext();

export const CoachProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all coaches for admin
  const fetchCoaches = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin/fetch/coaches`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success && data.coaches) {
        setCoaches(data.coaches);
      } else {
        setCoaches([]);
        setError("No coaches found");
      }
    } catch (err) {
      setCoaches([]);
      const errorMessage = err.response?.data?.message || "Failed to fetch coaches";
      setError(errorMessage);
      console.error("Fetch coaches error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new coach
  const createCoach = async (coachData) => {
    if (!isAuthenticated) {
      toast.error("Please login to create coach");
      return { success: false, message: "Not authenticated" };
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin/register/coach`,
        coachData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success) {
        setCoaches(prev => [...prev, data.coach]);
        setError("");
        toast.success("Coach created successfully! 🎉");
        return { success: true, coach: data.coach };
      } else {
        toast.error(data.message || "Failed to create coach");
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to create coach";
      console.error("Create coach error:", err);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Get available batches for assignment
  const getAvailableBatches = async (coachId = null) => {
    if (!isAuthenticated) return [];
    
    try {
      const url = coachId 
        ? `${import.meta.env.VITE_BASE_URL}/admin/available-batches?coachId=${coachId}`
        : `${import.meta.env.VITE_BASE_URL}/admin/available-batches`;
      
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (data.success) {
        return data.batches || [];
      }
      return [];
    } catch (err) {
      console.error("Get available batches error:", err);
      toast.error("Failed to load available batches");
      return [];
    }
  };

  // Assign batches to coach
  const assignBatchesToCoach = async (coachId, batchIds) => {
    if (!isAuthenticated) {
      toast.error("Please login to assign batches");
      return { success: false, message: "Not authenticated" };
    }

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/admin/assign/batch/${coachId}/assign-batches`,
        { batchIds },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success) {
        // Update local state
        setCoaches(prev =>
          prev.map(c => 
            c._id === coachId 
              ? { ...c, assignedBatches: data.coach.assignedBatches }
              : c
          )
        );
        toast.success("Batches assigned successfully! ✅");
        return { success: true, coach: data.coach };
      } else {
        toast.error(data.message || "Failed to assign batches");
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to assign batches";
      console.error("Assign batches error:", err);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Delete coach
  const deleteCoach = async (coachId) => {
    if (!isAuthenticated) {
      toast.error("Please login to delete coach");
      return { success: false, message: "Not authenticated" };
    }

    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/admin/delete/coach/${coachId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success) {
        setCoaches(prev => prev.filter(c => c._id !== coachId));
        toast.success("Coach deleted successfully! 🗑️");
        return { success: true };
      } else {
        toast.error(data.message || "Failed to delete coach");
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to delete coach";
      console.error("Delete coach error:", err);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Update coach status
  const updateCoachStatus = async (coachId, status) => {
    if (!isAuthenticated) {
      toast.error("Please login to update coach");
      return { success: false, message: "Not authenticated" };
    }

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/admin/update/coach/${coachId}/status`,
        { status },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success) {
        setCoaches(prev =>
          prev.map(c => (c._id === coachId ? { ...c, status } : c))
        );
        toast.success(`Coach ${status} successfully!`);
        return { success: true };
      } else {
        toast.error(data.message || "Failed to update coach status");
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update coach status";
      console.error("Update coach status error:", err);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Fetch coaches on component mount
  useEffect(() => {
    if (isAuthenticated) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === "admin") {
        fetchCoaches();
      }
    } else {
      setCoaches([]);
      setError("");
      setLoading(false);
    }
  }, [isAuthenticated]);

  const value = {
    coaches,
    loading,
    error,
    fetchCoaches,
    createCoach,
    deleteCoach,
    updateCoachStatus,
    assignBatchesToCoach,
    getAvailableBatches,
  };

  return <CoachContext.Provider value={value}>{children}</CoachContext.Provider>;
};

export const useCoach = () => useContext(CoachContext);