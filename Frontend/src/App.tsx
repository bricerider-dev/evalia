import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import FilieresPage from "./pages/admin/FilieresPage";
import StudentsPage from "./pages/admin/StudentsPage";
import TeachersPage from "./pages/admin/TeachersPage";
import SubjectsPage from "./pages/admin/SubjectsPage";
import EvaluationsPage from "./pages/admin/EvaluationsPage";
import GradesEntryPage from "./pages/teacher/GradesEntryPage";
import StudentGradesPage from "./pages/student/StudentGradesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/dashboard/filieres"          
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <FilieresPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/teachers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TeachersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/subjects"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SubjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/evaluations"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <EvaluationsPage />
                </ProtectedRoute>
              }
            />

            {/* Teacher routes */}
            <Route
              path="/dashboard/grades"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <GradesEntryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/my-subjects"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/statistics"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Student routes */}
            <Route
              path="/dashboard/my-grades"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentGradesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/transcript"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentGradesPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
