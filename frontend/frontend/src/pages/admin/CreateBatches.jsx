import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useBatch } from "../../context/BatchContext";
import { toast } from "react-toastify";
import { timeSlots } from '../../assets/assests.js'

const CreateBatch = () => {
  const navigate = useNavigate();
  const { createBatch, batches } = useBatch();
  const [existingBatches, setExistingBatches] = useState([]);
  const [showExistingBatches, setShowExistingBatches] = useState(window.innerWidth >= 1024);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      batchName: "",
      timing: "",
      fee: "",
      weekDays: [],
    },
  });

  // Update existing batches when batches context changes
  useEffect(() => {
    setExistingBatches(batches);
  }, [batches]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setShowExistingBatches(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onSubmit = async (data) => {
    try {
      const result = await createBatch(data);
      
      if (result.success) {
        navigate(-1);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const fee = watch("fee");
  const weekDays = watch("weekDays") || [];
  const timing = watch("timing");

  // All week days
  const allWeekDays = [
    { value: "monday", label: "Mon" },
    { value: "tuesday", label: "Tue" },
    { value: "wednesday", label: "Wed" },
    { value: "thursday", label: "Thu" },
    { value: "friday", label: "Fri" },
    { value: "saturday", label: "Sat" },
    { value: "sunday", label: "Sun" }
  ];

  // Toggle week day selection
  const toggleWeekDay = (day) => {
    const currentDays = [...weekDays];
    if (currentDays.includes(day)) {
      setValue("weekDays", currentDays.filter(d => d !== day));
    } else {
      setValue("weekDays", [...currentDays, day]);
    }
  };

  // Select all week days
  const selectAllWeekDays = () => {
    setValue("weekDays", allWeekDays.map(day => day.value));
  };

  // Clear all week days
  const clearAllWeekDays = () => {
    setValue("weekDays", []);
  };

  // Check if all days are selected
  const isAllSelected = weekDays.length === allWeekDays.length;

  // Toggle existing batches visibility on mobile
  const toggleExistingBatches = () => {
    setShowExistingBatches(!showExistingBatches);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-4 px-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Mobile Toggle Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={toggleExistingBatches}
            className="w-full bg-white border border-gray-300 rounded-lg p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="font-semibold text-gray-700">
              {showExistingBatches ? 'Hide Existing Batches' : 'Show Existing Batches'}
            </span>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${showExistingBatches ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Existing Batches */}
          {(showExistingBatches || window.innerWidth >= 1024) && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 sticky top-4 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Existing Batches</h2>
                
                {existingBatches.length === 0 ? (
                  <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
                    <div className="text-3xl mb-3">📚</div>
                    <p className="text-gray-600 text-sm">No batches created yet</p>
                    <p className="text-gray-500 text-xs mt-1">Your batches will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {existingBatches.map((batch) => (
                      <div 
                        key={batch._id} 
                        className="border border-gray-200 rounded-lg p-3 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800 text-sm truncate flex-1">
                            {batch.batchName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            batch.status === "active" 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {batch.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Side - Create Batch Form */}
          <div className={`${showExistingBatches && window.innerWidth < 1024 ? 'col-span-1' : 'lg:col-span-2'}`}>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Create New Batch</h1>
                <p className="text-gray-600 text-sm">Set up a new training batch with all details</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Batch Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Name *
                  </label>
                  <input
                    type="text"
                    {...register("batchName", { 
                      required: "Batch name is required",
                      minLength: {
                        value: 2,
                        message: "Batch name must be at least 2 characters"
                      }
                    })}
                    placeholder="Enter batch name (e.g., Morning Batch, Advanced Class)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  {errors.batchName && (
                    <p className="text-red-500 text-xs mt-1">{errors.batchName.message}</p>
                  )}
                </div>

                {/* Timing and Monthly Fee */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Fee (₹) *
                    </label>
                    <input
                      type="number"
                      min='0'
                      {...register("fee", {
                        required: "Monthly fee is required",
                        min: { value: 0, message: "Fee cannot be negative" },
                        max: { value: 100000, message: "Fee seems too high" }
                      })}
                      placeholder="Enter monthly fee"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    {fee && (
                      <p className="text-green-600 text-xs mt-1">₹{fee} per month</p>
                    )}
                    {errors.fee && (
                      <p className="text-red-500 text-xs mt-1">{errors.fee.message}</p>
                    )}
                  </div>
                </div>

                {/* Week Days Selection */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Training Days
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllWeekDays}
                        disabled={isAllSelected}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={clearAllWeekDays}
                        disabled={weekDays.length === 0}
                        className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {allWeekDays.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleWeekDay(day.value)}
                        className={`py-2 rounded-lg border-2 font-semibold transition-all text-xs ${
                          weekDays.includes(day.value)
                            ? 'bg-purple-500 text-white border-purple-500 shadow-lg'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  
                  <input
                    type="hidden"
                    {...register("weekDays")}
                  />
                  
                  {weekDays.length > 0 && (
                    <div className="mt-2">
                      <p className="text-green-600 text-xs font-medium">
                        Selected Days: {weekDays.length} of {allWeekDays.length}
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        {weekDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(", ")}
                      </p>
                    </div>
                  )}
                  
                  {weekDays.length === 0 && (
                    <p className="text-gray-400 text-xs mt-2">
                      No days selected. Training days are optional.
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      "Create Batch"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBatch;