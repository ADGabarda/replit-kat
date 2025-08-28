import React from "react";

const Calendar: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600">View and manage your schedule</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <iframe
          src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Asia%2FManila&showPrint=0&src=Z2FiYXJkYS5hZmZsYXR1c3JlYWx0eUBnbWFpbC5jb20&src=NjkxMGE0NGU4ZWI3MzQ3MzgwNmJjOGJlMGVlMzEwYTY3ODEzNmJmYzcwZDI3NDM2MTI3ZGUwNWQ5OGJhZmFjMUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=ZW4ucGhpbGlwcGluZXMjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23039be5&color=%23d81b60&color=%230b8043"
          style={{ border: "none" }}
          width="100%"
          height="700"
          frameBorder="0"
          scrolling="no"
          title="Google Calendar"
        />
      </div>
    </div>
  );
};

export default Calendar;
