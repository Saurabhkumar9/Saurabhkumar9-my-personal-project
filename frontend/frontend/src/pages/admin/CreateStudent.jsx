import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useStudent } from "../../context/StudentContext";
import { toast } from "react-toastify";

const CreateStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // batch ID from URL
  const { createStudent, loading } = useStudent();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const studentData = {
        ...data,
      };

      const result = await createStudent(id, studentData);

      if (result.success) {
        reset();
        // navigate(-1); // Go back to previous page
      } else {
        toast.error(result.error || "Failed to register student");
      }
    } catch (error) {
      toast.error("Failed to register student. Please try again.");
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
            {id ? `Add student to batch ${id}` : "Add new student"}
          </p>
        </div>

        {/* Student Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="enter full name"
                  {...register("name", { required: "Name is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhaar Number *
                </label>
                <input
                  type="text"
                  placeholder="Enter Aadhar Number"
                  minLength={12}
                  maxLength={12}
                  {...register("aadharNumber", {
                    required: "Aadhaar number is required",
                    pattern: {
                      value: /^\d{12}$/,
                      message: "Must be 12 digits",
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.aadharNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.aadharNumber.message}
                  </p>
                )}
              </div>
            </div>

            {/* Parent Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father's Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter Father Name."
                  {...register("fatherName", {
                    required: "Father's name is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.fatherName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fatherName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mother's Name
                </label>
                <input
                  type="text"
                  placeholder="Mother Name"
                  {...register("motherName")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Phone Number *
  </label>

  <input
    type="tel"
    defaultValue="+91"
    maxLength={13} // +91 + 10 digits = 13 length
    placeholder="+919876543210"
    {...register("phone", {
      required: "Phone number is required",
      pattern: {
        value: /^\+91[6-9]\d{9}$/,
        message:
          "Enter a valid Indian number with +91 (e.g., +919876543210)",
      },
    })}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

  {errors.phone && (
    <p className="text-red-500 text-xs mt-1">
      {errors.phone.message}
    </p>
  )}
</div>

            {/* School & Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Name
              </label>
              <input
                type="text"
                {...register("schoolName")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                {...register("address")}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Registering..." : "Register Student"}
              </button>
            </div>
          </form>
        </div>

        {/* Excel Upload Option */}
        {id && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate(`/students/upload/${id}`)}
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

export default CreateStudent;
