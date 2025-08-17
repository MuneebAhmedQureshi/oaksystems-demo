import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProcessAssessment from './pages/ProcessAssessment';
import ProcessList from './pages/ProcessList';
import ProcessDetail from './pages/ProcessDetail';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import AIFeatures from './pages/AIFeatures';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Layout for authenticated pages
const AuthenticatedLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="d-flex">
        <Sidebar />
        <main className="main-content flex-grow-1">
          {children}
        </main>
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/assessment/new" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ProcessAssessment />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/assessment/edit/:id" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ProcessAssessment />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/processes" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ProcessList />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/processes/:id" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ProcessDetail />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Reports />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports/:id" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ReportDetail />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ai-features" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <AIFeatures />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
