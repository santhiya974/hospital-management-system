import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Mail, Phone, Building2, IndianRupee } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { SkeletonCard } from '../../components/common/Skeleton';
import { useTableData } from '../../hooks/useTableData';
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDepartments,
} from '../../api/adminApi';

const emptyForm = {
  name: '', email: '', password: '', phone: '', department: '',
  specialization: '', qualification: '', experience: '',
  licenseNumber: '', consultationFee: '', bio: '',
};

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [doctorsRes, deptsRes] = await Promise.all([getDoctors(), getDepartments()]);
      setDoctors(doctorsRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const searchFields = useMemo(() => [
    (d) => d.userId?.name,
    (d) => d.specialization,
    (d) => d.department?.name,
  ], []);
  const { search, setSearch, page, setPage, totalPages, paginated, totalCount } = useTableData(doctors, searchFields);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (doc) => {
    setEditingId(doc._id);
    setFormData({
      name: doc.userId?.name || '', email: doc.userId?.email || '', password: '',
      phone: doc.userId?.phone || '', department: doc.department?._id || '',
      specialization: doc.specialization || '', qualification: doc.qualification || '',
      experience: doc.experience ?? '', licenseNumber: doc.licenseNumber || '',
      consultationFee: doc.consultationFee ?? '', bio: doc.bio || '',
    });
    setShowForm(true);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        const { email, password, licenseNumber, ...updatable } = formData;
        await updateDoctor(editingId, updatable);
      } else {
        await createDoctor(formData);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to save doctor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor? This will also remove their login account.')) return;
    try {
      await deleteDoctor(id);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete doctor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Doctors</h1>
          <p className="text-sm text-slate-500 mt-1">{totalCount} doctor{totalCount !== 1 ? 's' : ''} registered</p>
        </div>
        <Button onClick={openCreateForm} className="flex items-center gap-2">
          <Plus size={16} /> Add Doctor
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
      )}

      {showForm && (
        <Card className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink">{editingId ? 'Edit Doctor' : 'New Doctor'}</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
              <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required disabled={!!editingId} className={editingId ? 'bg-slate-50' : ''} />
              {!editingId && (
                <div className="relative">
                  <Input
                    label="Password" type={showPassword ? 'text' : 'password'} name="password"
                    value={formData.password} onChange={handleChange} required
                    rightIcon={
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                </div>
              )}
              <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Department</label>
                <select name="department" value={formData.department} onChange={handleChange} required
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-[var(--radius-input)] text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary">
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <Input label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} required />
              <Input label="Qualification" name="qualification" value={formData.qualification} onChange={handleChange} required />
              <Input label="Experience (years)" type="number" name="experience" value={formData.experience} onChange={handleChange} required />
              <Input label="License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required disabled={!!editingId} className={editingId ? 'bg-slate-50' : ''} />
              <Input label="Consultation Fee (₹)" type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} required />
            </div>
            <Input label="Bio" name="bio" value={formData.bio} onChange={handleChange} />
            <Button type="submit" loading={saving}>{editingId ? 'Update' : 'Create'}</Button>
          </form>
        </Card>
      )}

      <SearchBar value={search} onChange={setSearch} placeholder="Search doctors by name, specialization, department..." className="max-w-md" />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((doc) => (
              <Card key={doc._id} hoverable>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {doc.userId?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink truncate">Dr. {doc.userId?.name}</p>
                    <p className="text-xs text-slate-500">{doc.specialization}</p>
                    <Badge status={doc.userId?.isActive ? 'active' : 'inactive'} className="mt-1.5">
                      {doc.userId?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                  <p className="flex items-center gap-2"><Mail size={12} /> {doc.userId?.email}</p>
                  <p className="flex items-center gap-2"><Phone size={12} /> {doc.userId?.phone || '—'}</p>
                  <p className="flex items-center gap-2"><Building2 size={12} /> {doc.department?.name}</p>
                  <p className="flex items-center gap-2"><IndianRupee size={12} /> {doc.consultationFee} consultation</p>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button onClick={() => openEditForm(doc)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(doc._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-danger bg-red-50 hover:bg-red-100 transition-colors">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {paginated.length === 0 && (
            <Card className="text-center py-12">
              <p className="text-slate-400">No doctors found{search ? ' matching your search' : ''}.</p>
            </Card>
          )}

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default Doctors;