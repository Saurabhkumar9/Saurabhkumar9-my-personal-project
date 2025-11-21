// pages/common/ForgetPassword.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";

const ForgetPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const { sendPasswordResetOtp, resetPassword } = useAuth();

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
  const password = watch("password");

  // Step 1: Send OTP
  const handleSendOtp = async (data) => {
    setLoading(true);
    setMessage("");
    
    const result = await sendPasswordResetOtp(data.email);
    
    if (result.success) {
      setEmail(data.email);
      setStep(2);
      setMessage("OTP sent to your email!");
    } else {
      setMessage(result.message);
    }
    setLoading(false);
  };

  // Step 2: Reset password
  const handleResetPassword = async (data) => {
    setLoading(true);
    setMessage("");
    
    const result = await resetPassword(email, data.otp, data.password);
    
    if (result.success) {
      setMessage("Password reset successfully! Redirecting...");
      setTimeout(() => window.location.href = "/auth", 2000);
    } else {
      setMessage(result.message);
    }
    setLoading(false);
  };

  const handleBack = () => {
    setStep(1);
    setMessage("");
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {step === 1 ? "Forgot Password" : "Reset Password"}
        </h2>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>1</div>
            <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 2 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>2</div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-md mb-4 text-sm ${
            message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {message}
          </div>
        )}

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSubmit(handleSendOtp)} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address"
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <p className="text-center text-gray-600 text-sm">
              Remember password?{" "}
              <a href="/auth" className="text-purple-600 font-medium hover:underline">
                Back to Login
              </a>
            </p>
          </form>
        )}

        {/* Step 2: Reset Password */}
        {step === 2 && (
          <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                6-Digit OTP
              </label>
              <input
                type="text"
                {...register("otp", { 
                  required: "OTP is required",
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: "OTP must be 6 digits"
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center tracking-widest"
                placeholder="Enter OTP"
                maxLength={6}
              />
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                {...register("password", { 
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter new password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                {...register("confirmPassword", { 
                  required: "Please confirm password",
                  validate: value => value === password || "Passwords do not match"
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Confirm password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>

            <p className="text-center text-gray-600 text-sm">
              OTP sent to: <span className="font-medium">{email}</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;