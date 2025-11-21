// App.js
import "./styles/globals.css";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminRoute, CoachRoute } from "./components/ProtectedRoute";
import Home from "./pages/common/Home";
import Navbar from "./components/layouts/Navbar";
import Footer from "./components/layouts/Footer";
import AuthPage from "./pages/common/AuthPage";
import ForgetPassword from "./pages/common/ForgetPassword";
import Dashboard from "./pages/admin/Dashboard";
import CreateCoach from "./pages/admin/CreateCoach";
import CreateStudent from "./pages/admin/CreateStudent";
import CoachDashboard from "./pages/coaches/CoachDashboard";
import BatchStudents from "./pages/coaches/BatchStudents";
import CreateBatch from "./pages/admin/CreateBatches";
import About from "./pages/common/About";

import StudentDetails from "./pages/coaches/StudentDetails";
import Contact from "./pages/common/Contact ";
import { ToastContainer } from "react-toastify";
import { BatchProvider } from "./context/BatchContext";
import { CoachProvider } from "./context/CoachContext";
import AssignBatches from "./components/AssignBatches";
import { StudentProvider } from "./context/StudentContext";
import ExcelUpload from "./pages/admin/ExcelUpload";
import { CoachSessionProvider } from "./coachcontext/CoachSessionContext";
import CreateStudentByCoach from "./pages/coaches/CreateStudentByCoach";
import ExcelUploadByCoach from "./pages/coaches/ExcelUploadByCoach";

export default function App() {
  return (
    <AuthProvider>
      <BatchProvider>
        <CoachProvider>
          <StudentProvider>
            <CoachSessionProvider>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/forgot-password" element={<ForgetPassword />} />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin-dashboard"
                  element={
                    <AdminRoute>
                      <Dashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/create-batch"
                  element={
                    <AdminRoute>
                      <CreateBatch />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/create-coach"
                  element={
                    <AdminRoute>
                      <CreateCoach />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/assign-batches/:id"
                  element={
                    <AdminRoute>
                      <AssignBatches />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/create-student/:id"
                  element={
                    <AdminRoute>
                      <CreateStudent />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/students/upload/:batchId"
                  element={
                    <AdminRoute>
                      <ExcelUpload />
                    </AdminRoute>
                  }
                />

                {/* Coach Protected Routes */}
                <Route
                  path="/coach-dashboard"
                  element={
                    <CoachRoute>
                      <CoachDashboard />
                    </CoachRoute>
                  }
                />
                <Route
                  path="/coach/batch/:batchId"
                  element={
                    <CoachRoute>
                      <BatchStudents />
                    </CoachRoute>
                  }
                />
                <Route
                  path="/coach/create/student/:batchId"
                  element={
                    <CoachRoute>
                      <CreateStudentByCoach />
                    </CoachRoute>
                  }
                />
                <Route
                  path="/coach/student/upload/:batchId"
                  element={
                    <CoachRoute>
                      <ExcelUploadByCoach />
                    </CoachRoute>
                  }
                />
                <Route
                  path="/coach/student/details/:studentId"
                  element={
                    <CoachRoute>
                      <StudentDetails />
                    </CoachRoute>
                  }
                />
              </Routes>
              <ToastContainer />
              <Footer />
            </CoachSessionProvider>
          </StudentProvider>
        </CoachProvider>
      </BatchProvider>
    </AuthProvider>
  );
}
