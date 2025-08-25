import React, { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
  autoDismiss?: boolean;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (toast.autoDismiss !== false) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(toast.id), 300); // Wait for fade out animation
      }, toast.duration || 3500);

      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const handleAction = () => {
    if (toast.action) {
      toast.action.onClick();
      handleDismiss();
    }
  };

  return (
    <div className={`toast ${toast.type} ${isVisible ? 'visible' : ''}`}>
      <div className="toast-content">
        <span className="toast-message">{toast.message}</span>
        {toast.action && (
          <button className="toast-action" onClick={handleAction}>
            {toast.action.label}
          </button>
        )}
        <button className="toast-close" onClick={handleDismiss}>
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
