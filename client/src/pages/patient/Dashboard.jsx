import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CalendarPlus } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { SkeletonCard } from '../../components/common/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { getMyAppointments } from '../../api/patientApi';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyAppointments();
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-slate-500 mt-1">Here's what's coming up for you</p>
        </div>
        <Button onClick={() => navigate('/patient/book-appointment')} className="flex items-center gap-2">
          <CalendarPlus size={16} /> Book Appointment
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
      )}

      {appointments.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <CalendarPlus size={22} className="text-primary" />
          </div>
          <p className="text-slate-500 mb-4">No appointments yet — book one to get started.</p>
          <Button onClick={() => navigate('/patient/book-appointment')}>Book Your First Appointment</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {appointments.slice(0, 6).map((apt) => (
            <Card key={apt._id} hoverable>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white font-semibold shrink-0">
                  {apt.doctor?.userId?.name?.charAt(0) || 'D'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink truncate">Dr. {apt.doctor?.userId?.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock size={12} /> {new Date(apt.appointmentDate).toLocaleDateString()} · {apt.timeSlot}
                  </p>
                </div>
                <Badge status={apt.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;