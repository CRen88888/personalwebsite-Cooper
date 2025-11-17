// Theme Management and Analytics Tracking System
// Educational purposes - tracks user behavior and preferences

(function() {
  'use strict';

  // ==================== COOKIE MANAGEMENT ====================
  function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  }

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  // ==================== ANALYTICS DATA STORAGE ====================
  const AnalyticsData = {
    sessionId: generateSessionId(),
    userId: getOrCreateUserId(),
    startTime: Date.now(),
    pageViews: [],
    interactions: [],
    themeChanges: [],
    deviceInfo: getDeviceInfo(),
    browserInfo: getBrowserInfo(),
    screenInfo: getScreenInfo(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language || navigator.userLanguage,
    referrer: document.referrer || 'direct',
    currentPage: window.location.pathname,
    userAgent: navigator.userAgent
  };

  function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  function getOrCreateUserId() {
    let userId = getCookie('analytics_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCookie('analytics_user_id', userId);
    }
    return userId;
  }

  function getDeviceInfo() {
    return {
      platform: navigator.platform,
      vendor: navigator.vendor,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      deviceMemory: navigator.deviceMemory || 'unknown',
      maxTouchPoints: navigator.maxTouchPoints || 0
    };
  }

  function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'unknown';
    let version = 'unknown';

    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
      browser = 'Chrome';
      version = ua.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
    } else if (ua.indexOf('Firefox') > -1) {
      browser = 'Firefox';
      version = ua.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
    } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
      browser = 'Safari';
      version = ua.match(/Version\/(\d+)/)?.[1] || 'unknown';
    } else if (ua.indexOf('Edg') > -1) {
      browser = 'Edge';
      version = ua.match(/Edg\/(\d+)/)?.[1] || 'unknown';
    }

    return { browser, version, userAgent: ua };
  }

  function getScreenInfo() {
    return {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1
    };
  }

  // ==================== ANALYTICS TRACKING FUNCTIONS ====================
  function trackPageView() {
    const pageView = {
      timestamp: Date.now(),
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer || 'direct',
      timeOnPage: 0
    };
    AnalyticsData.pageViews.push(pageView);
    saveAnalyticsToCookie();
  }

  function trackInteraction(type, element, details = {}) {
    const interaction = {
      timestamp: Date.now(),
      type, // 'click', 'scroll', 'hover', 'form_submit', etc.
      element: element?.tagName || 'unknown',
      elementId: element?.id || 'none',
      elementClass: element?.className || 'none',
      details,
      page: window.location.pathname
    };
    AnalyticsData.interactions.push(interaction);
    saveAnalyticsToCookie();
  }

  function trackThemeChange(fromTheme, toTheme) {
    const themeChange = {
      timestamp: Date.now(),
      from: fromTheme,
      to: toTheme,
      page: window.location.pathname
    };
    AnalyticsData.themeChanges.push(themeChange);
    saveAnalyticsToCookie();
  }

  function trackTimeOnPage() {
    const currentPageView = AnalyticsData.pageViews[AnalyticsData.pageViews.length - 1];
    if (currentPageView) {
      currentPageView.timeOnPage = Date.now() - AnalyticsData.startTime;
      saveAnalyticsToCookie();
    }
  }

  // ==================== ANALYTICS STORAGE ====================
  function saveAnalyticsToCookie() {
    try {
      // Store analytics data in cookie (limited to 4KB, so we'll keep it concise)
      const dataToStore = {
        userId: AnalyticsData.userId,
        sessionId: AnalyticsData.sessionId,
        pageViewCount: AnalyticsData.pageViews.length,
        interactionCount: AnalyticsData.interactions.length,
        themeChangeCount: AnalyticsData.themeChanges.length,
        lastUpdate: Date.now(),
        deviceInfo: AnalyticsData.deviceInfo,
        browserInfo: AnalyticsData.browserInfo,
        screenInfo: AnalyticsData.screenInfo,
        timezone: AnalyticsData.timezone,
        language: AnalyticsData.language
      };
      
      // Store recent interactions (last 20)
      const recentInteractions = AnalyticsData.interactions.slice(-20);
      const recentThemeChanges = AnalyticsData.themeChanges.slice(-10);
      
      setCookie('analytics_data', JSON.stringify(dataToStore));
      setCookie('analytics_interactions', JSON.stringify(recentInteractions));
      setCookie('analytics_theme_changes', JSON.stringify(recentThemeChanges));
    } catch (e) {
      console.log('Analytics save error:', e);
    }
  }

  function getAnalyticsData() {
    try {
      const data = getCookie('analytics_data');
      const interactions = getCookie('analytics_interactions');
      const themeChanges = getCookie('analytics_theme_changes');
      
      return {
        data: data ? JSON.parse(data) : null,
        interactions: interactions ? JSON.parse(interactions) : [],
        themeChanges: themeChanges ? JSON.parse(themeChanges) : []
      };
    } catch (e) {
      return { data: null, interactions: [], themeChanges: [] };
    }
  }

  // ==================== THEME MANAGEMENT ====================
  const ThemeManager = {
    currentTheme: 'dark', // default
    
    init() {
      // Load theme preference from cookie
      const savedTheme = getCookie('theme_preference');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        this.setTheme(savedTheme, false);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDark ? 'dark' : 'light', false);
      }
      
      // Create theme toggle button
      this.createThemeToggle();
      
      // Track initial theme
      trackThemeChange('system', this.currentTheme);
    },
    
    setTheme(theme, track = true) {
      if (theme !== 'dark' && theme !== 'light') return;
      
      const previousTheme = this.currentTheme;
      this.currentTheme = theme;
      
      document.documentElement.setAttribute('data-theme', theme);
      document.body.classList.remove('theme-dark', 'theme-light');
      document.body.classList.add(`theme-${theme}`);
      
      // Update CSS variables for light mode
      if (theme === 'light') {
        document.documentElement.style.setProperty('--bg-primary', '#ffffff');
        document.documentElement.style.setProperty('--bg-secondary', '#f5f5f5');
        document.documentElement.style.setProperty('--text-primary', '#000000');
        document.documentElement.style.setProperty('--text-secondary', '#333333');
      } else {
        document.documentElement.style.setProperty('--bg-primary', '#000000');
        document.documentElement.style.setProperty('--bg-secondary', '#1a1a1a');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#e0e0e0');
      }
      
      // Save to cookie
      setCookie('theme_preference', theme);
      
      // Track theme change
      if (track && previousTheme !== theme) {
        trackThemeChange(previousTheme, theme);
      }
      
      // Update toggle button
      this.updateThemeToggle();
    },
    
    toggleTheme() {
      const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme, true);
      trackInteraction('click', null, { action: 'theme_toggle', theme: newTheme });
    },
    
    createThemeToggle() {
      // Check if toggle already exists
      if (document.getElementById('theme-toggle')) return;
      
      const toggle = document.createElement('button');
      toggle.id = 'theme-toggle';
      toggle.className = 'theme-toggle-btn';
      toggle.setAttribute('aria-label', 'Toggle theme');
      toggle.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
      
      toggle.addEventListener('click', () => {
        this.toggleTheme();
      });
      
      // Add to navigation or body
      const nav = document.querySelector('nav .nav-container');
      if (nav) {
        nav.appendChild(toggle);
      } else {
        document.body.insertBefore(toggle, document.body.firstChild);
      }
      
      this.updateThemeToggle();
    },
    
    updateThemeToggle() {
      const toggle = document.getElementById('theme-toggle');
      if (toggle) {
        toggle.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
        toggle.setAttribute('aria-label', `Switch to ${this.currentTheme === 'dark' ? 'light' : 'dark'} mode`);
      }
    }
  };

  // ==================== EVENT LISTENERS FOR ANALYTICS ====================
  function setupAnalyticsListeners() {
    // Track clicks
    document.addEventListener('click', (e) => {
      trackInteraction('click', e.target, {
        text: e.target.textContent?.substring(0, 50),
        href: e.target.href || 'none'
      });
    }, true);

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (scrollPercent % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          trackInteraction('scroll', null, { depth: scrollPercent });
        }
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      trackInteraction('form_submit', e.target, {
        formId: e.target.id || 'none',
        formAction: e.target.action || 'none'
      });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      trackInteraction('visibility_change', null, {
        hidden: document.hidden,
        visibilityState: document.visibilityState
      });
    });

    // Track before page unload
    window.addEventListener('beforeunload', () => {
      trackTimeOnPage();
      saveAnalyticsToCookie();
    });

    // Track page focus/blur
    window.addEventListener('focus', () => {
      trackInteraction('window_focus', null);
    });

    window.addEventListener('blur', () => {
      trackInteraction('window_blur', null);
    });

    // Track resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        trackInteraction('resize', null, {
          width: window.innerWidth,
          height: window.innerHeight
        });
        AnalyticsData.screenInfo = getScreenInfo();
      }, 250);
    });
  }

  // ==================== INITIALIZATION ====================
  function init() {
    // Initialize theme
    ThemeManager.init();
    
    // Track initial page view
    trackPageView();
    
    // Setup analytics listeners
    setupAnalyticsListeners();
    
    // Save analytics periodically
    setInterval(() => {
      trackTimeOnPage();
      saveAnalyticsToCookie();
    }, 30000); // Every 30 seconds
  }

  // ==================== EXPOSE TO GLOBAL SCOPE ====================
  window.ThemeManager = ThemeManager;
  window.AnalyticsTracker = {
    trackInteraction,
    trackPageView,
    getAnalyticsData,
    getDeviceInfo,
    getBrowserInfo,
    getScreenInfo,
    AnalyticsData
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

