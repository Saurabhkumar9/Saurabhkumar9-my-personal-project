import React from "react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <section className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4 shadow-lg">
            <svg className="w-7 h-7 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Get In Touch
          </h1>

          <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed px-1">
            Have questions about AttendancePro? Reach out for demos, support, or partnership inquiries.
          </p>

          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mt-4"></div>
        </section>

        {/* Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                  {info.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{info.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{info.content}</p>
                  {info.details && (
                    <p className="text-purple-600 font-medium text-sm mt-1">{info.details}</p>
                  )}
                  {/* Action buttons */}
                  {info.title === "Email Us" && (
                    <a href={`mailto:${info.details}`} className="text-blue-600 font-medium text-sm mt-2 inline-block hover:underline">
                      Send Email
                    </a>
                  )}
                  {info.title === "Call Us" && (
                    <a href={`tel:${info.details}`} className="text-blue-600 font-medium text-sm mt-2 inline-block hover:underline">
                      Call Now
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Support Hours */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-5 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Support Hours</h3>
            <div className="text-sm space-y-1.5">
              <div className="flex justify-between"><span>Mon - Fri</span><span className="font-semibold">9 AM - 6 PM</span></div>
              <div className="flex justify-between"><span>Saturday</span><span className="font-semibold">10 AM - 4 PM</span></div>
              <div className="flex justify-between"><span>Sunday</span><span className="font-semibold">Emergency Support</span></div>
            </div>
          </div>
        </div>

      </div>

      {/* Custom Animation */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out; }
      `}</style>
    </div>
  );
};

/* Contact Info Data */
const contactInfo = [
  {
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>),
    title: "Our Office",
    content: "Visit our headquarters",
    details: "Lucknow, Uttar Pradesh",
    color: "from-purple-500 to-blue-500"
  },
  {
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>),
    title: "Email Us",
    content: "Send us an email",
    details: "contact@attendancepro.com",
    color: "from-green-500 to-blue-500"
  },
  {
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>),
    title: "Call Us",
    content: "Mon to Fri, 9 AM to 6 PM",
    details: "+91 98765 43210",
    color: "from-orange-500 to-red-500"
  }
];

export default Contact;
