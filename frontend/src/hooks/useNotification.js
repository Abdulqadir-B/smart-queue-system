/**
 * useNotification Hook
 * Manages browser notifications, in-app popups, and sound alerts
 *
 * Features:
 * - Request and check notification permissions
 * - Show browser notifications
 * - Play sound alerts
 * - Track notification state
 */

import { useState, useEffect, useCallback } from 'react';

const useNotification = () => {
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);

  // Check if notifications are supported
  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn("Notifications are not supported in this browser");
      return "denied";
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  }, [isSupported]);

  // Play sound alert using Web Audio API
  const playSound = useCallback(() => {
    try {
      // Check if AudioContext is available
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.warn('Web Audio API not supported');
        return;
      }

      const audioContext = new AudioContext();
      
      // Create a pleasant notification sound (three beeps)
      const playBeep = (frequency, startTime, duration) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);
        
        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + duration);
      };
      
      // Play three pleasant beeps
      playBeep(880, 0, 0.15);      // First beep (A5)
      playBeep(880, 0.2, 0.15);    // Second beep
      playBeep(1046.5, 0.4, 0.3);  // Third beep (C6) - longer and higher
      
      // Close audio context after sound finishes
      setTimeout(() => {
        audioContext.close();
      }, 1000);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback(
    (title, options = {}) => {
      if (!isSupported) {
        console.warn("Notifications are not supported");
        return null;
      }

      if (permission !== "granted") {
        console.warn("Notification permission not granted");
        return null;
      }

      try {
        const notification = new Notification(title, {
          icon: "/logo192.png",
          badge: "/logo192.png",
          vibrate: [200, 100, 200],
          requireInteraction: true, // Keeps notification visible until user interacts
          ...options,
        });

        // Auto-close after 30 seconds if user doesn't interact
        setTimeout(() => {
          notification.close();
        }, 30000);

        return notification;
      } catch (error) {
        console.error("Error showing notification:", error);
        return null;
      }
    },
    [isSupported, permission]
  );

  // Main notification function - combines sound + browser notification
  const notify = useCallback(
    ({ title, body, playAudio = true, showBrowser = true }) => {
      // Play sound alert
      if (playAudio) {
        playSound();
      }

      // Show browser notification if enabled
      if (showBrowser && permission === "granted") {
        return showBrowserNotification(title, { body });
      }

      return null;
    },
    [permission, playSound, showBrowserNotification]
  );

  // Specific notification for "your turn"
  const notifyYourTurn = useCallback(
    ({ tokenNumber, queueName }) => {
      return notify({
        title: "🎉 It's Your Turn!",
        body: `Token #${tokenNumber} - Queue: ${queueName}\nPlease proceed to the service counter.`,
        playAudio: true,
        showBrowser: true,
      });
    },
    [notify]
  );

  return {
    // State
    permission,
    isSupported,
    isGranted: permission === "granted",
    isDenied: permission === "denied",

    // Methods
    requestPermission,
    notify,
    notifyYourTurn,
    playSound,
    showBrowserNotification,
  };
};

export default useNotification;
