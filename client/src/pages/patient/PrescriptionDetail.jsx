import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { getPrescriptionById } from '../../api/patientApi';

const PrescriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPrescriptionById(id);
        setPrescription(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load prescription');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => navigate('/patient/history')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-ink"
        >
          <ArrowLeft size={16} /> Back to History
        </button>
        <Button onClick={() => window.print()} className="flex items-center gap-2">
          <Printer size={16} /> Print / Download
        </Button>
      </div>

      <Card className="max-w-2xl">
        <div className="mb-6 pb-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-ink">Prescription</h1>
          <p className="text-sm text-slate-500">
            Dr. {prescription.doctor?.userId?.name} — {new Date(prescription.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Diagnosis</h3>
          <p className="text-ink">{prescription.diagnosis}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Medicines</h3>
          <div className="space-y-2">
            {prescription.medicines.map((med, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                <p className="font-medium text-ink">{med.name} — {med.dosage}</p>
                <p className="text-sm text-slate-500">{med.frequency} for {med.duration}</p>
                {med.instructions && (
                  <p className="text-sm text-slate-400 mt-1">{med.instructions}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {prescription.advice && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Advice</h3>
            <p className="text-ink">{prescription.advice}</p>
          </div>
        )}

        {prescription.followUpDate && (
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Follow-up Date</h3>
            <p className="text-ink">{new Date(prescription.followUpDate).toLocaleDateString()}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PrescriptionDetail;