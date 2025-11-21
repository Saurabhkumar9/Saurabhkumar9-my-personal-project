import React, { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const CreateStudentByCoach = () => {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/coach/create/student/${batchId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Student created successfully!");
        reset();
      } else {
        toast.error(response.data.error || "Failed to create student");
      }

    } catch (error) {
      console.error("Create student error:", error);

      let backendError = "Something went wrong while creating student";

      if (error.response) {
        backendError =
          error.response.data?.message ||
          error.response.data?.error ||
          error.response.data?.details ||
          error.response.data?.msg ||
          (Array.isArray(error.response.data?.errors) &&
            error.response.data.errors[0]?.msg) ||
          JSON.stringify(error.response.data) ||
          "Something went wrong!";
      }

      toast.error(backendError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Register Student
          </h1>
          <p className="text-gray-600">
            {batchId ? `Add student to batch ${batchId}` : "Add new student"}
          </p>
        </div>

        {/* Student Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Full Name + Aadhaar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  {...register("name", { required: "Name is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhaar Number *
                </label>
                <input
                  type="text"
                  placeholder="Enter 12 digit Aadhaar"
                  maxLength={12}
                  {...register("aadharNumber", {
                    required: "Aadhaar number is required",
                    pattern: {
                      value: /^\d{12}$/,
                      message: "Aadhaar must be 12 digits",
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
                {errors.aadharNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.aadharNumber.message}</p>
                )}
              </div>
            </div>

            {/* Father & Mother */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father Name *
                </label>
                <input
                  type="text"
                  placeholder="Father Name"
                  {...register("fatherName", {
                    required: "Father name is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
                {errors.fatherName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fatherName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mother Name
                </label>
                <input
                  type="text"
                  placeholder="Mother Name"
                  {...register("motherName")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                defaultValue="+91"
                placeholder="+91XXXXXXXXXX"
                maxLength={13}
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^\+91[6-9]\d{9}$/,
                    message: "Enter valid Indian number (+91XXXXXXXXXX)",
                  },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Name
              </label>
              <input
                type="text"
                placeholder="Enter school name"
                {...register("schoolName")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                rows="3"
                placeholder="Enter complete address"
                {...register("address")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Student...
                  </>
                ) : (
                  "Register Student"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Excel Upload */}
        {batchId && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate(`/coach/student/upload/${batchId}`)}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Or upload multiple students via Excel →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateStudentByCoach;
