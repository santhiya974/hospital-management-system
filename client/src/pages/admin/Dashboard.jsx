import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Stethoscope, Building2, CalendarDays, ArrowUpRight, Plus } from 'lucide-react';
import Card from '../../components/common/Card';
import { SkeletonStatGrid, SkeletonCard } from '../../components/common/Skeleton';
import { getDashboardStats } from '../../api/adminApi';

const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <Card hoverable className="relative overflow-hidden">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-ink mt-1">{value}</p>
      </div>
      <div className={`w-11 h-11 rounded-2xl ${gradient} flex items-center justify-center shadow-soft shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </Card>
);

const QuickAction = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 text-left w-full"
  >
    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
      <Icon size={18} className="text-primary" />
    </div>
    <span className="text-sm font-medium text-ink">{label}</span>
    <ArrowUpRight size={16} className="text-slate-300 ml-auto" />
  </button>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonStatGrid count={4} />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of hospital operations today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Stethoscope} label="Total Doctors" value={stats.totalDoctors} gradient="gradient-primary" />
        <StatCard icon={Users} label="Total Patients" value={stats.totalPatients} gradient="bg-blue-500" />
        <StatCard icon={Building2} label="Departments" value={stats.totalDepartments} gradient="bg-amber-500" />
        <StatCard icon={CalendarDays} label="Today's Appointments" value={stats.todaysAppointments} gradient="bg-violet-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Appointment Status Breakdown" className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(stats.statusCounts).map(([status, count]) => {
              const colors = {
                pending: 'bg-amber-50 text-amber-700',
                confirmed: 'bg-blue-50 text-blue-700',
                completed: 'bg-emerald-50 text-emerald-700',
                cancelled: 'bg-red-50 text-red-700',
              };
              return (
                <div key={status} className={`text-center p-4 rounded-2xl ${colors[status] || 'bg-slate-50'}`}>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs font-medium capitalize mt-0.5">{status}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="space-y-3">
            <QuickAction icon={Plus} label="Add Doctor" onClick={() => navigate('/admin/doctors')} />
            <QuickAction icon={Building2} label="Add Department" onClick={() => navigate('/admin/departments')} />
            <QuickAction icon={CalendarDays} label="View Appointments" onClick={() => navigate('/admin/appointments')} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;