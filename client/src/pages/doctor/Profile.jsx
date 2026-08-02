import { useState, useEffect } from 'react';
import { Phone, Languages, FileText, Clock, Calendar, KeyRound, Camera, Pencil, IdCard } from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import { getMyProfile, updateMyProfile, uploadAvatar } from '../../api/doctorApi';
import { changePassword } from '../../api/authApi';
//import { SERVER_BASE_URL } from '../../api/axiosInstance';

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ReadOnlyField = ({ label, value }) => (
  <div className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="text-sm text-ink font-medium text-right">{value || '—'}</p>
  </div>
);

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const emptyForm = {
    phone: '',
    bio: '',
    consultationFee: '',
    isAvailable: true,
    languagesKnown: '',
    appointmentDuration: 30,
    workingDays: [],
    startTime: '09:00',
    endTime: '17:00',
  };
  const [formData, setFormData] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialForm);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getMyProfile();
      const p = res.data;
      setProfile(p);
      const workingDays = (p.availability || []).map((a) => a.day);
      const shaped = {
        phone: p.userId?.phone || '',
        bio: p.bio || '',
        consultationFee: p.consultationFee ?? '',
        isAvailable: p.isAvailable ?? true,
        languagesKnown: (p.languagesKnown || []).join(', '),
        appointmentDuration: p.appointmentDuration || 30,
        workingDays,
        startTime: p.availability?.[0]?.startTime || '09:00',
        endTime: p.availability?.[0]?.endTime || '17:00',
      };
      setFormData(shaped);
      setInitialForm(shaped);
    } catch (err) {
      setToast({ message: err.message || 'Failed to load profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const toggleWorkingDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (formData.phone && !/^\d{7,15}$/.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Enter a valid phone number';
    }
    if (!formData.consultationFee || Number(formData.consultationFee) <= 0) {
      newErrors.consultationFee = 'Fee must be greater than 0';
    }
    if (formData.bio.length > 300) {
      newErrors.bio = 'Bio cannot exceed 300 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setToast({ message: 'Only JPG, JPEG, or PNG images are allowed', type: 'error' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: 'Image must be under 2MB', type: 'error' });
      return;
    }

    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      setToast({ message: 'Avatar updated successfully', type: 'success' });
      loadProfile();
    } catch (err) {
      setToast({ message: err.message || 'Failed to upload avatar', type: 'error' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialForm);
    setErrors({});
    setEditing(false);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        phone: formData.phone,
        bio: formData.bio,
        consultationFee: Number(formData.consultationFee),
        isAvailable: formData.isAvailable,
        languagesKnown: formData.languagesKnown.split(',').map((l) => l.trim()).filter(Boolean),
        appointmentDuration: Number(formData.appointmentDuration),
        availability: formData.workingDays.map((day) => ({
          day,
          startTime: formData.startTime,
          endTime: formData.endTime,
        })),
      };
      await updateMyProfile(payload);
      setToast({ message: 'Profile updated successfully', type: 'success' });
      setEditing(false);
      loadProfile();
    } catch (err) {
      setToast({ message: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setChangingPassword(true);
    try {
      await changePassword(passwordForm);
      setToast({ message: 'Password changed successfully', type: 'success' });
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">My Profile</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowPasswordModal(true)} className="flex items-center gap-2">
            <KeyRound size={16} /> Change Password
          </Button>
          {!editing && (
            <Button onClick={() => setEditing(true)} className="flex items-center gap-2">
              <Pencil size={16} /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar + identity card */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {profile.userId?.avatar?.url ? (
                 <img
  src={profile.userId.avatar.url}
  alt="Avatar"
  className="w-full h-full object-cover"
/>
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {profile.userId?.name?.charAt(0)}
                  </span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-primary-dark">
                <Camera size={14} />
                <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            {uploadingAvatar && <p className="text-xs text-slate-400 mt-2">Uploading...</p>}

            <h2 className="text-lg font-semibold text-ink mt-4">Dr. {profile.userId?.name}</h2>
            <p className="text-sm text-slate-500">{profile.specialization}</p>
          </div>

          <div className="mt-6 text-left">
            <ReadOnlyField label="Doctor ID" value={profile._id} />
            <ReadOnlyField label="Email" value={profile.userId?.email} />
            <ReadOnlyField label="Department" value={profile.department?.name} />
            <ReadOnlyField label="Qualification" value={profile.qualification} />
            <ReadOnlyField label="Experience" value={`${profile.experience} years`} />
            <ReadOnlyField label="License Number" value={profile.licenseNumber} />
            <ReadOnlyField label="Hospital Branch" value={profile.hospitalBranch} />
            <ReadOnlyField label="Room Number" value={profile.roomNumber} />
          </div>
        </Card>

        {/* Editable details */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Contact & Professional Info">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-ink mb-1">
                  <Phone size={14} /> Phone Number
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  error={errors.phone}
                  className={!editing ? 'bg-slate-50' : ''}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink mb-1 block">Consultation Fee (₹)</label>
                <Input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  disabled={!editing}
                  error={errors.consultationFee}
                  className={!editing ? 'bg-slate-50' : ''}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1 text-sm font-medium text-ink mb-1">
                  <Languages size={14} /> Languages Known (comma-separated)
                </label>
                <Input
                  name="languagesKnown"
                  value={formData.languagesKnown}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g. English, Tamil, Hindi"
                  className={!editing ? 'bg-slate-50' : ''}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1 text-sm font-medium text-ink mb-1">
                  <FileText size={14} /> Bio
                </label>
                <Input
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!editing}
                  error={errors.bio}
                  className={!editing ? 'bg-slate-50' : ''}
                  placeholder="Brief professional bio"
                />
                <p className="text-xs text-slate-400 mt-1">{formData.bio.length}/300</p>
              </div>
            </div>
          </Card>

          <Card title="Availability">
            <div className="mb-4">
              <label className="flex items-center gap-1 text-sm font-medium text-ink mb-2">
                <Calendar size={14} /> Working Days
              </label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    disabled={!editing}
                    onClick={() => toggleWorkingDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      formData.workingDays.includes(day)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-slate-600 border-slate-300'
                    } ${!editing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-ink mb-1">
                  <Clock size={14} /> Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg text-sm ${!editing ? 'bg-slate-50' : ''}`}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink mb-1 block">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg text-sm ${!editing ? 'bg-slate-50' : ''}`}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink mb-1 block">Appointment Duration</label>
                <select
                  name="appointmentDuration"
                  value={formData.appointmentDuration}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-slate-300 rounded-lg text-sm ${!editing ? 'bg-slate-50' : ''}`}
                >
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink mt-4">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                disabled={!editing}
              />
              Available for new appointments
            </label>
          </Card>

          {editing && (
            <div className="flex gap-3">
              <Button onClick={handleSave} loading={saving} disabled={!hasChanges}>
                Save Changes
              </Button>
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        {passwordError && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {passwordError}
          </div>
        )}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            required
          />
          <Button type="submit" loading={changingPassword} className="w-full">
            Update Password
          </Button>
        </form>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
};

export default Profile;