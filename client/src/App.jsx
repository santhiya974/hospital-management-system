import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Loader from './components/common/Loader';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import AdminDashboard from './pages/admin/Dashboard';
import AdminDepartments from './pages/admin/Departments';
import AdminDoctors from './pages/admin/Doctors';
import AdminPatients from './pages/admin/Patients';
import AdminAppointments from './pages/admin/Appointments';
import AdminReports from './pages/admin/Reports';

import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import CreatePrescription from './pages/doctor/CreatePrescription';
import DoctorProfile from './pages/doctor/Profile';
import DoctorPrescriptions from './pages/doctor/Prescriptions';

import PatientDashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import MedicalHistory from './pages/patient/MedicalHistory';
import PrescriptionDetail from './pages/patient/PrescriptionDetail';
import Profile from './pages/patient/Profile';

const roleHomeMap = {
  admin: '/admin/dashboard',
  doctor: '/doctor/dashboard',
  patient: '/patient/dashboard',
};

function App() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <Loader fullScreen />;

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? roleHomeMap[role] : '/login'} replace />}
      />
      <Route path="/login" element={isAuthenticated ? <Navigate to={roleHomeMap[role]} replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={roleHomeMap[role]} replace /> : <Register />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="doctors" element={<AdminDoctors />} />
        <Route path="patients" element={<AdminPatients />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* Doctor routes */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['doctor']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="prescriptions/new" element={<CreatePrescription />} />
        <Route path="prescriptions" element={<DoctorPrescriptions />} />
        <Route path="profile" element={<DoctorProfile />} />
      </Route>

      {/* Patient routes */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['patient']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="history" element={<MedicalHistory />} />
        <Route path="prescriptions/:id" element={<PrescriptionDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;