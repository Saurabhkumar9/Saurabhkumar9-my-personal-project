import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const UnassignBatches = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [coach, setCoach] = useState(null);
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCoach = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/fetch/coachById/${id}`);
        if (response.data.success) setCoach(response.data.coach);
      } catch (error) {
        toast.error("Failed to load coach data");
      }
    };
    fetchCoach();
  }, [id]);

  const toggleSelect = (batchId) => {
    setSelectedBatchIds(prev => prev.includes(batchId) 
      ? prev.filter(id => id !== batchId) 
      : [...prev, batchId]
    );
  };

  const selectAll = () => {
    setSelectedBatchIds(coach.assignedBatches.length === selectedBatchIds.length ? [] : coach.assignedBatches.map(b => b._id));
  };

  const handleUnassign = async () => {
    if (selectedBatchIds.length === 0) {
      toast.error("Please select batches to unassign");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/admin/unassign/batch/${id}`, {
        batchIds: selectedBatchIds
      });

      const res = response.data;
      if (res.success) {
        toast.success(res.message);
        setCoach(prev => ({
          ...prev,
          assignedBatches: prev.assignedBatches.filter(b => !selectedBatchIds.includes(b._id))
        }));
        setSelectedBatchIds([]);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Network error occurred");
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  if (!coach) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading coach details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unassign Batches</h1>
          <p className="text-gray-600">From <span className="font-semibold text-blue-700">{coach.name}</span></p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
            <h2 className="text-lg font-bold text-white">Select Batches to Unassign</h2>
          </div>

          <div className="p-6">
            {/* Selection Actions */}
            {coach.assignedBatches.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="font-semibold text-blue-800">{selectedBatchIds.length} selected</p>
                    <p className="text-blue-600 text-sm">Choose batches to remove</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100">
                      {coach.assignedBatches.length === selectedBatchIds.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button 
                      onClick={() => setModalOpen(true)}
                      disabled={selectedBatchIds.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Unassign
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Batches List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {coach.assignedBatches.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-600">No batches assigned</p>
                </div>
              ) : (
                coach.assignedBatches.map((batch) => (
                  <label key={batch._id} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedBatchIds.includes(batch._id) ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200 hover:border-blue-300"
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedBatchIds.includes(batch._id)}
                      onChange={() => toggleSelect(batch._id)}
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{batch.batchName}</h3>
                        {batch.timing && <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">{batch.timing}</span>}
                      </div>
                      <div className="flex gap-2">
                        {batch.batchType && <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{batch.batchType}</span>}
                        {batch.fee && <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">₹{batch.fee}</span>}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>

            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="w-full mt-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
            <div className="text-xl font-bold text-purple-600">{coach.assignedBatches.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
            <div className="text-xl font-bold text-blue-600">{selectedBatchIds.length}</div>
            <div className="text-sm text-gray-600">Selected</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
            <div className="text-xl font-bold text-green-600">{coach.assignedBatches.length - selectedBatchIds.length}</div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Unassignment</h3>
            </div>
            
            <p className="text-gray-600 text-center mb-6">
              Unassign <span className="font-semibold text-blue-600">{selectedBatchIds.length} batches</span> from {coach.name}?
            </p>

            <div className="flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={handleUnassign} disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  'Unassign'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnassignBatches;