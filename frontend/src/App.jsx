import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FoodLoopProvider } from './context/FoodLoopContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Role-based portal pages
import SelectHostel from './pages/mess/SelectHostel';
import MessDashboard from './pages/mess/MessDashboard';
import RecordMeal from './pages/mess/RecordMeal';
import MealHistory from './pages/mess/MealHistory';
import CreateDonation from './pages/mess/CreateDonation';
import MyDonations from './pages/mess/MyDonations';
import RecordWaste from './pages/mess/RecordWaste';
import NgoDashboard from './pages/ngo/NgoDashboard';
import AvailableFood from './pages/ngo/AvailableFood';
import RecommendedFood from './pages/ngo/RecommendedFood';
import MyClaims from './pages/ngo/MyClaims';
import MyPickups from './pages/ngo/MyPickups';
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import HostelAnalytics from './pages/supervisor/HostelAnalytics';
import WasteRecords from './pages/supervisor/WasteRecords';
import SupervisorDonations from './pages/supervisor/SupervisorDonations';
import ClaimsPickups from './pages/supervisor/ClaimsPickups';
import ManageUsers from './pages/supervisor/ManageUsers';
import Reports from './pages/supervisor/Reports';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <FoodLoopProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Mess Manager Protected Routes (Internal Role: MESS) */}
            <Route
              path="/mess/select-hostel"
              element={
                <ProtectedRoute allowedRoles={['MESS']}>
                  <SelectHostel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mess/dashboard"
              element={
                <ProtectedRoute allowedRoles={['MESS']}>
                  <MessDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mess/record-meal"
              element={
                <ProtectedRoute allowedRoles={['MESS']}>
                  <RecordMeal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mess/meal-history"
              element={
                <ProtectedRoute allowedRoles={['MESS']}>
                  <MealHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mess/create-donation"
              element={
                <ProtectedRoute allowedRoles={['MESS']}>
                  <CreateDonation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mess/my-donations"
              element={
                <ProtectedRoute allowedRoles={['MESS']}>
                  <MyDonations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mess/record-waste"
              element={
                <ProtectedRoute allowedRoles={['MESS']}>
                  <RecordWaste />
                </ProtectedRoute>
              }
            />

            {/* NGO Partner Protected Routes (Internal Role: NGO) */}
            <Route
              path="/ngo/dashboard"
              element={
                <ProtectedRoute allowedRoles={['NGO']}>
                  <NgoDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/available-food"
              element={
                <ProtectedRoute allowedRoles={['NGO']}>
                  <AvailableFood />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/recommended"
              element={
                <ProtectedRoute allowedRoles={['NGO']}>
                  <RecommendedFood />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/my-claims"
              element={
                <ProtectedRoute allowedRoles={['NGO']}>
                  <MyClaims />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/my-pickups"
              element={
                <ProtectedRoute allowedRoles={['NGO']}>
                  <MyPickups />
                </ProtectedRoute>
              }
            />

            {/* Campus Supervisor Protected Routes (Internal Role: ADMIN) */}
            <Route
              path="/supervisor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <SupervisorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supervisor/hostel-analytics"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <HostelAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supervisor/waste-records"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <WasteRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supervisor/donations"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <SupervisorDonations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supervisor/claims-pickups"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ClaimsPickups />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supervisor/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supervisor/reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </FoodLoopProvider>
      </AuthProvider>
    </Router>
  );
}
