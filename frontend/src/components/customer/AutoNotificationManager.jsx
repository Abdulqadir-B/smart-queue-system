/**
 * Auto Notification Manager Component
 * 
 * This component runs in the background and automatically:
 * 1. Detects if user has an active token from localStorage
 * 2. Subscribes to socket notifications automatically
 * 3. Shows popup when token is called
 * 4. Requests notification permission
 * 5. Handles reconnection after page refresh
 * 
 * This eliminates the need for manual "tracking" - notifications work automatically!
 */

import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import useNotification from '../../hooks/useNotification';
import NotificationPopup from '../common/NotificationPopup';

const AutoNotificationManager = () => {
  const { socket, isConnected, subscribeAsCustomer } = useSocket();
  const { playSound, notifyYourTurn, requestPermission, isGranted } = useNotification();
  const [showPopup, setShowPopup] = useState(false);
  const [calledTokenInfo, setCalledTokenInfo] = useState(null);
  const [activeToken, setActiveToken] = useState(null);

  // Check for active token on mount and setup auto-subscription
  useEffect(() => {
    const checkForActiveToken = () => {
      try {
        const storedToken = localStorage.getItem('qms_active_token');
        
        if (storedToken) {
          const tokenInfo = JSON.parse(storedToken);
          
          // Check if token is still valid (within last 24 hours)
          const tokenAge = Date.now() - tokenInfo.timestamp;
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (tokenAge < maxAge) {
            setActiveToken(tokenInfo);
            
            // Request notification permission if not granted
            if (!isGranted) {
              requestPermission();
            }
          } else {
            // Token too old, remove it
            localStorage.removeItem('qms_active_token');
            setActiveToken(null);
          }
        } else {
          setActiveToken(null);
        }
      } catch (error) {
        console.error('Error checking for active token:', error);
      }
    };

    // Check immediately on mount
    checkForActiveToken();

    // Listen for custom event when user joins a queue (immediate notification)
    const handleTokenJoined = () => {
      checkForActiveToken();
    };
    
    window.addEventListener('qms_token_joined', handleTokenJoined);

    // Set up interval to check periodically (every 5 seconds as backup)
    const intervalId = setInterval(checkForActiveToken, 5000);

    // Also listen for storage events from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'qms_active_token') {
        checkForActiveToken();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('qms_token_joined', handleTokenJoined);
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isGranted, requestPermission]);

  // Auto-subscribe when socket connects and we have an active token
  useEffect(() => {
    if (socket && isConnected && activeToken) {
      subscribeAsCustomer(activeToken.queueName, activeToken.tokenNumber);
    }
  }, [socket, isConnected, activeToken, subscribeAsCustomer]);

  // Listen for socket events
  useEffect(() => {
    if (!socket || !isConnected || !activeToken) {
      return;
    }

    const currentQueueName = activeToken.queueName;
    const currentTokenNumber = parseInt(activeToken.tokenNumber, 10);

    // Listen for your specific token being called
    const handleYourTurn = (data) => {
      if (
        data.queueName === currentQueueName &&
        data.tokenNumber === currentTokenNumber
      ) {
        // Store the called token info
        setCalledTokenInfo({
          tokenNumber: data.tokenNumber,
          queueName: data.queueName,
        });
        
        // Show notification popup
        setShowPopup(true);
        
        // Play sound alert
        playSound();
        
        // Show browser notification (if permission granted)
        notifyYourTurn({
          tokenNumber: data.tokenNumber,
          queueName: data.queueName,
        });
        
        // Remove token from localStorage after being called
        localStorage.removeItem('qms_active_token');
        setActiveToken(null);
      }
    };

    // Listen for token status updates
    const handleTokenCalled = () => {
      // Background monitoring - no action needed
    };

    socket.on('token:your-turn', handleYourTurn);
    socket.on('token:called', handleTokenCalled);

    return () => {
      socket.off('token:your-turn', handleYourTurn);
      socket.off('token:called', handleTokenCalled);
    };
  }, [socket, isConnected, activeToken, playSound, notifyYourTurn]);

  const handleClosePopup = () => {
    setShowPopup(false);
    setCalledTokenInfo(null);
  };

  // Don't render anything visible, just the popup when needed
  return (
    <>
      {showPopup && calledTokenInfo && (
        <NotificationPopup
          open={showPopup}
          onClose={handleClosePopup}
          tokenNumber={calledTokenInfo.tokenNumber}
          queueName={calledTokenInfo.queueName}
          autoDismiss={false}
        />
      )}
    </>
  );
};

export default AutoNotificationManager;
