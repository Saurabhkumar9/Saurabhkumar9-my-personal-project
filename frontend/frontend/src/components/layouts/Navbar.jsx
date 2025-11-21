// components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout, isAuthenticated, hasProfile,PreviewUrl } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const handleDashboard = () => {
    if (user?.role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/coach-dashboard');
    }
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const handleProfile = () => {
    if (user?.role === 'admin') {
      navigate('/admin-profile');
    } else {
      navigate('/coach-profile');
    }
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Profile image or placeholder
  const getProfileImage = () => {
    if (PreviewUrl) {
      return (
        <img 
          src={PreviewUrl} 
          alt="Profile" 
          className="w-8 h-8 rounded-full object-cover border-2 border-white"
        />
      );
    }
    return (
      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white">
        {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Navigation (Large Screens) */}
      <nav className="hidden lg:flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AttendancePro
          </span>
        </div>

        <div className="flex items-center space-x-8 text-[14px]">
          <Link
            to="/"
            className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
          >
            Contact
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  {getProfileImage()}
                  <span className="text-sm font-medium text-gray-700 max-w-32 truncate">
                    {user?.name || user?.email}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      isProfileDropdownOpen ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <p className="text-xs text-purple-600 font-medium capitalize">{user?.role}</p>
                    </div>
                    
                    <button
                      onClick={handleProfile}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </button>

                    <button
                      onClick={handleDashboard}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Dashboard</span>
                    </button>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-1.5 text-[14px] bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Login/Register
            </Link>
          )}
        </div>
      </nav>

      {/* Tablet Navigation (Medium Screens) */}
      <nav className="hidden md:flex lg:hidden items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AttendancePro
          </span>
        </div>

        <div className="flex items-center space-x-6 text-[13px]">
          <Link
            to="/"
            className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
          >
            Contact
          </Link>
        </div>

        {/* Auth Buttons - Compact for tablet */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDashboard}
                className="px-3 py-1.5 text-[13px] bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-[13px] bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-3 py-1.5 text-[13px] bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md"
            >
              Login/Register
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Navigation (Small Screens) */}
      <nav className="md:hidden bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AttendancePro
          </span>

          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <div className="mr-2">
                {getProfileImage()}
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <span
                  className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ${
                    isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                ></span>
                <span
                  className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}
                ></span>
                <span
                  className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`px-4 pb-4 transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "block" : "hidden"
          }`}
        >
          <div className="flex flex-col space-y-3 text-[12px]">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
            >
              Contact
            </Link>

            {isAuthenticated && (
              <>
                <button
                  onClick={handleProfile}
                  className="w-full px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 text-left"
                >
                  Profile
                </button>
                <button
                  onClick={handleDashboard}
                  className="w-full px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 text-left"
                >
                  Dashboard
                </button>
              </>
            )}

            <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-1.5 text-[12px] bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md text-center"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-4 py-1.5 text-[12px] bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md text-center"
                >
                  Login/Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;