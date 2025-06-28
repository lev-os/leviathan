/**
 * INotificationPort - Core Domain Port Interface
 * Defines the contract for notification capabilities
 */

export class INotificationPort {
  /**
   * Send a notification
   * @param {string} channel - The notification channel
   * @param {Object} message - The message to send
   * @returns {Promise<boolean>} - Success status
   */
  async send(channel, message) {
    throw new Error('Port method send not implemented');
  }

  /**
   * Send urgent alert
   * @param {Object} alert - The alert details
   * @returns {Promise<boolean>} - Success status
   */
  async sendUrgentAlert(alert) {
    throw new Error('Port method sendUrgentAlert not implemented');
  }

  /**
   * Schedule a notification
   * @param {Date} when - When to send
   * @param {string} channel - The notification channel
   * @param {Object} message - The message to send
   * @returns {Promise<string>} - Scheduled notification ID
   */
  async schedule(when, channel, message) {
    throw new Error('Port method schedule not implemented');
  }
}