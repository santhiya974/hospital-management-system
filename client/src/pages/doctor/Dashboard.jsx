import { useState, useEffect } from 'react';
import { Clock, User } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { SkeletonCard } from '../../components/common/Skeleton';
import { getTodaysAppointments } from '../../api/doctorApi';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTodaysAppointments();
        setAppointments(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <SkeletonCard />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Today's Appointments</h1>
        <p className="text-sm text-slate-500 mt-1">
          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} scheduled today
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
      )}

      {appointments.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Clock size={22} className="text-primary" />
          </div>
          <p className="text-slate-500">No appointments scheduled for today.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {appointments.map((apt) => (
            <Card key={apt._id} hoverable>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white font-semibold shrink-0">
                  {apt.patient?.userId?.name?.charAt(0) || <User size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink truncate">{apt.patient?.userId?.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock size={12} /> {apt.timeSlot}
                  </p>
                </div>
                <Badge status={apt.status} />
              </div>
              <p className="text-sm text-slate-500 mt-3 pt-3 border-t border-slate-100">{apt.reason}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;