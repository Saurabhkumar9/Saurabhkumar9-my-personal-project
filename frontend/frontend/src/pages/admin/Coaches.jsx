import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCoach } from "../../context/CoachContext";
import { useBatch } from "../../context/BatchContext";
import StatsCard from "../../components/ui/StatsCard";

const Coaches = () => {
  const navigate = useNavigate();
  const { coaches, loading, error, deleteCoach, updateCoachStatus } =
    useCoach();
  const { batches } = useBatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">
            Loading coaches...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-md mx-4">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-300 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const activeCoaches = coaches.filter((coach) => coach.status === "active");
  const inactiveCoaches = coaches.filter(
    (coach) => coach.status === "inactive"
  );

  const stats = [
    {
      title: "Total Coaches",
      value: coaches.length.toString(),
      subtitle: `${activeCoaches.length} active, ${inactiveCoaches.length} inactive`,
      icon: "👨‍🏫",
      color: "purple",
    },
    {
      title: "Active Coaches",
      value: activeCoaches.length.toString(),
      subtitle: "Currently available",
      icon: "✅",
      color: "green",
    },
    {
      title: "Batches Assigned",
      value: coaches
        .reduce(
          (total, coach) => total + (coach.assignedBatches?.length || 0),
          0
        )
        .toString(),
      subtitle: "Across all coaches",
      icon: "📚",
      color: "blue",
    },
    {
      title: "Available Batches",
      value: batches.length.toString(),
      subtitle: "Total batches created",
      icon: "⭐",
      color: "orange",
    },
  ];

  const openDeleteModal = (coachId, coachName) => {
    setModalConfig({
      type: "delete",
      title: "Delete Coach",
      message: `Are you sure you want to delete coach ${coachName}? This action cannot be undone.`,
      coachId,
      coachName,
    });
    setModalOpen(true);
  };

  const openStatusModal = (coachId, currentStatus, coachName) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    setModalConfig({
      type: "status",
      title: "Update Status",
      message: `Are you sure you want to mark ${coachName} as ${newStatus}?`,
      coachId,
      coachName,
      newStatus,
    });
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalConfig.type === "delete") {
      setDeletingId(modalConfig.coachId);
      await deleteCoach(modalConfig.coachId);
      setDeletingId(null);
    } else if (modalConfig.type === "status") {
      setUpdatingId(modalConfig.coachId);
      await updateCoachStatus(modalConfig.coachId, modalConfig.newStatus);
      setUpdatingId(null);
    }
    setModalOpen(false);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Coaches Management
            </h1>
            <p className="text-sm text-gray-600 mt-2 max-w-2xl">
              Manage coaching staff, assignments, and track performance metrics
            </p>
          </div>

          <Link
            to="/admin/create-coach"
            className="group w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center gap-2 font-semibold"
          >
            <span className="text-sm font-bold">+</span>
            <span>Add New Coach</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="transition-colors duration-300">
              <StatsCard {...stat} />
            </div>
          ))}
        </div>

        {/* Coaches List */}
        <div className=" p-4 sm:p-6 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Coaching Team
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage your coaching staff and their assignments
              </p>
            </div>
            <div className="bg-purple-50 px-4 py-2 rounded-full border border-purple-100">
              <span className="text-sm font-semibold text-purple-700">
                {coaches.length} coaches
              </span>
            </div>
          </div>

          {coaches.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-6 opacity-60">👨‍🏫</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No coaches available
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start building your coaching team by adding your first coach
              </p>
              <Link
                to="/admin/create-coach"
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-colors duration-300 font-semibold"
              >
                <span className="text-lg">+</span>
                Create Your First Coach
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {coaches.map((coach) => (
                <div
                  key={coach._id}
                  className="group bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-lg hover:border-purple-300 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Status Indicator */}
                  <div
                    className={`absolute top-0 right-0 w-3 h-3 rounded-full ${
                      coach.status === "active" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></div>

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center font-semibold text-white text-sm shadow">
                        {coach.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="max-w-[140px]">
                        <h3 className="font-bold text-gray-900 truncate">
                          {coach.name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {coach.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        coach.status === "active"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                      }`}
                    >
                      {coach.status}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm mb-4">
                    <p className="text-gray-700 flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                      <span className="text-base">📱</span>
                      <span className="font-medium">{coach.phone}</span>
                    </p>

                    {/* Assigned Batches */}
                    <div>
                      <p className="text-gray-700 font-semibold text-xs mb-2 flex items-center gap-1">
                        <span>📚</span>
                        Assigned Batches:
                      </p>
                      {coach.assignedBatches &&
                      coach.assignedBatches.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {coach.assignedBatches.slice(0, 3).map((batch) => (
                            <span
                              key={batch._id}
                              className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium border "
                            >
                              {batch.batchName}
                            </span>
                          ))}
                          {coach.assignedBatches.length > 3 && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-medium border border-gray-200">
                              +{coach.assignedBatches.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded-lg border border-gray-200">
                          No batches assigned yet
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/assign-batches/${coach._id}`)
                      }
                      className="flex-1 bg-blue-400 text-white py-2.5 px-3 rounded-sm text-xs font-semibold hover:bg-blue-500 transition-colors duration-300 flex items-center justify-center gap-1"
                    >
                      <span>📋</span>
                      Assign
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/admin/unassign-batches/${coach._id}`)
                      }
                      className="flex-1 bg-red-300 text-white py-2 px-3 rounded-sm text-xs hover:bg-red-400"
                    >
                      Unassign
                    </button>

                    <button
                      onClick={() =>
                        openStatusModal(coach._id, coach.status, coach.name)
                      }
                      disabled={updatingId === coach._id}
                      className={`flex-1 py-2.5 px-3 rounded-sm text-xs font-semibold transition-colors duration-300 flex items-center justify-center gap-1 ${
                        coach.status === "active"
                          ? "bg-yellow-400 hover:bg-yellow-500 text-white"
                          : "bg-green-400 hover:bg-green-500 text-white"
                      } ${
                        updatingId === coach._id
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {updatingId === coach._id ? (
                        <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white"></div>
                      ) : coach.status === "active" ? (
                        <> Deactivate</>
                      ) : (
                        <> Activate</>
                      )}
                    </button>
                    <button
                      onClick={() => openDeleteModal(coach._id, coach.name)}
                      disabled={deletingId === coach._id}
                      className="flex-1 bg-red-400 text-white py-2.5 px-3 rounded-sm text-xs font-semibold hover:bg-red-500 transition-colors duration-300 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === coach._id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      ) : (
                        <> Delete</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-8 h-8 rounded-sm flex items-center justify-center ${
                    modalConfig.type === "delete"
                      ? "bg-red-100 text-red-500"
                      : "bg-purple-100 text-purple-400"
                  }`}
                >
                  {modalConfig.type === "delete" ? "🗑️" : "🔄"}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {modalConfig.title}
                </h3>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                {modalConfig.message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleModalClose}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-300 border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalConfirm}
                  className={`flex-1 text-white py-3 px-4 rounded-xl font-semibold transition-colors duration-300 ${
                    modalConfig.type === "delete"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-purple-500 hover:bg-purple-600"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coaches;
