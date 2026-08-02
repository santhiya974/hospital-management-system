import { Check, X } from 'lucide-react';
import { passwordRules, passwordStrength } from '../../utils/validators';

const barColors = { red: 'bg-red-500', orange: 'bg-amber-500', green: 'bg-emerald-500' };
const textColors = { red: 'text-red-600', orange: 'text-amber-600', green: 'text-emerald-600' };

const PasswordStrengthMeter = ({ password }) => {
  if (!password) return null;

  const rules = passwordRules(password);
  const strength = passwordStrength(password);

  const ruleList = [
    { key: 'length', label: '8+ Characters' },
    { key: 'uppercase', label: 'Uppercase Letter' },
    { key: 'lowercase', label: 'Lowercase Letter' },
    { key: 'number', label: 'Number' },
    { key: 'special', label: 'Special Character' },
  ];

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColors[strength.color]}`}
          style={{ width: `${strength.percent}%` }}
        />
      </div>
      <p className={`text-xs font-medium mt-1 ${textColors[strength.color]}`}>{strength.label} password</p>

      <div className="grid grid-cols-2 gap-1 mt-2">
        {ruleList.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1 text-xs">
            {rules[key] ? (
              <Check size={12} className="text-emerald-600" />
            ) : (
              <X size={12} className="text-slate-300" />
            )}
            <span className={rules[key] ? 'text-slate-600' : 'text-slate-400'}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;