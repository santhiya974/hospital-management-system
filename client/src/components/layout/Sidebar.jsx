import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  CalendarDays,
  Building2,
  BarChart3,
  UserCircle,
  ClipboardList,
  FileText,
  CalendarPlus,
  ChevronLeft,
  HeartPulse,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navConfig = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
    { to: '/admin/patients', label: 'Patients', icon: Users },
    { to: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ],
  doctor: [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctor/appointments', label: "Today's Appointments", icon: CalendarDays },
    { to: '/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
    { to: '/doctor/profile', label: 'Profile', icon: UserCircle },
  ],
  patient: [
    { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patient/book-appointment', label: 'Book Appointment', icon: CalendarPlus },
    { to: '/patient/appointments', label: 'My Appointments', icon: ClipboardList },
    { to: '/patient/history', label: 'Medical History', icon: FileText },
    { to: '/patient/profile', label: 'Profile', icon: UserCircle },
  ],
};

const Sidebar = ({ collapsed, onToggle }) => {
  const { role } = useAuth();
  const links = navConfig[role] || [];

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-white border-r border-slate-100 min-h-screen flex flex-col transition-all duration-300 relative`}
    >
      <div className="h-16 flex items-center px-4 border-b border-slate-100 gap-2">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-soft">
          <HeartPulse className="text-white" size={18} />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-ink whitespace-nowrap">
            HMS <span className="text-primary">Care</span>
          </span>
        )}
      </div>

      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-soft hover:bg-slate-50 transition-colors z-10"
      >
        <ChevronLeft
          size={14}
          className={`text-slate-500 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
        />
      </button>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                isActive
                  ? 'gradient-primary text-white shadow-soft'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-ink'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;