import React, { useState, useMemo } from "react";

const AttendanceModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const attendance = Array.isArray(student.attendance)
    ? student.attendance
    : [];

  // ---- DEFAULT CURRENT MONTH/YEAR ----
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  // ---- FILTER ATTENDANCE ----
  const monthlyAttendance = useMemo(() => {
    return attendance.filter((item) => {
      if (!item.date) return false;

      const d = new Date(item.date);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();

      return m === Number(month) && y === Number(year);
    });
  }, [attendance, month, year]);

  const presentDays = monthlyAttendance.filter(
    (a) => a.status === "present"
  ).length;

  // Generate calendar days
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const attendanceRecord = monthlyAttendance.find((a) => {
      const recordDate = new Date(a.date);
      return recordDate.getDate() === day;
    });

    return {
      day,
      status: attendanceRecord?.status || "no-data",
    };
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md sm:max-w-lg rounded-xl shadow-lg mt-4 sm:mt-8 mb-4">
        {/* Compact Header */}
        <div className="bg-sky-500 px-4 py-3 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Attendance Details</h2>
              <p className="text-blue-100 text-xs mt-0.5">
                {student.name || "N/A"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 text-xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Month
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2025, m - 1).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Year
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complete Stats */}
        <div className="p-4 border-b">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-600 font-medium">Present</div>
              <div className="text-lg font-bold text-green-700">
                {presentDays}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="p-2">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ day, status }) => (
              <div
                key={day}
                className={`
                  aspect-square rounded flex items-center justify-center text-xs font-medium
                  ${
                    status === "present"
                      ? "bg-green-300 text-green-800 border border-green-200"
                      : status === "absent"
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : "bg-gray-50 text-gray-500 border border-gray-200"
                  }
                `}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-4 mt-4 pt-3 border-t">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-sm"></div>
              <span className="text-xs text-gray-600">Present</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-sm"></div>
              <span className="text-xs text-gray-600">Absent</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded-sm"></div>
              <span className="text-xs text-gray-600">No Data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
