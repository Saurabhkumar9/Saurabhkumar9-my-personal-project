import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-6 animate-fade-in">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-600 mb-1 sm:mb-2">
                Welcome to
              </h2>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent leading-tight">
                AttendancePro
              </h1>
            </div>

            <p className="text-sm sm:text-base lg:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Advanced multi-organization arrear and attendance management system for educational institutions, coaching centers, and training organizations.
            </p>

            {/* CTA Buttons */}
            

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-900">500+</div>
                <div className="text-xs text-gray-600">Organizations</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-900">50K+</div>
                <div className="text-xs text-gray-600">Students</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-900">99.9%</div>
                <div className="text-xs text-gray-600">Uptime</div>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="flex-1 flex justify-center lg:justify-end mt-10 lg:mt-0 w-full animate-float">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 transition-transform duration-500 hover:rotate-1 w-full">
                
                {/* Organization Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl p-4 text-white text-center transform hover:scale-105 transition-transform duration-300">
                    <div className="text-sm font-semibold mb-2">Coaching Center</div>
                    <div className="text-2xl font-bold">24</div>
                    <div className="text-xs opacity-90">Active Batches</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-4 text-white text-center transform hover:scale-105 transition-transform duration-300">
                    <div className="text-sm font-semibold mb-2">School Branch</div>
                    <div className="text-2xl font-bold">18</div>
                    <div className="text-xs opacity-90">Active Batches</div>
                  </div>
                </div>

                {/* Stats Dashboard */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-300">
                    <span className="text-sm font-medium text-gray-700">Total Students</span>
                    <span className="text-lg font-bold text-purple-600">1,247</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-300">
                    <span className="text-sm font-medium text-gray-700">Active Coaches</span>
                    <span className="text-lg font-bold text-blue-600">48</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white transform hover:scale-105 transition-transform duration-300">
                    <span className="text-sm font-medium">Attendance Rate</span>
                    <span className="text-lg font-bold">94%</span>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="hidden md:block absolute -top-4 -left-4 w-16 h-16 bg-yellow-400 rounded-2xl opacity-20 animate-bounce"></div>
              <div className="hidden md:block absolute -bottom-4 -right-4 w-14 h-14 bg-green-400 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Choose AttendancePro?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Comprehensive attendance and arrear management solution designed for modern educational institutions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24 bg-white rounded-3xl m-4 sm:m-6 lg:m-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Simple 4-step process to streamline your attendance management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto group-hover:scale-110 transition-transform duration-300">
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transform translate-x-8"></div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Educational Leaders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.initials}
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 lg:py-20 text-center">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 sm:p-12 text-white">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Transform Your Attendance Management?
          </h2>
          <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
            Join 500+ educational institutions using AttendancePro to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform">
              Start Free Trial
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-purple-600 transition-all duration-300 hover:scale-105 transform">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Static data for SEO and content
const features = [
  {
    title: "Multi-Organization Management",
    description: "Seamlessly manage multiple educational institutions, coaching centers, and branches with separate data isolation and unified reporting."
  },
  {
    title: "Advanced Arrear Tracking",
    description: "Comprehensive arrear management system with batch-based coaching, progress monitoring, and automated reminder systems."
  },
  {
    title: "Smart Attendance System",
    description: "Real-time attendance tracking with biometric integration, mobile check-ins, and detailed analytics with predictive insights."
  },
  {
    title: "Automated Reporting",
    description: "Generate detailed reports for attendance, performance, arrears, and compliance with customizable templates and export options."
  },
  {
    title: "Role-Based Access Control",
    description: "Secure multi-level access control for admins, coaches, students, and parents with customizable permission sets."
  },
  {
    title: "Mobile Friendly Platform",
    description: "Fully responsive design works perfectly on all devices - desktop, tablet, and mobile with offline capability support."
  }
];

const steps = [
  {
    title: "Register Organization",
    description: "Sign up and register your educational institution or coaching center in minutes"
  },
  {
    title: "Setup Batches & Courses",
    description: "Create batches, define courses, and set up your academic structure"
  },
  {
    title: "Add Students & Coaches",
    description: "Import or manually add students and assign coaches to respective batches"
  },
  {
    title: "Start Tracking",
    description: "Begin tracking attendance, managing arrears, and generating reports"
  }
];

const testimonials = [
  {
    name: "Dr. Rajesh Kumar",
    role: "Director, Bright Future Coaching",
    initials: "RK",
    quote: "AttendancePro reduced our administrative workload by 70%. The arrear tracking feature is revolutionary for coaching centers."
  },
  {
    name: "Priya Sharma",
    role: "Principal, Delhi Public School",
    initials: "PS",
    quote: "Managing multiple branches became effortless. The real-time analytics help us make data-driven decisions for student success."
  },
  {
    name: "Amit Patel",
    role: "Founder, Science Academy",
    initials: "AP",
    quote: "The mobile app and offline support transformed how our coaches track attendance during outdoor sessions. Highly recommended!"
  }
];

export default Home;