import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StatsCard from "../../components/ui/StatsCard";
import Batches from "./Batches";
import Coaches from "./Coaches";
import Students from "./Students";
import { useBatch } from "../../context/BatchContext";
import { useCoach } from "../../context/CoachContext";
import { useStudent } from "../../context/StudentContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { students } = useStudent();
  
  const { batches, loading: batchesLoading } = useBatch();
  const { coaches, loading: coachesLoading } = useCoach();

  // Get current active tab from URL path
  const currentPath = location.pathname;
  const activeTab = currentPath.includes('/batches') ? 'batches' : 
                   currentPath.includes('/coaches') ? 'coaches' :
                   currentPath.includes('/students') ? 'students' : 'dashboard';

  // Calculate statistics from real data
  const activeBatches = batches.filter(batch => batch.status === 'active').length;
  const inactiveBatches = batches.filter(batch => batch.status === 'inactive').length;
  
  const activeCoachesCount = coaches.filter(coach => coach.status === 'active').length;
  const inactiveCoachesCount = coaches.filter(coach => coach.status === 'inactive').length;
  
  // Calculate total students across all batches
  const totalStudents = students?.length || 0;
  
  // Calculate batches with assigned coaches
  const batchesWithCoaches = batches.filter(batch => {
    return coaches.some(coach => 
      coach.assignedBatches?.some(assignedBatch => 
        assignedBatch._id === batch._id
      )
    );
  }).length;

  const stats = [
    { 
      title: "Total Students", 
      value: totalStudents.toString(), 
      subtitle: `Across ${batches.length} batches`, 
      icon: "👨‍🎓", 
      color: "purple" 
    },
    { 
      title: "Active Batches", 
      value: activeBatches.toString(), 
      subtitle: `${inactiveBatches} inactive batches`, 
      icon: "📊", 
      color: "green" 
    },
    { 
      title: "Active Coaches", 
      value: activeCoachesCount.toString(), 
      subtitle: `${inactiveCoachesCount} inactive coaches`, 
      icon: "👨‍🏫", 
      color: "blue" 
    },
    { 
      title: "Assigned Batches", 
      value: batchesWithCoaches.toString(), 
      subtitle: `${batches.length - batchesWithCoaches} unassigned`, 
      icon: "📚", 
      color: "orange" 
    }
  ];

  // Navigation handlers
  const handleNavigation = (tab) => {
    if (tab === 'dashboard') {
      navigate('/admin/dashboard');
    } else {
      navigate(`/admin/${tab}`);
    }
  };

  if (batchesLoading || coachesLoading) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Top Navigation Buttons */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        {["dashboard", "batches", "coaches", "students"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleNavigation(tab)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm ${
              activeTab === tab
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-purple-50 border border-gray-200"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Conditional Rendering */}
      {activeTab === "dashboard" && (
        <>
          {/* Welcome Header */}
          <div className="mb-8 text-center">
            <h1 className="text-sm sm:text-xl font-bold text-gray-800 mb-2">
              Welcome to Your Academy Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your batches, coaches, and students in one place
            </p>
          </div>

          {/* Summary Section */}
          <div className="mb-8">
            <h2 className="text-sm sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
              Academy Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => handleNavigation('batches')}
                className="p-4 text-left bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
              >
                <div className="text-2xl mb-2">📚</div>
                <h4 className="font-semibold text-purple-800">Manage Batches</h4>
                <p className="text-sm text-purple-600 mt-1">Create and organize batches</p>
              </button>
              
              <button
                onClick={() => handleNavigation('coaches')}
                className="p-4 text-left bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <div className="text-2xl mb-2">👨‍🏫</div>
                <h4 className="font-semibold text-blue-800">Manage Coaches</h4>
                <p className="text-sm text-blue-600 mt-1">Add and assign coaches</p>
              </button>
              
              <button
                onClick={() => handleNavigation('students')}
                className="p-4 text-left bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
              >
                <div className="text-2xl mb-2">👨‍🎓</div>
                <h4 className="font-semibold text-green-800">Manage Students</h4>
                <p className="text-sm text-green-600 mt-1">View and manage students</p>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Render components based on route */}
      {activeTab === "batches" && <Batches />}
      {activeTab === "coaches" && <Coaches />}
      {activeTab === "students" && <Students />}
    </div>
  );
};

export default Dashboard;