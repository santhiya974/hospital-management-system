import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, CalendarDays, Clock, FileText } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { SkeletonCard } from '../../components/common/Skeleton';
import Toast from '../../components/common/Toast';
import { getDepartmentsList, getDoctorsList, bookAppointment } from '../../api/patientApi';

const timeSlots = [
  '09:00 AM - 09:30 AM', '09:30 AM - 10:00 AM', '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM', '11:00 AM - 11:30 AM',
  '02:00 PM - 02:30 PM', '02:30 PM - 03:00 PM', '03:00 PM - 03:30 PM',
];

const BookAppointment = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    department: '', doctor: '', appointmentDate: '', timeSlot: '', reason: '',
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await getDepartmentsList();
        setDepartments(res.data);
      } catch (err) {
        setToast({ message: err.message || 'Failed to load departments', type: 'error' });
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleDepartmentChange = async (e) => {
    const departmentId = e.target.value;
    setFormData({ ...formData, department: departmentId, doctor: '' });
    setDoctors([]);
    if (!departmentId) return;

    setLoadingDoctors(true);
    try {
      const res = await getDoctorsList(departmentId);
      setDoctors(res.data);
    } catch (err) {
      setToast({ message: err.message || 'Failed to load doctors', type: 'error' });
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await bookAppointment(formData);
      setToast({ message: 'Appointment booked successfully!', type: 'success' });
      setTimeout(() => navigate('/patient/appointments'), 1000);
    } catch (err) {
      setToast({ message: err.message || 'Failed to book appointment', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loadingDepts) return <SkeletonCard />;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Book an Appointment</h1>
        <p className="text-sm text-slate-500 mt-1">Choose a department and doctor to get started</p>
      </div>

      <Card className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-ink mb-1.5">
              <Stethoscope size={14} /> Department <span className="text-danger">*</span>
            </label>
            <select
              name="department" value={formData.department} onChange={handleDepartmentChange} required
              className="w-full px-3 py-2.5 border border-slate-200 rounded-[var(--radius-input)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              <option value="">Select a department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-ink mb-1.5">
              <Stethoscope size={14} /> Doctor <span className="text-danger">*</span>
            </label>
            <select
              name="doctor" value={formData.doctor} onChange={handleChange} required
              disabled={!formData.department || loadingDoctors}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-[var(--radius-input)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:bg-slate-50"
            >
              <option value="">{loadingDoctors ? 'Loading doctors...' : 'Select a doctor'}</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  Dr. {doc.userId?.name} — {doc.specialization} (₹{doc.consultationFee})
                </option>
              ))}
            </select>
            {formData.department && !loadingDoctors && doctors.length === 0 && (
              <p className="text-xs text-slate-400 mt-1">No available doctors in this department.</p>
            )}
          </div>

          <Input
            label="Appointment Date" type="date" name="appointmentDate" min={today}
            value={formData.appointmentDate} onChange={handleChange} required
            leftIcon={<CalendarDays size={15} />}
          />

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-ink mb-1.5">
              <Clock size={14} /> Time Slot <span className="text-danger">*</span>
            </label>
            <select
              name="timeSlot" value={formData.timeSlot} onChange={handleChange} required
              className="w-full px-3 py-2.5 border border-slate-200 rounded-[var(--radius-input)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              <option value="">Select a time slot</option>
              {timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
            </select>
          </div>

          <Input
            label="Reason for Visit" name="reason" value={formData.reason} onChange={handleChange}
            placeholder="Briefly describe your symptoms or reason" required
            leftIcon={<FileText size={15} />}
          />

          <Button type="submit" loading={saving} className="w-full">Book Appointment</Button>
        </form>
      </Card>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
};

export default BookAppointment;