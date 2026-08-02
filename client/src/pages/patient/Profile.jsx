import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { getMyProfile, updateMyProfile } from '../../api/patientApi';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bloodGroup: 'unknown',
    address: { street: '', city: '', state: '', pincode: '' },
    emergencyContact: { name: '', phone: '', relation: '' },
    allergies: '',
    chronicConditions: '',
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyProfile();
        const p = res.data;
        setProfile(p);
        setFormData({
          name: p.userId?.name || '',
          phone: p.userId?.phone || '',
          bloodGroup: p.bloodGroup || 'unknown',
          address: p.address || { street: '', city: '', state: '', pincode: '' },
          emergencyContact: p.emergencyContact || { name: '', phone: '', relation: '' },
          allergies: (p.allergies || []).join(', '),
          chronicConditions: (p.chronicConditions || []).join(', '),
        });
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNestedChange = (section, field, value) => {
    setFormData({ ...formData, [section]: { ...formData[section], [field]: value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        allergies: formData.allergies.split(',').map((a) => a.trim()).filter(Boolean),
        chronicConditions: formData.chronicConditions.split(',').map((c) => c.trim()).filter(Boolean),
      };
      await updateMyProfile(payload);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">My Profile</h1>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Blood Group</label>
              <select
  name="bloodGroup"
  value={formData.bloodGroup}
  onChange={handleChange}
  className="w-full px-3 py-2.5 border border-slate-200 rounded-[var(--radius-input)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}

              </select>
            </div>
            <Input label="Email" value={profile?.userId?.email || ''} disabled className="bg-slate-50" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 pb-2 border-b border-slate-100">Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Street"
                value={formData.address.street}
                onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
              />
              <Input
                label="City"
                value={formData.address.city}
                onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
              />
              <Input
                label="State"
                value={formData.address.state}
                onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
              />
              <Input
                label="Pincode"
                value={formData.address.pincode}
                onChange={(e) => handleNestedChange('address', 'pincode', e.target.value)}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 pb-2 border-b border-slate-100">Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Name"
                value={formData.emergencyContact.name}
                onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
              />
              <Input
                label="Phone"
                value={formData.emergencyContact.phone}
                onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)}
              />
              <Input
                label="Relation"
                value={formData.emergencyContact.relation}
                onChange={(e) => handleNestedChange('emergencyContact', 'relation', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Allergies (comma-separated)"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="e.g. Penicillin, Peanuts"
            />
            <Input
              label="Chronic Conditions (comma-separated)"
              name="chronicConditions"
              value={formData.chronicConditions}
              onChange={handleChange}
              placeholder="e.g. Diabetes, Asthma"
            />
          </div>

          <Button type="submit" loading={saving} className="w-full sm:w-auto">Save Changes</Button>
        </form>
      </Card>
    </div>
  );
};

export default Profile;