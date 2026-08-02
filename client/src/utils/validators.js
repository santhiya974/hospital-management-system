export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone) || /^\d{10}$/.test(phone);

export const isValidName = (name) => name.trim().length >= 3 && !/\d/.test(name);

export const isAdult = (dob) => {
  if (!dob) return false;
  const birthDate = new Date(dob);
  const today = new Date();
  if (birthDate > today) return false; // future date
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age >= 18;
};

export const passwordRules = (password) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /\d/.test(password),
  special: /[^A-Za-z0-9]/.test(password),
});

export const passwordStrength = (password) => {
  const rules = passwordRules(password);
  const passed = Object.values(rules).filter(Boolean).length;
  if (passed <= 2) return { label: 'Weak', color: 'red', percent: 33 };
  if (passed <= 4) return { label: 'Medium', color: 'orange', percent: 66 };
  return { label: 'Strong', color: 'green', percent: 100 };
};

export const isPasswordStrong = (password) => {
  const rules = passwordRules(password);
  return Object.values(rules).every(Boolean);
};

// Maps raw backend error messages to friendly, consistent copy
export const mapAuthError = (message = '') => {
  const lower = message.toLowerCase();
  if (lower.includes('invalid email or password')) {
    return 'Incorrect email or password.';
  }
  if (lower.includes('already exists')) {
    return 'An account with this email already exists.';
  }
  if (lower.includes('deactivated')) {
    return 'Your account has been deactivated. Contact admin.';
  }
  if (lower.includes('too many requests')) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }
  return message || 'Something went wrong. Please try again.';
};