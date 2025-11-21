import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCoach } from "../context/CoachContext";
import { useBatch } from "../context/BatchContext";
import { toast } from "react-toastify";

const AssignBatches = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { coaches, assignBatchesToCoach } = useCoach();
  const { batches,fetchBatches } = useBatch();

  const [selectedBatches, setSelectedBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentCoach, setCurrentCoach] = useState(null);

  useEffect(() => {
    const coach = coaches.find(c => c._id === id);
    if (coach) {
      setCurrentCoach(coach);
      setSelectedBatches(coach.assignedBatches?.map(batch => batch._id) || []);
    }
  }, [id, coaches]);

  
  const unassignedBatches = useMemo(() => {
    if (!batches || !coaches) return [];
    
    // Get all assigned batch IDs across all coaches
    const allAssignedBatchIds = new Set();
    coaches.forEach(coach => {
      if (coach.assignedBatches && coach.assignedBatches.length > 0) {
        coach.assignedBatches.forEach(batch => {
          allAssignedBatchIds.add(batch._id);
        });
      }
    });

    // Filter batches that are not assigned to any coach
    return batches.filter(batch => !allAssignedBatchIds.has(batch._id));
  }, [batches, coaches]);

  const toggleBatchSelection = (batchId) => {
    setSelectedBatches((prev) =>
      prev.includes(batchId)
        ? prev.filter((id) => id !== batchId)
        : [...prev, batchId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentCoach) return;

    setLoading(true);
    try {
      const result = await assignBatchesToCoach(id, selectedBatches);
      if (result.success) {
        // toast.success("Batches assigned successfully!");
        fetchBatches()
        navigate(-1);
      } else {
        toast.error(result.message || "Failed to assign batches");
      }
    } catch (error) {
      console.error("Assign batches error:", error);
      toast.error("An error occurred while assigning batches");
    } finally {
      setLoading(false);
    }
  };

  if (!currentCoach) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading coach details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Enhanced Header with Gradient */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h1 className="text-sm sm:text-xl lg:text-xl font-bold bg-black bg-clip-text text-transparent mb-2">
            Assign Batches
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Assign batches to <span className="font-semibold text-purple-700">{currentCoach.name}</span>
          </p>
          <div className="w-24 h-1 bg-blue-400 mx-auto mt-3"></div>
        </div>

        {/* Enhanced Form Card */}
        <div className="rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Card Header Gradient */}
          <div className="bg-blue-500 px-6 py-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Batch Assignment
            </h2>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit}>
              {/* Current Assigned Batches - Enhanced */}
              {currentCoach.assignedBatches && currentCoach.assignedBatches.length > 0 && (
                <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-blue-800 text-sm sm:text-base">Currently Assigned Batches</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentCoach.assignedBatches.map((batch) => (
                      <span 
                        key={batch._id} 
                        className="bg-white text-blue-800 px-3 py-2 rounded-full text-xs sm:text-sm font-medium border border-blue-200 shadow-sm flex items-center gap-2"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {batch.batchName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Batch Selection - Enhanced */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <label className="block text-sm sm:text-base font-semibold text-gray-800">
                    Select Batches to Assign
                  </label>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {selectedBatches.length} selected
                  </span>
                </div>
                
                {unassignedBatches.length === 0 ? (
                  <div className="text-center p-6 sm:p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 transition-all duration-300 hover:border-purple-400 hover:bg-purple-50">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 mb-3 text-sm sm:text-base">No unassigned batches available</p>
                    <p className="text-gray-500 text-xs mb-4">All batches are currently assigned to coaches</p>
                    <button
                      type="button"
                      onClick={() => navigate("/admin/create-batch")}
                      className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition-colors px-4 py-2 rounded-lg hover:bg-purple-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create new batch
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 sm:max-h-80 overflow-y-auto p-3 border border-gray-200 rounded-xl bg-gray-50/50 custom-scrollbar">
                    {unassignedBatches.map((batch) => (
                      <label
                        key={batch._id}
                        className={`flex items-center space-x-3 p-3 sm:p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                          selectedBatches.includes(batch._id)
                            ? "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-300 shadow-md"
                            : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedBatches.includes(batch._id)}
                            onChange={() => toggleBatchSelection(batch._id)}
                            className="w-5 h-5 rounded border-2 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 cursor-pointer transition-all"
                          />
                          {selectedBatches.includes(batch._id) && (
                            <div className="absolute inset-0 bg-purple-100 rounded animate-ping opacity-30"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <span className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                              {batch.batchName}
                            </span>
                            {batch.timing && (
                              <span className="text-xs sm:text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full font-medium">
                                {batch.timing}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {batch.fee && (
                              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                Fee: ₹{batch.fee}
                              </span>
                            )}
                            {batch.weekDays && batch.weekDays.length > 0 && (
                              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                Days: {batch.weekDays.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {selectedBatches.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-green-700 text-sm font-medium">
                      Ready to assign {selectedBatches.length} batch{selectedBatches.length !== 1 ? 'es' : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Enhanced Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 py-3 px-4 sm:px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || selectedBatches.length === 0}
                  className="flex-1 py-3 px-4 sm:px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Assigning Batches...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Assign Batches</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="text-lg sm:text-xl font-bold text-purple-600">{batches.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Batches</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="text-lg sm:text-xl font-bold text-blue-600">{unassignedBatches.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Available</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="text-lg sm:text-xl font-bold text-green-600">{selectedBatches.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Selected</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="text-lg sm:text-xl font-bold text-orange-600">
              {currentCoach.assignedBatches?.length || 0}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Current</div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c7d2fe;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a5b4fc;
        }
      `}</style>
    </div>
  );
};

export default AssignBatches;