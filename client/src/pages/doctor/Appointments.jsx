import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Plus } from 'lucide-react';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { SkeletonCard } from '../../components/common/Skeleton';
import { useTableData } from '../../hooks/useTableData';
import { getMyAppointments, updateAppointmentStatus } from '../../api/doctorApi';

const statusOptions = ['pending', 'confirmed', 'completed', 'cancelled'];

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getMyAppointments(statusFilter ? { status: statusFilter } : {});
      setAppointments(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [statusFilter]);

  const searchFields = useMemo(() => [(a) => a.patient?.userId?.name, (a) => a.reason], []);
  const { search, setSearch, page, setPage, totalPages, paginated, totalCount } = useTableData(appointments, searchFields);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">{totalCount} appointment{totalCount !== 1 ? 's' : ''}</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-[var(--radius-input)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
      )}

      <SearchBar value={search} onChange={setSearch} placeholder="Search by patient name or reason..." className="max-w-md" />

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map((apt) => (
              <Card key={apt._id} hoverable>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-semibold shrink-0">
                      {apt.patient?.userId?.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink truncate">{apt.patient?.userId?.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {new Date(apt.appointmentDate).toLocaleDateString()} · {apt.timeSlot}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={apt.status}
                      disabled={updatingId === apt._id}
                      onChange={(e) => handleStatusChange(apt._id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {apt.status === 'completed' && (
                      <button
                        onClick={() => navigate('/doctor/prescriptions/new', { state: { appointment: apt } })}
                        className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Plus size={12} /> Prescription
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-3 pt-3 border-t border-slate-100">{apt.reason}</p>
              </Card>
            ))}
          </div>

          {paginated.length === 0 && (
            <Card className="text-center py-12">
              <p className="text-slate-400">No appointments found{search ? ' matching your search' : ''}.</p>
            </Card>
          )}

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default Appointments;