import React from 'react';

const ScheduleInfoBanner = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-md p-6 mb-8 text-white">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Weekly Challenge Schedule</h2>
          <p className="text-blue-100">Every Monday • 7:00 PM - 10:00 PM IST</p>
          <p className="text-blue-100 text-sm mt-1">Top 3 performers get Gold, Silver, and Bronze badges! 🏅</p>
        </div>
        <div className="text-center sm:text-right">
          <div className="text-3xl font-bold">3 Hours</div>
          <div className="text-blue-100">Duration</div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleInfoBanner;