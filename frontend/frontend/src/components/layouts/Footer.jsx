import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 lg:py-6">
        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden flex flex-col items-center space-y-4 text-center">
          
          {/* Brand Section - Centered for mobile */}
          <div className="flex flex-col items-center space-y-2">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AttendancePro
            </span>
            <p className="text-gray-600 text-sm px-2">
              Multi-Organization Arrear & Attendance System
            </p>
          </div>

          {/* Links Section - Compact for mobile */}
          <div className="flex items-center justify-center space-x-4">
            <a
              href="/privacy"
              className="text-gray-500 hover:text-purple-600 transition-colors duration-200 text-xs sm:text-sm"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-gray-500 hover:text-purple-600 transition-colors duration-200 text-xs sm:text-sm"
            >
              Terms
            </a>
            <a
              href="/contact"
              className="text-gray-500 hover:text-purple-600 transition-colors duration-200 text-xs sm:text-sm"
            >
              Support
            </a>
          </div>

          {/* Copyright - Bottom for mobile */}
          <div className="text-gray-500 text-xs sm:text-sm">
            <p>
              © {new Date().getFullYear()} <span className="font-medium text-gray-600">AttendancePro</span>. All rights reserved.
            </p>
          </div>
        </div>

        {/* Tablet & Desktop Layout - Horizontal */}
        <div className="hidden lg:flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] lg:text-[14px]">
          
          {/* Left Section - Brand */}
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-x-0 sm:space-x-2 space-y-1 sm:space-y-0">
            <span className="text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AttendancePro
            </span>
            <span className="hidden sm:inline text-gray-400">•</span>
            <p className="text-gray-600">
              Multi-Organization Arrear & Attendance System
            </p>
          </div>

          {/* Center Section - Copyright */}
          <div className="text-center md:text-left text-gray-500">
            <p>
              © {new Date().getFullYear()} <span className="font-medium text-gray-600">AttendancePro</span>. All rights reserved.
            </p>
          </div>

          {/* Right Section - Links */}
          <div className="flex items-center justify-center md:justify-end space-x-4 lg:space-x-6">
            <a
              href="/privacy"
              className="text-gray-500 hover:text-purple-600 transition-colors duration-200"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-gray-500 hover:text-purple-600 transition-colors duration-200"
            >
              Terms
            </a>
            <a
              href="/contact"
              className="text-gray-500 hover:text-purple-600 transition-colors duration-200"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;