// pages/common/AuthPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext"
import { toast } from "react-toastify";

const AuthPage = () => {
  const navigate = useNavigate();
  const { 
    adminLogin, 
    adminRegister, 
    verifyAdminEmail, 
    sendCoachOtp, 
    verifyCoachOtp, 
    otpSent, 
    pendingEmail, 
    pendingName,
    isAuthenticated,
    user 
  } = useAuth();

  const [role, setRole] = useState("admin");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardPath = user.role === "admin" ? "/admin-dashboard" : "/coach-dashboard";
      console.log(`Redirecting to: ${dashboardPath} for role: ${user.role}`);
      navigate(dashboardPath);
    }
  }, [isAuthenticated, user, navigate]);

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");

    try {
      let result;
      
      if (role === "admin") {
        result = isRegister 
          ? await adminRegister(data)
          : await adminLogin(data.email, data.password);
      } else {
        result = await sendCoachOtp(data.email);
      }

      setMessage(result.message);
      
      // Navigate on success for non-OTP flows
      if (result.success && role === "admin" && !isRegister) {
        // Navigation will be handled by the useEffect above
        console.log("Admin login successful, redirecting...");
      }
    } catch (error) {
      setMessage(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const onVerifyOtp = async (data) => {
    setLoading(true);
    setMessage("");
    
    try {
      const result = role === "admin" 
        ? await verifyAdminEmail(data.otp)
        : await verifyCoachOtp(data.otp);

      setMessage(result.message);
      
      if (result.success) {
        toast.success(result.message);
        // Navigation will be handled by the useEffect above
        console.log("OTP verification successful, redirecting...");
      }
    } catch (error) {
      setMessage(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form when switching modes
  const switchMode = (newRole, register = false) => {
    setRole(newRole);
    setIsRegister(register);
    reset();
    setMessage("");
  };

  // OTP Verification Screen
  if (otpSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Verify OTP
          </h2>

          {/* Show registration info for admin registration */}
          {role === "admin" && pendingName && (
            <div className="bg-blue-50 p-3 rounded-md mb-4">
              <p className="text-sm text-blue-700 text-center">
                Completing registration for: <strong>{pendingName}</strong>
              </p>
            </div>
          )}

          <p className="text-sm text-gray-600 text-center mb-4">
            OTP sent to: <span className="font-medium">{pendingEmail}</span>
          </p>

          {message && (
            <div className={`p-3 rounded-md mb-4 text-sm ${
              message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit(onVerifyOtp)} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Enter 6-digit OTP
              </label>
              <input
                type="text"
                maxLength={6}
                {...register("otp", {
                  required: "OTP is required",
                  minLength: { value: 6, message: "OTP must be 6 digits" },
                  maxLength: { value: 6, message: "OTP must be 6 digits" },
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: "OTP must contain only numbers"
                  }
                })}
                placeholder="123456"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-lg tracking-widest"
              />
              {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <button
              type="button"
              onClick={() => {
                reset();
                setMessage("");
                
                if (role === "admin" && isRegister) {
                  switchMode("admin", true);
                } else {
                  navigate("/auth");
                }
              }}
              className="w-full py-2 bg-gray-500 text-white rounded-md font-medium hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Login/Register Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        {/* Role Toggle */}
        <div className="flex justify-center mb-6">
          {["admin", "coach"].map((r) => (
            <button
              key={r}
              onClick={() => switchMode(r, false)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                role === r 
                  ? "bg-purple-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } ${r === "admin" ? "rounded-l-md" : "rounded-r-md"}`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {isRegister ? "Admin Register" : `${role} Login`}
        </h2>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-md mb-4 text-sm ${
            message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name - Only for Admin Registration */}
          {isRegister && role === "admin" && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                {...register("name", { 
                  required: "Name is required", 
                  minLength: { 
                    value: 2, 
                    message: "Name must be at least 2 characters" 
                  } 
                })}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: { 
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
                  message: "Invalid email address" 
                }
              })}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          {/* Password - Only for Admin */}
          {role === "admin" && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Password
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
                placeholder={isRegister ? "Create password" : "Enter your password"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Processing..." : isRegister ? "Register & Verify" : "Login"}
          </button>

          {/* Admin-specific links */}
          {role === "admin" && (
            <div className="flex justify-between items-center text-sm mt-3">
              <button
                type="button"
                onClick={() => switchMode("admin", !isRegister)}
                className="text-purple-600 hover:underline hover:text-purple-700"
              >
                {isRegister ? "Already have an account? Login" : "New admin? Create account"}
              </button>

              {!isRegister && (
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-gray-600 hover:text-purple-600 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthPage;