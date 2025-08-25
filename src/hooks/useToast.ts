import { useState, useCallback } from 'react';
import { ToastMessage } from '../components/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = {
      ...toast,
      id,
      autoDismiss: toast.autoDismiss !== false,
      duration: toast.duration || 3500,
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccessToast = useCallback((message: string, action?: ToastMessage['action']) => {
    return addToast({ message, type: 'success', action });
  }, [addToast]);

  const showErrorToast = useCallback((message: string, action?: ToastMessage['action']) => {
    return addToast({ message, type: 'error', action });
  }, [addToast]);

  const showInfoToast = useCallback((message: string, action?: ToastMessage['action']) => {
    return addToast({ message, type: 'info', action });
  }, [addToast]);

  const showDeleteToast = useCallback((message: string, onUndo: () => void) => {
    return addToast({
      message,
      type: 'info',
      action: {
        label: 'Undo',
        onClick: onUndo,
      },
      autoDismiss: true,
      duration: 3500,
    });
  }, [addToast]);

  return {
    toasts,
    addToast,
    dismissToast,
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    showDeleteToast,
  };
};
