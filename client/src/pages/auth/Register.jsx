import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Stethoscope } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Toast from '../../components/common/Toast';
import PasswordStrengthMeter from '../../components/common/PasswordStrengthMeter';
import {
  isValidEmail,
  isValidPhone,
  isValidName,
  isAdult,
  isPasswordStrong,
  mapAuthError,
} from '../../utils/validators';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '', form: '' });
  };

  const validate = () => {
    const newErrors = {};

    if (!isValidName(formData.name)) {
      newErrors.name = 'Name must be at least 3 characters and contain no numbers.';
    }
    if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email address.';
    }
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Enter a valid 10-digit phone number.';
    }
    if (!isAdult(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'You must be at least 18 years old, and the date cannot be in the future.';
    }
    if (!isPasswordStrong(formData.password)) {
      newErrors.password = 'Password does not meet all strength requirements.';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      await register(payload);
      setToast({ message: 'Registration successful. Please login.', type: 'success' });
      setTimeout(() => navigate('/patient/dashboard'), 800);
    } catch (err) {
      setErrors({ form: mapAuthError(err.message) });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-primary/5 via-surface to-teal-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-3">
            <Stethoscope className="text-white" size={26} />
          </div>
          <h1 className="text-xl font-bold text-ink">HMS Care</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-ink mb-1">Create your account</h2>
          <p className="text-sm text-slate-500 mb-6">Register as a patient to book appointments</p>

          {errors.form && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="10-digit number"
            />
            <Input
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              error={errors.dateOfBirth}
              max={today}
            />

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="new-password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <PasswordStrengthMeter password={formData.password} />
            </div>

            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              autoComplete="new-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <Button type="submit" loading={loading} className="w-full shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-shadow">
              Register
            </Button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
};

export default Register;