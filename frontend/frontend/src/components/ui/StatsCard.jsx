import React from "react";

const StatsCard = ({ title, value, subtitle, icon, color, trend, loading }) => {
  const colorClasses = {
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600", 
    blue: "from-blue-500 to-blue-600",
    orange: "from-orange-500 to-orange-600"
  };

  const trendIcons = { up: "↗", down: "↘" };
  const currentColor = colorClasses[color] || colorClasses.purple;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-all duration-200 flex items-center w-full h-full">
      
      {/* Icon */}
      <div className={`sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${currentColor} rounded-lg sm:rounded-xl flex items-center justify-center text-white text-sm sm:text-base lg:text-lg mr-3 flex-shrink-0`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm sm:text-[13px] font-medium text-gray-500 truncate">
            {title}
          </p>
          {trend && (
            <span className={`flex items-center gap-1 text-sm sm:text-[13px] font-semibold ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trendIcons[trend.direction]}
              {trend.value}
            </span>
          )}
        </div>

        {loading ? (
          <div className="h-6 sm:h-7 w-16 sm:w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
        ) : (
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
            {value}
          </h3>
        )}

        {loading ? (
          <div className="h-4 w-24 sm:w-28 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <p className="text-xs sm:text-[13px] text-gray-600 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;