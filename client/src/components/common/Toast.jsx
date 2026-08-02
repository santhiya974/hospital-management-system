import { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
        isSuccess ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {isSuccess ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
      {message}
    </div>
  );
};

export default Toast;