import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { getMyMedicalHistory } from '../../api/patientApi';

const MedicalHistory = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyMedicalHistory();
        setAppointments(res.data.appointments);
        setPrescriptions(res.data.prescriptions);
      } catch (err) {
        setError(err.message || 'Failed to load medical history');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Medical History</h1>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <Card title="Past Consultations" className="mb-6">
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div key={apt._id} className="p-3 rounded-lg bg-slate-50">
              <p className="font-medium text-ink">Dr. {apt.doctor?.userId?.name}</p>
              <p className="text-sm text-slate-500">
                {new Date(apt.appointmentDate).toLocaleDateString()} — {apt.reason}
              </p>
              {apt.doctorNotes && (
                <p className="text-sm text-slate-400 mt-1">Notes: {apt.doctorNotes}</p>
              )}
            </div>
          ))}
          {appointments.length === 0 && (
            <p className="text-center text-slate-400 py-4">No completed consultations yet.</p>
          )}
        </div>
      </Card>

      <Card title="Prescriptions">
        <div className="space-y-3">
          {prescriptions.map((rx) => (
            <div
              key={rx._id}
              onClick={() => navigate(`/patient/prescriptions/${rx._id}`)}
              className="p-3 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink">{rx.diagnosis}</p>
                  <p className="text-sm text-slate-500">
                    Dr. {rx.doctor?.userId?.name} — {new Date(rx.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs text-primary font-medium">View →</span>
              </div>
            </div>
          ))}
          {prescriptions.length === 0 && (
            <p className="text-center text-slate-400 py-4">No prescriptions yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MedicalHistory;