import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useCoach } from "../../context/CoachContext";

const CreateCoach = () => {
  const navigate = useNavigate();
  const { createCoach, getAvailableBatches } = useCoach();

  const [selectedBatches, setSelectedBatches] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm();

  // Load available batches (only unassigned ones)
  useEffect(() => {
    const loadAvailableBatches = async () => {
      setLoadingBatches(true);
      try {
        const batches = await getAvailableBatches();
        setAvailableBatches(batches);
      } catch (error) {
        console.error("Error loading available batches:", error);
        setAvailableBatches([]);
      } finally {
        setLoadingBatches(false);
      }
    };

    loadAvailableBatches();
  }, [getAvailableBatches]);

  // Toggle batch selection
  const toggleBatchSelection = (batchId) => {
    setSelectedBatches((prev) =>
      prev.includes(batchId)
        ? prev.filter((id) => id !== batchId)
        : [...prev, batchId]
    );
  };

  // Submit Handler
  const onSubmit = async (data) => {
    try {
      const coachData = {
        ...data,
        batches: selectedBatches,
      };
      
      const result = await createCoach(coachData);
      
      if (result.success) {
        reset();
        setSelectedBatches([]);
        navigate(-1); // Redirect to coaches list
      }
    } catch (error) {
      console.error("Create coach error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Add New Coach
          </h1>
          <p className="text-gray-600">Create a new coaching staff member</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register("name", {
                    required: "Name is required",
                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                  })}
                  placeholder="Enter coach name"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  placeholder="coach@example.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Phone + Batch Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  {...register("phone", {
                    required: "Phone is required",
                    pattern: { 
                      value: /^[6-9]\d{9}$/, 
                      message: "Enter a valid 10-digit Indian number" 
                    },
                  })}
                  placeholder="9876543210"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Batch Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Assign Batches (Optional)
                  <span className="text-xs text-gray-500 ml-2">
                    Only unassigned batches are shown
                  </span>
                </label>
                
                {loadingBatches ? (
                  <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-gray-600 text-sm">Loading available batches...</p>
                  </div>
                ) : availableBatches.length === 0 ? (
                  <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-gray-600 text-sm mb-2">No batches available for assignment</p>
                    <button
                      type="button"
                      onClick={() => navigate("/admin/create-batch")}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      Create batches first
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
                      {availableBatches.map((batch) => (
                        <label
                          key={batch._id}
                          className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                            selectedBatches.includes(batch._id) 
                              ? 'bg-purple-50 border border-purple-200' 
                              : 'hover:bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedBatches.includes(batch._id)}
                            onChange={() => toggleBatchSelection(batch._id)}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-700 block">
                              {batch.batchName}
                            </span>
                            <span className="text-xs text-gray-500 block">
                              {batch.timing} • ₹{batch.fee}
                            </span>
                            {batch.weekDays && batch.weekDays.length > 0 && (
                              <span className="text-xs text-gray-400 block">
                                {batch.weekDays.map(day => day.slice(0, 3)).join(', ')}
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>

                    {selectedBatches.length > 0 && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 text-sm font-medium">
                          ✅ {selectedBatches.length} batch(es) selected
                        </p>
                        <div className="mt-1 text-xs text-green-600">
                          {selectedBatches.map(batchId => {
                            const batch = availableBatches.find(b => b._id === batchId);
                            return batch ? (
                              <div key={batchId}>• {batch.batchName} ({batch.timing})</div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {selectedBatches.length === 0 && availableBatches.length > 0 && (
                      <p className="text-gray-500 text-xs mt-2">
                        💡 No batches selected. Coach can be created without batches.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 py-3 px-4 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  "Create Coach"
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default CreateCoach;