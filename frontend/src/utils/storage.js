/**
 * LocalStorage utility with type safety and expiration support
 */

// Prefix for all keys to avoid conflicts
const STORAGE_PREFIX = 'myfintrack_';

/**
 * Get a namespaced key
 * @param {string} key - The key to namespace
 * @returns {string} - The namespaced key
 */
const getNamespacedKey = (key) => {
  return `${STORAGE_PREFIX}${key}`;
};

/**
 * Set an item in localStorage with optional expiration
 * @param {string} key - The key to set
 * @param {any} value - The value to store (will be stringified)
 * @param {Object} options - Options
 * @param {number} [options.expiresIn] - Time in milliseconds until the item expires
 * @returns {boolean} - Whether the operation was successful
 */
export const setItem = (key, value, { expiresIn } = {}) => {
  if (typeof window === 'undefined') return false;
  
  try {
    const item = {
      value,
      _timestamp: Date.now(),
      _expiresIn: expiresIn || null,
    };
    
    const serializedValue = JSON.stringify(item);
    localStorage.setItem(getNamespacedKey(key), serializedValue);
    return true;
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Get an item from localStorage
 * @template T
 * @param {string} key - The key to get
 * @param {T} [defaultValue=null] - Default value to return if the item doesn't exist or is expired
 * @returns {T | null} - The stored value or defaultValue
 */
export const getItem = (key, defaultValue = null) => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const serializedItem = localStorage.getItem(getNamespacedKey(key));
    if (!serializedItem) return defaultValue;
    
    const item = JSON.parse(serializedItem);
    
    // Check if the item has expired
    if (item._expiresIn && Date.now() > item._timestamp + item._expiresIn) {
      // Remove the expired item
      removeItem(key);
      return defaultValue;
    }
    
    return item.value !== undefined ? item.value : defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Remove an item from localStorage
 * @param {string} key - The key to remove
 * @returns {boolean} - Whether the operation was successful
 */
export const removeItem = (key) => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(getNamespacedKey(key));
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Clear all items from localStorage (only those with the app's prefix)
 * @returns {boolean} - Whether the operation was successful
 */
export const clear = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Only clear items with our prefix
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Get all keys from localStorage (only those with the app's prefix)
 * @returns {string[]} - Array of keys
 */
export const getKeys = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .map(key => key.replace(STORAGE_PREFIX, ''));
  } catch (error) {
    console.error('Error getting localStorage keys:', error);
    return [];
  }
};

/**
 * Check if a key exists in localStorage
 * @param {string} key - The key to check
 * @returns {boolean} - Whether the key exists
 */
export const hasItem = (key) => {
  if (typeof window === 'undefined') return false;
  return getNamespacedKey(key) in localStorage;
};

/**
 * Get the remaining time in milliseconds until an item expires
 * @param {string} key - The key to check
 * @returns {number | null} - Remaining time in milliseconds, or null if the item doesn't expire or doesn't exist
 */
export const getTimeUntilExpiry = (key) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const serializedItem = localStorage.getItem(getNamespacedKey(key));
    if (!serializedItem) return null;
    
    const item = JSON.parse(serializedItem);
    
    if (!item._expiresIn) return null;
    
    const timeElapsed = Date.now() - item._timestamp;
    const timeRemaining = item._expiresIn - timeElapsed;
    
    return Math.max(0, timeRemaining);
  } catch (error) {
    console.error(`Error getting expiry for key "${key}":`, error);
    return null;
  }
};

/**
 * Subscribe to changes in localStorage
 * @param {string} key - The key to watch for changes
 * @param {Function} callback - Function to call when the key changes
 * @returns {Function} - Unsubscribe function
 */
export const subscribe = (key, callback) => {
  if (typeof window === 'undefined') return () => {};
  
  const namespacedKey = getNamespacedKey(key);
  
  const handleStorage = (event) => {
    if (event.key === namespacedKey || event.key === null) {
      // If event.key is null, it means storage was cleared
      const value = getItem(key);
      callback(value, event);
    }
  };
  
  // Listen for storage events (changes from other tabs/windows)
  window.addEventListener('storage', handleStorage);
  
  // Return unsubscribe function
  return () => {
    window.removeEventListener('storage', handleStorage);
  };
};

// Export all functions as default
const storage = {
  setItem,
  getItem,
  removeItem,
  clear,
  getKeys,
  hasItem,
  getTimeUntilExpiry,
  subscribe,
};

export default storage;
