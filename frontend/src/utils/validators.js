// Email validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase()) || 'Please enter a valid email address';
};

// Required field validation
export const required = (value) => {
  return (value && value.trim() !== '') || 'This field is required';
};

// Minimum length validation
export const minLength = (min) => (value) => {
  return (
    (value && value.length >= min) ||
    `This field must be at least ${min} characters`
  );
};

// Password strength validation
export const validatePassword = (value) => {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
  if (!/[^A-Za-z0-9]/.test(value)) return 'Password must contain at least one special character';
  return true;
};

// Confirm password validation
export const confirmPassword = (password) => (value) => {
  return value === password || 'Passwords do not match';
};

// Amount validation (positive number with 2 decimal places)
export const validateAmount = (value) => {
  const re = /^\d+(\.\d{1,2})?$/;
  return (
    (value && re.test(value) && parseFloat(value) > 0) ||
    'Please enter a valid positive amount'
  );
};

// Date validation (YYYY-MM-DD format)
export const validateDate = (value) => {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(value)) return 'Please enter a valid date (YYYY-MM-DD)';
  
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date > today) return 'Date cannot be in the future';
  return true;
};

// URL validation
export const validateUrl = (value) => {
  if (!value) return true; // Optional field
  const re = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/;
  return re.test(value) || 'Please enter a valid URL';
};

// Phone number validation (basic international format)
export const validatePhone = (value) => {
  if (!value) return true; // Optional field
  const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
  return re.test(value) || 'Please enter a valid phone number';
};

// Currency code validation (ISO 4217 format)
export const validateCurrency = (value) => {
  const re = /^[A-Z]{3}$/;
  return re.test(value) || 'Please enter a valid 3-letter currency code (e.g., USD, EUR)';
};

// IBAN validation (basic format check)
export const validateIban = (value) => {
  if (!value) return true; // Optional field
  const re = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/;
  return re.test(value) || 'Please enter a valid IBAN';
};
