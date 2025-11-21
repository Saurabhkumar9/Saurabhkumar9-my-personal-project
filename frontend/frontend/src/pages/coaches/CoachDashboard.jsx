// components/CoachDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoachSession } from '../../coachcontext/CoachSessionContext';

const CoachDashboard = () => {
  const { coachSession, coachBatch, loadingCoach } = useCoachSession();
  const navigate = useNavigate();

  // Safe data handling
  const coachName = coachSession?.name || 'Coach';
  const coachEmail = coachSession?.email || 'coach@example.com';
  const coachPhone = coachSession?.phone || '';
  const batches = Array.isArray(coachBatch) ? coachBatch : [];

  console.log(coachBatch)

  const getInitials = (name) => {
    if (!name) return 'C';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Show loading state
  if (loadingCoach) {
    return (
      <div className="min-h-screen flex bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading coach data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 hidden md:flex flex-col p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Coach Dashboard</h2>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
            {getInitials(coachName)}
          </div>
          <div className="min-w-0">
            <p className="text-gray-800 font-semibold truncate text-sm">
              {coachName}
            </p>
            <p className="text-gray-500 text-xs truncate">
              {coachEmail}
            </p>
            {coachPhone && (
              <p className="text-gray-500 text-xs truncate">{coachPhone}</p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-2 sm:p-5">
        <div className="mb-2 md:mb-5 p-2 md:p-4">
          <h1 className="text-sm md:text-xl font-bold text-gray-800 mb-1">
            Welcome back, {coachName.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 text-sm">
            {batches.length > 0
              ? `You are currently managing ${batches.length} assigned batch${batches.length > 1 ? 'es' : ''}`
              : 'No batches assigned yet'
            }
          </p>
        </div>

        {/* Batches Section */}
        <div className="rounded-sm p-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-sm font-bold text-gray-800">My Assigned Batches</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {batches.map((batch) => (
              <div
                key={batch._id}
                onClick={() => navigate(`/coach/batch/${batch._id}`, { state: { batch } })}
                className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]"
              >
                <div className="mb-3">
                  <h3 className="text-md font-semibold text-gray-800 mb-1">
                    {batch.batchName || 'Unnamed Batch'}
                  </h3>
                  <p className="text-xs text-gray-600">
                    🕒 {batch.timing || 'Timing not set'}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-auto pt-2 border-t border-purple-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">
                      Fee: {batch.fee || 0 || 'N/A'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/coach/batch/${batch._id}`, { state: { batch } });
                  }}
                  className="mt-3 text-purple-600 hover:text-purple-700 font-medium text-xs text-left"
                >
                  View Details →
                </button>
              </div>
            ))}
            
            {batches.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 text-sm italic">
                  No batches are currently assigned to you.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoachDashboard;