// context/AuthContext.js
import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    loading: true,
    otpSent: false,
    pendingEmail: "",
    pendingName: "",
    deviceId: localStorage.getItem("deviceId") || generateDeviceId()
  });

  // Generate secure device ID
  function generateDeviceId() {
    const randomPart = Math.random().toString(36).substr(2, 16);
    const timestamp = Date.now().toString(36);
    const deviceId = `device_${randomPart}_${timestamp}`;
    localStorage.setItem("deviceId", deviceId);
    return deviceId;
  }

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();
      if (isExpired) {
        console.log("Token expired at:", new Date(decoded.exp * 1000));
      }
      return isExpired;
    } catch (error) {
      console.error("Token decode error:", error);
      return true;
    }
  };

  const updateAuthState = (updates) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  };

  const clearAuth = async (silent = false) => {
    const token = localStorage.getItem("token");
    const deviceId = authState.deviceId;
    
    // Call logout API if token exists and not silent mode
    if (token && deviceId && !silent) {
      try {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/admin/logout`,
          { deviceId },
          { 
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json" 
            } 
          }
        );
        console.log("Logout API called successfully for device:", deviceId);
      } catch (error) {
        console.log("Logout API call failed:", error.message);
        // Continue with local logout even if API fails
      }
    }

    // Clear local state
    setAuthState({ 
      user: null, 
      loading: false, 
      otpSent: false, 
      pendingEmail: "",
      pendingName: "",
      deviceId: authState.deviceId // Keep deviceId for future logins
    });
    
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];

    console.log("Local auth cleared");
  };

  const setAuthData = (userData, token) => {
    const userWithRole = { 
      ...userData, 
      role: userData.role || "user",
      profile: userData.profile || null,
      profile_id: userData.profile_id || null
    };
    updateAuthState({ user: userWithRole });
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userWithRole));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    console.log("User authenticated:", userWithRole.email, "Role:", userWithRole.role);
  };

  // Get device info for session management
  const getDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent,
      ip: "auto-detected"
    };
  };

  // Enhanced API call helper with better error handling
  const apiCall = async (endpoint, data, method = "post", includeDeviceInfo = false) => {
    try {
      const requestData = includeDeviceInfo ? {
        ...data,
        deviceId: authState.deviceId,
        deviceInfo: getDeviceInfo()
      } : data;

      console.log(`API Call: ${method.toUpperCase()} ${endpoint}`, {
        deviceId: includeDeviceInfo ? authState.deviceId : 'not included'
      });

      const response = await axios[method](
        `${import.meta.env.VITE_BASE_URL}${endpoint}`,
        requestData,
        { 
          headers: { "Content-Type": "application/json" },
          timeout: 10000 // 10 second timeout
        }
      );
      return response.data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.response?.data || error.message);
      
      // Auto logout on 401 unauthorized
      if (error.response?.status === 401) {
        console.log("Auto logout due to 401 unauthorized");
        await clearAuth(true); // Silent logout for token expiration
        window.location.href = "/auth";
        throw new Error("Session expired. Please login again.");
      }
      
      // Handle network errors
      if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        throw new Error("Network error. Please check your connection.");
      }
      
      throw new Error(error.response?.data?.message || "Operation failed");
    }
  };

  // Authentication check on mount with enhanced error handling
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (token && userData) {
          if (isTokenExpired(token)) {
            console.log("Token expired on app start");
            await clearAuth(true); // Silent logout for expired token
          } else {
            setAuthData(JSON.parse(userData), token);
            console.log("User restored from localStorage");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear corrupted auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        updateAuthState({ loading: false });
      }
    };

    initializeAuth();
  }, []);

  // Enhanced token expiration check
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (token && isTokenExpired(token)) {
        console.log("Token expired during interval check");
        await clearAuth(true); // Silent logout
        // Optional: Show toast notification
        if (window.showToast) {
          window.showToast("Session expired. Please login again.", "error");
        }
      }
    };

    // Check every 30 seconds instead of 60 for better UX
    const interval = setInterval(checkToken, 30000);
    return () => clearInterval(interval);
  }, []);

  // Add axios response interceptor for global error handling
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.log("Interceptor: 401 detected, logging out");
          await clearAuth(true);
          window.location.href = "/auth";
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Authentication methods
  const adminLogin = async (email, password) => {
    const data = await apiCall("/admin/login", { email, password }, "post", true);
    if (data.success) {
      setAuthData(data.admin, data.token);
      // console.log("Admin login successful:", email);
    }
    return data;
  };

  const adminRegister = async (userData) => {
    const data = await apiCall("/admin/register", userData, "post", true);
    if (data.success) {
      updateAuthState({ 
        otpSent: true, 
        pendingEmail: userData.email,
        pendingName: userData.name 
      });
      console.log("Admin registration OTP sent to:", userData.email);
    }
    return data;
  };

  const verifyAdminEmail = async (otp) => {
    const data = await apiCall("/admin/verify-email", { 
      email: authState.pendingEmail, 
      otp 
    }, "post", true);
    if (data.success) {
      setAuthData(data.admin, data.token);
      updateAuthState({ 
        otpSent: false, 
        pendingEmail: "", 
        pendingName: "" 
      });
      console.log("Admin email verified:", authState.pendingEmail);
    }
    return data;
  };

  const sendCoachOtp = async (email) => {
    const data = await apiCall("/coach/send-opt", { email }, "post", true);
    
    if (data.success) {
      updateAuthState({ otpSent: true, pendingEmail: email });
      console.log("Coach OTP sent to:", email);
    }
    return data;
  };

  const verifyCoachOtp = async (otp) => {
    const data = await apiCall("/coach/login-coach", {
      email: authState.pendingEmail, 
      otp
    }, "post", true);
    if (data.success) {
      setAuthData(data.coach, data.token);
      updateAuthState({ otpSent: false, pendingEmail: "" });
      console.log("Coach login successful:", authState.pendingEmail);
    }
    return data;
  };

  const sendPasswordResetOtp = async (email) => {
    return await apiCall("/admin/otp-send-password", { email });
  };

  const resetPassword = async (email, otp, password) => {
    return await apiCall("/admin/password-reset", { email, otp, password });
  };

  const logout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      console.log("User initiated logout");
      await clearAuth(false); // Not silent - call logout API
      window.location.href = "/";
    }
  };

  // Force logout without confirmation (for token expiration etc.)
  const forceLogout = async () => {
    console.log("Force logout initiated");
    await clearAuth(false);
    window.location.href = "/auth";
  };

  const value = {
    ...authState,
    isAuthenticated: !!authState.user,
    isAdmin: authState.user?.role === "admin",
    isCoach: authState.user?.role === "coach",
    hasProfile: !!(authState.user?.profile || authState.user?.profile_id),
    adminLogin,
    adminRegister,
    verifyAdminEmail,
    sendCoachOtp,
    verifyCoachOtp,
    sendPasswordResetOtp,
    resetPassword,
    logout,
    forceLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};