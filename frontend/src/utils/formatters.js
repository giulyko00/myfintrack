import { useI18n } from 'vue-i18n';

// Format date to localized string
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Handle both Date objects and ISO date strings
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Return empty string for invalid dates
  if (isNaN(dateObj.getTime())) return '';
  
  return new Intl.DateTimeFormat(useI18n().locale.value, mergedOptions).format(dateObj);
};

// Format currency amount
export const formatCurrency = (amount, currency = 'USD', options = {}) => {
  if (amount === null || amount === undefined) return '';
  
  const defaultOptions = {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Convert string to number if needed
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Return empty string for invalid numbers
  if (isNaN(numAmount)) return '';
  
  return new Intl.NumberFormat(useI18n().locale.value, mergedOptions).format(numAmount);
};

// Format number with custom options
export const formatNumber = (number, options = {}) => {
  if (number === null || number === undefined) return '';
  
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Convert string to number if needed
  const num = typeof number === 'string' ? parseFloat(number) : number;
  
  // Return empty string for invalid numbers
  if (isNaN(num)) return '';
  
  return new Intl.NumberFormat(useI18n().locale.value, mergedOptions).format(num);
};

// Format percentage
export const formatPercentage = (value, decimalPlaces = 2) => {
  if (value === null || value === undefined) return '';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '';
  
  const formatter = new Intl.NumberFormat(useI18n().locale.value, {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
  
  return formatter.format(num / 100);
};

// Format file size
const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export const formatFileSize = (bytes, options = {}) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = options.decimalPlaces !== undefined ? options.decimalPlaces : 2;
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${UNITS[i]}`;
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100, ellipsis = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}${ellipsis}`;
};

// Format credit card number (e.g., 4242 4242 4242 4242)
export const formatCreditCard = (number) => {
  if (!number) return '';
  
  const digits = number.replace(/\D/g, '');
  const parts = [];
  
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.substring(i, i + 4));
  }
  
  return parts.join(' ');
};

// Format phone number (basic international format)
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = `${phoneNumber}`.replace(/\D/g, '');
  
  // Check if the number starts with a country code
  const match = cleaned.match(/^(\d{1,3})?(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    const intlCode = match[1] ? `+${match[1]} ` : '';
    return `${intlCode}(${match[2]}) ${match[3]}-${match[4]}`;
  }
  
  return phoneNumber;
};
