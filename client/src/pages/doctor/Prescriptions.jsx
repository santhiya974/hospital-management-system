import { useState, useEffect, useMemo } from 'react';
import { FileText, Calendar, Pill } from 'lucide-react';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { SkeletonCard } from '../../components/common/Skeleton';
import { useTableData } from '../../hooks/useTableData';
import { getMyPrescriptions } from '../../api/doctorApi';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyPrescriptions();
        setPrescriptions(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const searchFields = useMemo(() => [(rx) => rx.patient?.userId?.name, (rx) => rx.diagnosis], []);
  const { search, setSearch, page, setPage, totalPages, paginated, totalCount } = useTableData(prescriptions, searchFields);

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Prescriptions</h1>
        <p className="text-sm text-slate-500 mt-1">{totalCount} prescription{totalCount !== 1 ? 's' : ''} issued</p>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
      )}

      <SearchBar value={search} onChange={setSearch} placeholder="Search by patient name or diagnosis..." className="max-w-md" />

      <div className="space-y-3">
        {paginated.map((rx) => (
          <Card key={rx._id} hoverable>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center text-white shrink-0">
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink truncate">{rx.patient?.userId?.name}</p>
                <p className="text-sm text-slate-500">{rx.diagnosis}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(rx.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Pill size={11} /> {rx.medicines.length} medicine(s)</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {paginated.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-slate-400">No prescriptions found{search ? ' matching your search' : ''}.</p>
        </Card>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default Prescriptions;