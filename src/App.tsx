import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/layouts/MainLayout";
import { AssignmentsPage } from '@/pages/assignments/AssignmentsPage';

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Main Pages
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import ClassesList from "./pages/classes/ClassesList";
import ClassDetail from "./pages/classes/ClassDetail";
import StudentAssignments from "./pages/student/StudentAssignments";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import StudentLayout from "./components/layouts/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import Profile from "./pages/student/Profile";
import { GitHubCallback } from './pages/GitHubCallback';
import Research from './pages/Research';

// Teacher Pages
import TeacherLayout from "./components/layouts/TeacherLayout";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherAssignments from "./pages/teacher/TeacherAssignments";
import TeacherStudents from "./pages/teacher/TeacherStudents";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              {/* Landing page route */}
              <Route path="/" element={<Index />} />
              
              {/* Auth routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              
              {/* Protected routes with MainLayout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Classes routes */}
              <Route
                path="/classes"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ClassesList />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/classes/:id"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ClassDetail />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Research Papers route */}
              <Route
                path="/research"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Research />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Student routes */}
              <Route
                path="/student/*"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentLayout>
                      <Outlet />
                    </StudentLayout>
                  </ProtectedRoute>
                }
              >
                <Route index element={<StudentDashboard />} />
                <Route path="classes" element={<ClassesList />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="assignments" element={<StudentAssignments />} />
                <Route path="profile" element={<Profile />} />
                <Route path="research" element={<Research />} />
              </Route>
              
              {/* Teacher routes */}
              <Route
                path="/teacher/*"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherLayout>
                      <Outlet />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              >
                <Route index element={<TeacherDashboard />} />
                <Route path="classes" element={<ClassesList />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="assignments" element={<TeacherAssignments />} />
                <Route path="students" element={<TeacherStudents />} />
                <Route path="research" element={<Research />} />
              </Route>
              
              {/* Calendar route */}
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Calendar />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Admin routes */}
              <Route
                path="/users/*"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <MainLayout>
                      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-2xl">🚧</span>
                        </div>
                        <h1 className="text-2xl font-semibold">User Management Coming Soon</h1>
                        <p className="text-muted-foreground max-w-md">
                          We're building an advanced user management system for administrators. Check back soon!
                        </p>
                      </div>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Profile route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Profile />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Unauthorized page */}
              <Route 
                path="/unauthorized" 
                element={
                  <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center max-w-md p-6">
                      <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto mb-4 flex items-center justify-center">
                        <span className="text-destructive text-2xl">⚠️</span>
                      </div>
                      <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
                      <p className="text-muted-foreground mb-6">
                        You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
                      </p>
                      <a 
                        href="/dashboard" 
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                      >
                        Return to Dashboard
                      </a>
                    </div>
                  </div>
                }
              />
              
              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
              
              {/* GitHub callback route */}
              <Route path="/github-callback" element={<GitHubCallback />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
