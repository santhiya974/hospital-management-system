import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { getMyAppointments, cancelMyAppointment } from '../../api/patientApi';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getMyAppointments();
      setAppointments(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setCancellingId(id);
    try {
      await cancelMyAppointment(id);
      fetchAppointments();
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">My Appointments</h1>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {appointments.map((apt) => (
          <Card key={apt._id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink">Dr. {apt.doctor?.userId?.name}</p>
                <p className="text-sm text-slate-500">{apt.department?.name}</p>
                <p className="text-sm text-slate-500">
                  {new Date(apt.appointmentDate).toLocaleDateString()} — {apt.timeSlot}
                </p>
                <p className="text-sm text-slate-400 mt-1">Reason: {apt.reason}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge status={apt.status} />
                {['pending', 'confirmed'].includes(apt.status) && (
                  <Button
                    variant="danger"
                    className="text-xs px-3 py-1.5"
                    loading={cancellingId === apt._id}
                    onClick={() => handleCancel(apt._id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {appointments.length === 0 && (
          <Card>
            <p className="text-center text-slate-400 py-6">
              No appointments yet — book one to get started.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;