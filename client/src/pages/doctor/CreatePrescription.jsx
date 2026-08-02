import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { createPrescription } from '../../api/doctorApi';

const emptyMedicine = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };

const CreatePrescription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const appointment = location.state?.appointment;

  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([{ ...emptyMedicine }]);
  const [advice, setAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  if (!appointment) {
    return (
      <div>
        <button
          onClick={() => navigate('/doctor/appointments')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-ink mb-4"
        >
          <ArrowLeft size={16} /> Back to Appointments
        </button>
        <Card>
          <p className="text-slate-500">
            No appointment selected. Go to Appointments and click "+ Add Prescription" on a completed appointment.
          </p>
        </Card>
      </div>
    );
  }

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { ...emptyMedicine }]);
  };

  const removeMedicine = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await createPrescription({
        appointmentId: appointment._id,
        diagnosis,
        medicines,
        advice,
        followUpDate: followUpDate || undefined,
      });
      setSuccess('Prescription created successfully!');
      setTimeout(() => navigate('/doctor/appointments'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to create prescription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate('/doctor/appointments')}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-ink mb-4"
      >
        <ArrowLeft size={16} /> Back to Appointments
      </button>

      <h1 className="text-2xl font-bold text-ink mb-1">New Prescription</h1>
      <p className="text-sm text-slate-500 mb-6">
        For {appointment.patient?.userId?.name} — {new Date(appointment.appointmentDate).toLocaleDateString()}
      </p>

      <Card className="max-w-2xl">
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            required
            placeholder="e.g. Mild hypertension"
          />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">Medicines</h3>
              <button
                type="button"
                onClick={addMedicine}
                className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
              >
                <Plus size={14} /> Add Medicine
              </button>
            </div>

            <div className="space-y-4">
              {medicines.map((med, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl relative border border-slate-100">
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Medicine Name"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                      required
                    />
                    <Input
                      label="Dosage"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      required
                      placeholder="e.g. 500mg"
                    />
                    <Input
                      label="Frequency"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                      required
                      placeholder="e.g. Twice a day"
                    />
                    <Input
                      label="Duration"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      required
                      placeholder="e.g. 5 days"
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Instructions (optional)"
                        value={med.instructions}
                        onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                        placeholder="e.g. Take after food"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Input
            label="Advice (optional)"
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            placeholder="e.g. Reduce salt intake"
          />

          <Input
            label="Follow-up Date (optional)"
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />

          <Button type="submit" loading={saving} className="w-full sm:w-auto">
  Create Prescription
</Button>
        </form>
      </Card>
    </div>
  );
};

export default CreatePrescription;