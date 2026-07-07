import { backendApi } from './api';

// 🛡️ NEXUS PRO ERROR COMMAND CENTER
// Centralized logging and error harvesting.

class NexusLogger {
  private isProduction = import.meta.env.PROD;

  /**
   * Captures and transmits frontend crashes to the backend.
   */
  async reportError(error: Error, info?: any, user?: any) {
    const errorData = {
      error: {
        message: error.message,
        stack: error.stack,
      },
      info,
      user: user ? { id: user.id, email: user.email } : null,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Always log to console in dev
    if (!this.isProduction) {
      console.group('🔥 Nexus Error Captured');
      console.error(error);
      if (info) console.info('Context:', info);
      console.groupEnd();
    }

    // Transmit to backend for remote analysis
    try {
      await backendApi.post('/logs/client', errorData);
    } catch (err) {
      // Fail silently to avoid infinite error loops
      if (!this.isProduction) console.warn('📡 Nexus Failed to transmit error log:', err);
    }
  }

  log(message: string, data?: any) {
    if (!this.isProduction) {
      console.log(`[Nexus] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any) {
    console.warn(`[Nexus] ${message}`, data || '');
  }
}

export const logger = new NexusLogger();
