import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { getAllAppointments, updateAppointmentStatus, deleteAppointment } from '../../api/adminApi';

const statusOptions = ['pending', 'confirmed', 'completed', 'cancelled'];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getAllAppointments(statusFilter ? { status: statusFilter } : {});
      setAppointments(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateAppointmentStatus(id, { status });
      fetchAppointments();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment permanently?')) return;
    try {
      await deleteAppointment(id);
      fetchAppointments();
    } catch (err) {
      setError(err.message || 'Failed to delete appointment');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Appointments</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <Loader />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="pb-3 font-medium">Patient</th>
                  <th className="pb-3 font-medium">Doctor</th>
                  <th className="pb-3 font-medium">Date / Time</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt._id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 font-medium text-ink">{apt.patient?.userId?.name}</td>
                    <td className="py-3 text-slate-600">Dr. {apt.doctor?.userId?.name}</td>
                    <td className="py-3 text-slate-600">
                      {new Date(apt.appointmentDate).toLocaleDateString()} — {apt.timeSlot}
                    </td>
                    <td className="py-3">
                      <select
                        value={apt.status}
                        disabled={updatingId === apt._id}
                        onChange={(e) => handleStatusChange(apt._id, e.target.value)}
                        className="text-xs border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDelete(apt._id)} className="text-slate-500 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Appointments;