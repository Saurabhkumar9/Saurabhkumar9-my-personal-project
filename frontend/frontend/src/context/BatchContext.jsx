import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

export const BatchContext = createContext();

export const BatchProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Enhanced batch data transformer
  const transformBatchData = (batch) => ({
    ...batch,
    coachName: batch.coachName || "Not Assigned",
    weekDays: batch.weekDays || [],
    timing: batch.timing || "Not Assigned",
    fee: batch.fee || 0,
    status: batch.status || "active"
  });

  // Fetch batches based on user role
  const fetchBatches = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      // Only admin can fetch batches
      if (userData?.role !== "admin") {
        setBatches([]);
        setLoading(false);
        return;
      }

      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin/fetch/batch`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success && data.batches) {
        const transformedBatches = data.batches.map(transformBatchData);
        setBatches(transformedBatches);
      } else {
        setBatches([]);
        setError("No batches found. Please add a batch.");
      }
    } catch (err) {
      setBatches([]);
      const errorMessage = err.response?.data?.message || "Failed to fetch batches";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Fetch batches error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new batch with enhanced data
  const createBatch = async (batchData) => {
    if (!isAuthenticated) {
      toast.error("Please login to create batch");
      return { success: false, message: "Not authenticated" };
    }

    try {
      // Ensure weekDays is properly formatted
      const formattedData = {
        ...batchData,
        weekDays: Array.isArray(batchData.weekDays) ? batchData.weekDays : [],
        fee: Number(batchData.fee) || 0
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin/register/batch`,
        formattedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success) {
        const newBatch = transformBatchData(data.batch);
        setBatches(prev => [...prev, newBatch]);
        setError("");
        toast.success("Batch created successfully! 🎉");
        return { success: true, message: "Batch created successfully", batch: newBatch };
      } else {
        toast.error(data.message || "Failed to create batch");
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to create batch";
      console.error("Create batch error:", err);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Delete batch
  const deleteBatch = async (batchId) => {
    if (!isAuthenticated) {
      toast.error("Please login to delete batch");
      return { success: false, message: "Not authenticated" };
    }
    console.log(batchId)

    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/admin/delete/batch/${batchId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success) {
        setBatches(prev => prev.filter(b => b._id !== batchId));
        if (batches.length - 1 === 0) setError("No batches found. Please add a batch.");
        toast.success("Batch deleted successfully! 🗑️");
        return { success: true, message: "Batch deleted successfully" };
      } else {
        toast.error(data.message || "Failed to delete batch");
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to delete batch";
      console.error("Delete batch error:", err);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Enhanced update batch - now includes weekDays
  const updateBatch = async (batchId, updateData) => {
    if (!isAuthenticated) {
      toast.error("Please login to update batch");
      return { success: false, message: "Not authenticated" };
    }

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/admin/update/batch/${batchId}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success) {
        const updatedBatch = transformBatchData(data.batch);
        setBatches(prev =>
          prev.map(b => (b._id === batchId ? updatedBatch : b))
        );
        toast.success("Batch updated successfully! ✅");
        return { success: true, message: "Batch updated successfully", batch: updatedBatch };
      } else {
        toast.error(data.message || "Failed to update batch");
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update batch";
      console.error("Update batch error:", err);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Fetch batches on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchBatches();
    } else {
      setBatches([]);
      setError("");
      setLoading(false);
    }
  }, [isAuthenticated]);

  const value = {
    batches,
    loading,
    error,
    fetchBatches,
    createBatch,
    updateBatch,
    deleteBatch,
  };

  return <BatchContext.Provider value={value}>{children}</BatchContext.Provider>;
};

export const useBatch = () => useContext(BatchContext);