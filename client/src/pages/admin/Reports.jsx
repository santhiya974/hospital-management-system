import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { getAppointmentTrends, getRevenueReport, getTopDoctors } from '../../api/adminApi';

const Reports = () => {
  const [trends, setTrends] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [topDoctors, setTopDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [trendsRes, revenueRes, topDoctorsRes] = await Promise.all([
          getAppointmentTrends(),
          getRevenueReport(),
          getTopDoctors(),
        ]);
        setTrends(trendsRes.data.map((t) => ({ date: t._id, count: t.count })));
        setRevenue(revenueRes.data);
        setTopDoctors(topDoctorsRes.data);
      } catch (err) {
        setError(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Reports & Analytics</h1>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <Card title="Appointment Trends (Last 30 Days)" className="mb-6">
        {trends.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No appointment data in this range.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0F766E" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue by Department">
          <p className="text-2xl font-bold text-ink mb-4">
            ₹{revenue?.totalRevenue?.toLocaleString() || 0}
            <span className="text-sm font-normal text-slate-500 ml-2">total revenue</span>
          </p>
          {revenue?.revenueByDepartment?.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No completed appointments yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenue?.revenueByDepartment || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="totalRevenue" fill="#0F766E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Top Doctors (by Completed Appointments)">
          <div className="space-y-3">
            {topDoctors.map((doc, idx) => (
              <div key={doc.doctorId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-ink">Dr. {doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.specialization}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-ink">{doc.completedCount} visits</span>
              </div>
            ))}
            {topDoctors.length === 0 && (
              <p className="text-center text-slate-400 py-8">No completed appointments yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;