import { useToast } from 'vue-toastification';

/**
 * Handle API errors consistently across the application
 * @param {Error} error - The error object from the API call
 * @param {string} defaultMessage - Default error message if none is provided
 * @param {Object} options - Additional options
 * @param {boolean} options.showToast - Whether to show a toast notification (default: true)
 * @param {boolean} options.rethrow - Whether to rethrow the error after handling (default: false)
 * @returns {Object} - The error response data if available
 */
export const handleApiError = (error, defaultMessage = 'An error occurred', options = {}) => {
  const { showToast = true, rethrow = false } = options;
  const toast = useToast();
  
  // Extract error message from different possible locations
  let errorMessage = defaultMessage;
  let errorData = null;
  let statusCode = null;
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    statusCode = error.response.status;
    errorData = error.response.data;
    
    if (errorData?.detail) {
      errorMessage = errorData.detail;
    } else if (errorData?.errors) {
      // Handle validation errors
      const errorMessages = [];
      
      // Handle different error formats
      if (Array.isArray(errorData.errors)) {
        errorMessages.push(...errorData.errors);
      } else if (typeof errorData.errors === 'object') {
        // Handle object with field errors
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            errorMessages.push(...messages.map(msg => `${field}: ${msg}`));
          } else {
            errorMessages.push(`${field}: ${messages}`);
          }
        });
      } else {
        errorMessages.push(String(errorData.errors));
      }
      
      errorMessage = errorMessages.join('\n');
    } else if (errorData?.message) {
      errorMessage = errorData.message;
    } else if (typeof errorData === 'string') {
      errorMessage = errorData;
    } else if (statusCode === 401) {
      errorMessage = 'Session expired. Please log in again.';
    } else if (statusCode === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (statusCode === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (statusCode >= 500) {
      errorMessage = 'A server error occurred. Please try again later.';
    }
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response from server. Please check your internet connection.';
  } else if (error.message) {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message;
  }
  
  // Show toast notification if enabled
  if (showToast) {
    toast.error(errorMessage, {
      timeout: 5000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      draggable: true,
      draggablePercent: 0.6,
      showCloseButtonOnHover: false,
      hideProgressBar: false,
      closeButton: 'button',
      icon: true,
      rtl: false,
    });
  }
  
  // Log the full error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', {
      message: errorMessage,
      status: statusCode,
      data: errorData,
      originalError: error,
    });
  }
  
  // Rethrow the error if needed
  if (rethrow) {
    throw error;
  }
  
  return { error: errorMessage, data: errorData, status: statusCode };
};

/**
 * Handle success messages consistently
 * @param {string} message - The success message to display
 * @param {Object} options - Additional options
 * @param {string} options.position - Toast position (default: 'top-right')
 * @param {number} options.timeout - Time in ms before toast disappears (default: 3000)
 */
export const showSuccess = (message, options = {}) => {
  const toast = useToast();
  
  toast.success(message, {
    position: options.position || 'top-right',
    timeout: options.timeout || 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false,
    ...options,
  });
};

/**
 * Handle warning messages consistently
 * @param {string} message - The warning message to display
 * @param {Object} options - Additional options
 */
export const showWarning = (message, options = {}) => {
  const toast = useToast();
  
  toast.warning(message, {
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false,
    ...options,
  });
};

/**
 * Handle info messages consistently
 * @param {string} message - The info message to display
 * @param {Object} options - Additional options
 */
export const showInfo = (message, options = {}) => {
  const toast = useToast();
  
  toast.info(message, {
    timeout: 4000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false,
    ...options,
  });
};

/**
 * Create a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - The debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Create a throttled function that only invokes func at most once per every wait milliseconds
 * @param {Function} func - The function to throttle
 * @param {number} limit - The number of milliseconds to throttle invocations to
 * @returns {Function} - The throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};
