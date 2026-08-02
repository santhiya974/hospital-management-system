import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Stethoscope } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Toast from '../../components/common/Toast';
import { isValidEmail, mapAuthError } from '../../utils/validators';

const roleHomeMap = {
  admin: '/admin/dashboard',
  doctor: '/doctor/dashboard',
  patient: '/patient/dashboard',
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim() || !formData.password.trim()) {
      newErrors.form = 'Please fill all required fields.';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email address.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login(formData);
      setToast({ message: 'Login successful.', type: 'success' });
      setTimeout(() => navigate(roleHomeMap[user.role] || '/'), 600);
    } catch (err) {
      setErrors({ form: mapAuthError(err.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setToast({ message: 'Password reset is coming soon.', type: 'error' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 via-surface to-teal-50">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-3">
            <Stethoscope className="text-white" size={26} />
          </div>
          <h1 className="text-xl font-bold text-ink">HMS Care</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-ink mb-1">Welcome back</h2>
          <p className="text-sm text-slate-500 mb-6">Log in to your HMS account</p>

          {errors.form && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Remember me
              </label>
              <button onClick={handleForgotPassword} className="text-primary font-medium hover:underline">
                Forgot password?
              </button>
            </div>

            <Button type="submit" loading={loading} className="w-full shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-shadow">
              Log In
            </Button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            New patient?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
};

export default Login;