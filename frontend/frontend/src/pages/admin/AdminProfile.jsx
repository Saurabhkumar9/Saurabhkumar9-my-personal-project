import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Fetch admin profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        timeout: 10000 // 10 second timeout
      });
      
      if (response.data.success) {
        setAdmin(response.data.admin);
        if (response.data.admin.profile) {
          setPreviewUrl(response.data.admin.profile);
        }
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      if (error.code === 'ECONNABORTED') {
        toast.error("Request timeout - please try again");
      } else {
        toast.error("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file (JPEG, PNG, etc.)");
      return;
    }

    // Validate file size (max 2MB for faster upload)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB for faster upload");
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select an image to update");
      return;
    }

    const formData = new FormData();
    formData.append("profile", selectedFile);

    try {
      setUploading(true);
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin/profile/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          timeout: 30000 // 30 second timeout for image upload
        }
      );
      
      if (response.data.success) {
        toast.success("Profile picture updated successfully");
        setAdmin(response.data.admin);
        setSelectedFile(null);
        
        // Update preview with new image URL
        if (response.data.admin.profile) {
          setPreviewUrl(response.data.admin.profile);
        }
      }
    } catch (error) {
      console.error("Update profile error:", error);
      if (error.code === 'ECONNABORTED') {
        toast.error("Upload timeout - image might be too large");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update profile picture");
      }
    } finally {
      setUploading(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "AD";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Cancel file selection
  const cancelSelection = () => {
    setSelectedFile(null);
    // Restore original profile image
    if (admin?.profile) {
      setPreviewUrl(admin.profile);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-gray-600">Failed to load profile</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Profile</h1>
          <p className="text-gray-600">Manage your profile information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
            <h2 className="text-lg font-bold text-white">Profile Information</h2>
          </div>

          <div className="p-6">
            {/* Profile Picture Section */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                {/* Profile Image or Avatar */}
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg mx-auto">
                    {getInitials(admin.name)}
                  </div>
                )}
                
                {/* File Input Overlay */}
                <label 
                  htmlFor="profile-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Selected File Info */}
              {selectedFile && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">
                    Selected: {selectedFile.name}
                  </p>
                  <p className="text-xs text-blue-600 mb-2">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={cancelSelection}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Cancel Selection
                  </button>
                </div>
              )}
            </div>

            {/* Admin Information */}
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <p className="text-gray-900 font-semibold">{admin.name}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <p className="text-gray-900 font-semibold">{admin.email}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <p className="text-gray-900 font-semibold capitalize">{admin.role || "Administrator"}</p>
              </div>
            </div>

            {/* Update Button */}
            {selectedFile && (
              <div className="flex gap-3">
                <button
                  onClick={cancelSelection}
                  disabled={uploading}
                  className="flex-1 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileUpdate}
                  disabled={uploading}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Update
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 text-center">
                {selectedFile 
                  ? "Click Update to save your new profile picture" 
                  : "Click the camera icon to select a new profile picture (max 2MB)"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
            <div className="text-xl font-bold text-blue-600">
              {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Member Since</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
            <div className="text-xl font-bold text-green-600">
              {admin.updatedAt ? new Date(admin.updatedAt).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Last Updated</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;