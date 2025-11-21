import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <section className="text-center mb-12 lg:mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6 shadow-lg">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            About AttendancePro
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            A revolutionary multi-organization platform designed to transform educational management through advanced attendance tracking, arrear management, and AI-powered insights.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mt-6"></div>
        </section>

        {/* Mission & Vision */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 lg:mb-16">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To revolutionize educational management by providing institutions with intelligent tools that streamline attendance tracking, arrear management, and student progress monitoring, enabling educators to focus on what matters most - teaching.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To become the leading educational management platform globally, empowering institutions with data-driven insights and AI-powered tools that enhance learning outcomes and operational efficiency across all educational sectors.
            </p>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="mb-12 lg:mb-16">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Core Features
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive tools designed to meet the evolving needs of modern educational institutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold mb-4 group-hover:scale-110 transition-transform duration-300">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

     <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 m-4 md:m-10 ">
  {techStack.map((tech, index) => (
    <div key={index} className="text-center group">

      <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 
      bg-gradient-to-br from-purple-100 to-blue-100 
      rounded-2xl flex items-center justify-center 
      mx-auto mb-2 sm:mb-3 group-hover:scale-110 
      transition-transform duration-300">
        <span className="text-xl sm:text-2xl">{tech.icon}</span>
      </div>

      <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">
        {tech.name}
      </h3>

      <p className="text-xs sm:text-sm text-gray-600">
        {tech.role}
      </p>

    </div>
  ))}
</div>

        {/* Statistics Section */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 lg:mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Team Philosophy */}
        <section className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 sm:p-8 lg:p-10 text-white text-center mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Our Philosophy
          </h2>
          <p className="text-lg sm:text-xl text-purple-100 leading-relaxed max-w-4xl mx-auto">
            "We believe that technology should enhance education, not complicate it. Our platform is designed with simplicity, efficiency, and impact in mind - empowering educators to focus on teaching while we handle the administrative complexities."
          </p>
          <div className="mt-6 text-purple-200 font-medium">
            - The AttendancePro Team
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of educational institutions already using AttendancePro to streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform">
              Get Started Today
            </button>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-6 py-3 border-2 border-purple-600 text-purple-600 font-semibold rounded-xl hover:bg-purple-600 hover:text-white transition-all duration-300 hover:scale-105 transform"
            >
              Back to Top
            </button>
          </div>
        </section>

      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

// Static data for SEO and content
const features = [
  {
    title: "Multi-Organization Management",
    description: "Seamlessly manage multiple institutions, branches, and coaching centers with separate data isolation and unified reporting."
  },
  {
    title: "Advanced Attendance Tracking",
    description: "Real-time attendance monitoring with biometric integration, mobile check-ins, and comprehensive analytics dashboard."
  },
  {
    title: "Smart Arrear Management",
    description: "Automated arrear tracking with progress monitoring, reminder systems, and performance analytics for coaching centers."
  },
  {
    title: "AI-Powered Insights",
    description: "Generate automated notes, get predictive analytics, and receive AI-based recommendations for student improvement."
  },
  {
    title: "Role-Based Access Control",
    description: "Secure multi-level access for admins, coaches, students, and parents with customizable permission sets."
  },
  {
    title: "Comprehensive Reporting",
    description: "Generate detailed reports for attendance, performance, arrears, and compliance with export capabilities."
  }
];

const techStack = [
  { name: "React", role: "Frontend Framework", icon: "⚛️" },
  { name: "Tailwind CSS", role: "Styling Framework", icon: "🎨" },
  { name: "Node.js", role: "Backend Runtime", icon: "🟢" },
  { name: "MongoDB", role: "Database", icon: "🍃" },
  { name: "Express.js", role: "Backend Framework", icon: "🚀" },
  { name: "JWT", role: "Authentication", icon: "🔐" },
  { name: "Mongoose", role: "ODM Library", icon: "🐟" },
  { name: "AI Integration", role: "Smart Features", icon: "🤖" }
];

const stats = [
  { value: "500+", label: "Organizations" },
  { value: "50K+", label: "Students" },
  { value: "2K+", label: "Coaches" },
  { value: "99.9%", label: "Uptime" }
];

export default About;