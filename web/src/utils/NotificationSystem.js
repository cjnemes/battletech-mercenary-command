/**
 * Professional Notification System
 * Replaces alert() calls with proper UI notifications
 */

export class NotificationSystem {
  constructor() {
    this.container = null;
    this.notifications = [];
    this.init();
  }

  /**
   * Initialize the notification system
   */
  init() {
    // Create notification container if it doesn't exist
    this.container = document.getElementById('notification-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.className = 'notification-container';
      document.body.appendChild(this.container);
    }

    // Add styles if not already present
    this.injectStyles();
  }

  /**
   * Inject notification styles
   */
  injectStyles() {
    if (document.getElementById('notification-styles')) return;

    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        pointer-events: none;
      }

      .notification {
        background: var(--card-bg, #1e2640);
        border: 2px solid var(--border-color, #333);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        color: var(--primary-text, #ffffff);
        font-family: 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.4;
        pointer-events: auto;
        transform: translateX(100%);
        transition: all 0.3s ease-in-out;
        opacity: 0;
        max-width: 380px;
        word-wrap: break-word;
      }

      .notification.show {
        transform: translateX(0);
        opacity: 1;
      }

      .notification.success {
        border-color: var(--success-color, #28a745);
        background: linear-gradient(135deg, var(--card-bg, #1e2640), rgba(40, 167, 69, 0.1));
      }

      .notification.warning {
        border-color: var(--warning-color, #ffc107);
        background: linear-gradient(135deg, var(--card-bg, #1e2640), rgba(255, 193, 7, 0.1));
      }

      .notification.error {
        border-color: var(--danger-color, #dc3545);
        background: linear-gradient(135deg, var(--card-bg, #1e2640), rgba(220, 53, 69, 0.1));
      }

      .notification.info {
        border-color: var(--accent-text, #5aa3ff);
        background: linear-gradient(135deg, var(--card-bg, #1e2640), rgba(90, 163, 255, 0.1));
      }

      .notification-title {
        font-weight: bold;
        margin-bottom: 8px;
        font-size: 15px;
      }

      .notification-message {
        margin-bottom: 12px;
      }

      .notification-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .notification-btn {
        background: var(--accent-bg, #1a2744);
        border: 1px solid var(--border-color, #333);
        color: var(--primary-text, #ffffff);
        padding: 6px 12px;
        border-radius: 4px;
        font-family: inherit;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .notification-btn:hover {
        background: var(--accent-text, #5aa3ff);
        border-color: var(--accent-text, #5aa3ff);
      }

      .notification-btn.primary {
        background: var(--accent-text, #5aa3ff);
        border-color: var(--accent-text, #5aa3ff);
      }

      .notification-close {
        position: absolute;
        top: 8px;
        right: 12px;
        background: none;
        border: none;
        color: var(--secondary-text, #b8c5d6);
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .notification-close:hover {
        color: var(--primary-text, #ffffff);
      }

      @media (max-width: 480px) {
        .notification-container {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }

        .notification {
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Show a notification
   */
  show(message, options = {}) {
    const notification = this.createNotification(message, options);
    this.container.appendChild(notification);
    this.notifications.push(notification);

    // Trigger animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 50);

    // Auto-dismiss if specified
    if (options.autoDismiss !== false) {
      const delay = options.duration || 5000;
      setTimeout(() => {
        this.dismiss(notification);
      }, delay);
    }

    return notification;
  }

  /**
   * Create notification element
   */
  createNotification(message, options = {}) {
    const notification = document.createElement('div');
    notification.className = `notification ${options.type || 'info'}`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => this.dismiss(notification);

    let content = '';
    
    if (options.title) {
      content += `<div class="notification-title">${this.escapeHtml(options.title)}</div>`;
    }
    
    content += `<div class="notification-message">${this.escapeHtml(message)}</div>`;
    
    if (options.actions && options.actions.length > 0) {
      content += '<div class="notification-actions">';
      options.actions.forEach(action => {
        content += `<button class="notification-btn ${action.primary ? 'primary' : ''}" onclick="${action.onClick}">${this.escapeHtml(action.text)}</button>`;
      });
      content += '</div>';
    }

    notification.innerHTML = content;
    notification.appendChild(closeBtn);

    return notification;
  }

  /**
   * Dismiss a notification
   */
  dismiss(notification) {
    if (!notification || !notification.parentNode) return;

    notification.classList.remove('show');
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
          this.notifications.splice(index, 1);
        }
      }
    }, 300);
  }

  /**
   * Clear all notifications
   */
  clear() {
    this.notifications.forEach(notification => {
      this.dismiss(notification);
    });
  }

  /**
   * Convenience methods for different notification types
   */
  success(message, options = {}) {
    return this.show(message, { ...options, type: 'success' });
  }

  warning(message, options = {}) {
    return this.show(message, { ...options, type: 'warning' });
  }

  error(message, options = {}) {
    return this.show(message, { ...options, type: 'error', duration: 8000 });
  }

  info(message, options = {}) {
    return this.show(message, { ...options, type: 'info' });
  }

  /**
   * Replace alert() function
   */
  alert(message, title = 'System Message') {
    return this.info(message, { 
      title, 
      duration: 6000,
      autoDismiss: false,
      actions: [{
        text: 'OK',
        primary: true,
        onClick: 'this.parentNode.parentNode.parentNode.querySelector(\".notification-close\").click()'
      }]
    });
  }

  /**
   * Replace confirm() function
   */
  confirm(message, title = 'Confirm Action') {
    return new Promise((resolve) => {
      const notification = this.show(message, {
        title,
        type: 'warning',
        autoDismiss: false,
        actions: [
          {
            text: 'Cancel',
            onClick: `NotificationSystem.instance.resolveConfirm(false, '${notification?.id || 'temp'}')`
          },
          {
            text: 'Confirm',
            primary: true,
            onClick: `NotificationSystem.instance.resolveConfirm(true, '${notification?.id || 'temp'}')`
          }
        ]
      });

      // Store resolver for this notification
      notification.confirmResolver = resolve;
      notification.id = Date.now().toString();
    });
  }

  /**
   * Resolve confirm dialog
   */
  resolveConfirm(result, notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && notification.confirmResolver) {
      notification.confirmResolver(result);
      this.dismiss(notification);
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.NotificationSystem = window.NotificationSystem || {};
  window.NotificationSystem.instance = new NotificationSystem();
  
  // Replace global alert function
  window.originalAlert = window.alert;
  window.alert = (message) => window.NotificationSystem.instance.alert(message);
}