import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useBatch } from "../../context/BatchContext"; 
import { timeSlots } from '../../assets/assests.js'
const Batches = () => {
  const navigate = useNavigate();
  const { batches, loading, error, deleteBatch, updateBatch } = useBatch();

  const [selectedBatch, setSelectedBatch] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue
  } = useForm();

  const handleAddBatch = () => {
    navigate("/admin/create-batch");
  };

  const handleDeleteBatchClick = async (batchId) => {
    if (window.confirm("Are you sure you want to delete this batch? \n\n⚠️ Warning: Deleting this batch will also permanently delete all students belonging to this batch. ")) {
      const result = await deleteBatch(batchId);
      if (result.success) {
        setSelectedBatch(null);
      }
    }
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    reset({
      timing: batch.timing,
      fee: batch.fee,
      status: batch.status || 'active',
      weekDays: batch.weekDays || []
    });
  };

  const handleCloseEdit = () => {
    setEditingBatch(null);
    reset();
  };

  const handleUpdateBatch = async (data) => {
    if (!editingBatch) return;

    try {
      const updateData = {
        timing: data.timing,
        fee: data.fee,
        status: data.status,
        weekDays: data.weekDays || []
      };

      const result = await updateBatch(editingBatch._id, updateData);
      if (result.success) {
        setEditingBatch(null);
        reset();
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const status = watch("status");

  // Format week days for display
  const formatWeekDays = (days) => {
    if (!days || days.length === 0) return "Not Set";
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(", ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading batches...</p>
        </div>
      </div>
    );
  }

  if (error && batches.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">All Batches</h1>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm">Manage your training batches</p>
          </div>
          <button
            onClick={handleAddBatch}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 w-full sm:w-auto justify-center text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Batch
          </button>
        </div>

        {/* Batches Grid */}
        {batches.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl sm:text-4xl mb-3">📚</div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No batches available</h3>
            <p className="text-gray-600 mb-4 text-xs sm:text-sm">Create your first batch to get started</p>
            <button
              onClick={handleAddBatch}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm"
            >
              Create Your First Batch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {batches.map((batch) => (
              <div 
                key={batch._id} 
                className="rounded-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:-translate-y-1 bg-white"
              >
                {/* Batch Header */}
                <div className="bg-blue-500 p-3 text-white">
                  <div className="flex justify-between items-start">
                    <h2 className="text-base font-bold truncate">{batch.batchName}</h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      batch.status === "active" 
                        ? 'bg-green-400 text-white' 
                        : 'bg-gray-400 text-white'
                    }`}>
                      {batch.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Batch Details */}
                <div className="p-3">
                  <div className="space-y-2">
                    {/* Coach Name */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600">Coach</p>
                        <p className="font-semibold text-gray-900 text-sm truncate">{batch.coachName}</p>
                      </div>
                    </div>

                    {/* Timing */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600">Timing</p>
                        <p className="font-semibold text-gray-900 text-sm truncate">{batch.timing}</p>
                      </div>
                    </div>

                    {/* Week Days */}
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600">Days</p>
                        <p className="font-semibold text-gray-900 text-sm truncate" title={formatWeekDays(batch.weekDays)}>
                          {formatWeekDays(batch.weekDays)}
                        </p>
                      </div>
                    </div>

                    {/* Monthly Fee */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600">Monthly Fee</p>
                        <p className="font-semibold text-gray-900 text-sm">₹{batch.fee}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1 mt-3 pt-3 border-t border-gray-200">
                    <button 
                      onClick={() => navigate(`/admin/create-student/${batch._id}`)}
                      className="flex-1 bg-green-500 text-white py-1 px-2 rounded text-[10px] font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Student
                    </button>

                    <button 
                      onClick={() => handleEditBatch(batch)}
                      className="flex-1 bg-yellow-500 text-white py-1 px-2 rounded text-[10px] font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>

                    <button 
                      onClick={() => handleDeleteBatchClick(batch._id)}
                      className="flex-1 bg-red-500 text-white py-1 px-2 rounded text-[10px] font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Batch Modal */}
      {editingBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-500 p-4 sm:p-5 rounded-t-xl text-white">
              <h2 className="text-lg sm:text-xl font-bold">Edit Batch</h2>
              <p className="text-purple-100 mt-1 text-xs sm:text-sm">Update batch details</p>
            </div>

            <form onSubmit={handleSubmit(handleUpdateBatch)} className="p-4 sm:p-5 space-y-4">
              {/* Batch Name (Read-only) */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Batch Name
                </label>
                <input
                  type="text"
                  value={editingBatch.batchName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Batch name cannot be changed</p>
              </div>

              {/* Coach Name (Read-only) */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Coach
                </label>
                <input
                  type="text"
                  value={editingBatch.coachName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Coach assignment coming soon</p>
              </div>

              {/* Timing */}
               <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Timing *
                                  </label>
                                  <select
                                    {...register("timing", { 
                                      required: "Please select a time slot",
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
                                  >
                                    <option value="">Select a time slot</option>
                                    {timeSlots.map((time, index) => (
                                      <option key={index} value={time}>
                                        {time}
                                      </option>
                                    ))}
                                  </select>
                                </div>

              {/* Monthly Fee */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Monthly Fee (₹) *
                </label>
                <input
                  type="number"
                  {...register("fee", {
                    required: "Monthly fee is required",
                    min: { 
                      value: 0, 
                      message: "Fee cannot be negative" 
                    },
                    valueAsNumber: true
                  })}
                  placeholder="Enter monthly fee"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                {errors.fee && (
                  <p className="text-red-500 text-xs mt-1">{errors.fee.message}</p>
                )}
              </div>

              {/* Week Days Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Training Days
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => (
                    <label key={day} className="flex items-center space-x-1 text-xs">
                      <input
                        type="checkbox"
                        value={day}
                        {...register("weekDays")}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="capitalize">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Toggle */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">
                  Batch Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setValue("status", "active")}
                    className={`py-2 rounded-lg border-2 font-semibold transition-all text-xs ${
                      status === 'active'
                        ? 'bg-green-500 text-white border-green-500 shadow-lg'
                        : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("status", "inactive")}
                    className={`py-2 rounded-lg border-2 font-semibold transition-all text-xs ${
                      status === 'inactive'
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
                <input
                  type="hidden"
                  {...register("status", { required: "Status is required" })}
                />
                {errors.status && (
                  <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={isSubmitting}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Batch'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batches;