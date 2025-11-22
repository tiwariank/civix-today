import notifee, { TimestampTrigger, TriggerType, AndroidImportance } from '@notifee/react-native';

// Define a type for the unique ID, ensuring compatibility with Notifee (string)
type NotificationId = string;

// --- IMPORTANT: CHANNEL SETUP ---
// Notifee requires channels to be created before use (Android 8.0+).
// You should call a setup function (like the one in NotifeeSetup.jsx) 
// on app startup, ensuring 'goaleasy-channel' exists.
const CHANNEL_ID = 'goaleasy-channel';
const DEFAULT_SOUND_NAME = 'default'; // Uses the default system sound

/**
 * Interface defining the required options for scheduling a notification.
 * Note: Notifee uses 'body' instead of 'message' and 'data' instead of 'userInfo'.
 */
interface ScheduledNotificationOptions {
  /** The title of the notification. */
  title: string;
  /** The main message body of the notification. */
  message: string;
  /** The specific Date/time when the notification should fire. */
  date: Date;
  /** Optional, unique ID for the notification. If not provided, one will be generated. */
  id?: NotificationId;
  /** Optional data payload to be attached (used for deep linking/handling taps). */
  data?: Record<string, any>;
}

/**
 * Schedules a local reminder notification to fire at a specific date/time using Notifee.
 *
 * @param options - The title, message, and target date for the notification.
 * @returns The unique ID assigned to the scheduled notification.
 */
export const scheduleGoalReminder = (options: ScheduledNotificationOptions): NotificationId => {
  // Generate a unique ID based on timestamp if one is not provided. 
  const notificationId = options.id || Date.now().toString();

  // 1. Define the Trigger (when the notification should fire)
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    // Notifee uses milliseconds since epoch for the timestamp
    timestamp: options.date.getTime(), 
    // Allow the notification to fire when the device is idle (like the RNPNN 'allowWhileIdle')
    // alarmManager: true,
  };

  // 2. Define the Notification Content
  try {
    notifee.createTriggerNotification({
      id: notificationId,
      title: options.title,
      body: options.message, // RNPNN 'message' is Notifee 'body'
      data: options.data,    // RNPNN 'userInfo' is Notifee 'data'
      
      android: {
        channelId: CHANNEL_ID,
        // Sound and importance should ideally be set when creating the channel, 
        // but we ensure the sound name here for clarity.
        sound: DEFAULT_SOUND_NAME,
        importance: AndroidImportance.HIGH, 
        pressAction: {
          id: 'default', // Required to open the app when the user taps the notification
        },
      },
      ios: {
        sound: DEFAULT_SOUND_NAME, // Sound configuration for iOS
      },
    }, trigger);

    console.log(`Goal Reminder scheduled successfully with ID: ${notificationId} via Notifee`);
    return notificationId;

  } catch (error) {
    console.error("Failed to schedule goal reminder using Notifee:", error);
    return notificationId; 
  }
};