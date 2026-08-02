import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, Building2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { SkeletonCard } from '../../components/common/Skeleton';
import { useTableData } from '../../hooks/useTableData';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../../api/adminApi';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await getDepartments();
      setDepartments(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const searchFields = useMemo(() => [(d) => d.name, (d) => d.description], []);
  const { search, setSearch, page, setPage, totalPages, paginated, totalCount } = useTableData(departments, searchFields);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setShowForm(true);
  };

  const openEditForm = (dept) => {
    setEditingId(dept._id);
    setFormData({ name: dept.name, description: dept.description || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateDepartment(editingId, formData);
      } else {
        await createDepartment(formData);
      }
      setShowForm(false);
      fetchDepartments();
    } catch (err) {
      setError(err.message || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department? This cannot be undone.')) return;
    try {
      await deleteDepartment(id);
      fetchDepartments();
    } catch (err) {
      setError(err.message || 'Failed to delete department');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Departments</h1>
          <p className="text-sm text-slate-500 mt-1">{totalCount} department{totalCount !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openCreateForm} className="flex items-center gap-2">
          <Plus size={16} /> Add Department
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
      )}

      {showForm && (
        <Card className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink">{editingId ? 'Edit Department' : 'New Department'}</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name" value={formData.name} required
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              leftIcon={<Building2 size={15} />}
            />
            <Input
              label="Description" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Button type="submit" loading={saving}>{editingId ? 'Update' : 'Create'}</Button>
          </form>
        </Card>
      )}

      <SearchBar value={search} onChange={setSearch} placeholder="Search departments..." className="max-w-md" />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((dept) => (
              <Card key={dept._id} hoverable>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0">
                    <Building2 size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink truncate">{dept.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{dept.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button onClick={() => openEditForm(dept)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(dept._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-danger bg-red-50 hover:bg-red-100 transition-colors">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {paginated.length === 0 && (
            <Card className="text-center py-12">
              <p className="text-slate-400">No departments found{search ? ' matching your search' : ''}.</p>
            </Card>
          )}

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default Departments;