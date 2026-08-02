import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const roleHomeMap = {
  admin: '/admin/dashboard',
  doctor: '/doctor/dashboard',
  patient: '/patient/dashboard',
};

const RoleRoute = ({ allowedRoles, children }) => {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    return <Navigate to={roleHomeMap[role] || '/login'} replace />;
  }

  return children;
};

export default RoleRoute;