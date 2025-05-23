import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'light', // 'light', 'dark', or 'system'
  }),
  
  getters: {
    isDark: (state) => {
      if (state.theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return state.theme === 'dark';
    },
  },
  
  actions: {
    initTheme() {
      // Check for saved theme preference or fallback to system preference
      if (process.client) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          this.theme = savedTheme;
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.theme = 'system';
        }
        this.applyTheme();
      }
    },
    
    setTheme(theme) {
      this.theme = theme;
      if (process.client) {
        localStorage.setItem('theme', theme);
        this.applyTheme();
      }
    },
    
    toggleTheme() {
      if (this.theme === 'dark') {
        this.setTheme('light');
      } else if (this.theme === 'light') {
        this.setTheme('system');
      } else {
        this.setTheme('dark');
      }
    },
    
    applyTheme() {
      if (process.client) {
        const root = document.documentElement;
        
        // Remove all theme classes first
        root.classList.remove('light', 'dark');
        
        // Apply the appropriate theme class
        if (this.theme === 'system') {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            root.classList.add('dark');
          } else {
            root.classList.add('light');
          }
        } else {
          root.classList.add(this.theme);
        }
      }
    },
  },
});
