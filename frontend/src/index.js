import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { QueueProvider } from './context/QueueContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <SocketProvider>
        <QueueProvider>
          <App />
        </QueueProvider>
      </SocketProvider>
    </ThemeProvider>
  </React.StrictMode>
);