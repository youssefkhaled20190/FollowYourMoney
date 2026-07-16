// src/Components/SwalAlert.js
import React, { useEffect } from 'react';
import 'remixicon/fonts/remixicon.css';

const CustomSwal = ({
  isOpen,
  type = 'success',
  title,
  message,
  confirmText = 'OK',
  showConfirmButton = true,
  showCancelButton = false,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  showInput = false,
  inputPlaceholder = '',
}) => {
  const [inputValue, setInputValue] = React.useState('');
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen) return null;

  // Get icon and color based on type
  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'ri-checkbox-circle-line',
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
          borderColor: 'border-green-500',
        };
      case 'error':
        return {
          icon: 'ri-error-warning-line',
          bgColor: 'bg-red-100',
          textColor: 'text-red-600',
          borderColor: 'border-red-500',
        };
      case 'warning':
        return {
          icon: 'ri-alert-line',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-600',
          borderColor: 'border-yellow-500',
        };
      case 'info':
        return {
          icon: 'ri-information-line',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-500',
        };
      case 'loading':
        return {
          icon: 'ri-donut-chart-line animate-spin',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-500',
        };

      default:
        return {
          icon: 'ri-checkbox-circle-line',
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
          borderColor: 'border-green-500',
        };
    }
  };

  const iconConfig = getIconConfig();

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm(showInput ? inputValue : undefined);
    }
    setInputValue('');
    onClose();
  };

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handleClose = () => {
    if (!showCancelButton) {
      onClose();
    } else {
      handleCancelClick();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <i className="ri-close-line text-2xl"></i>
        </button>

        {/* Content */}
        <div className="p-6 md:p-8 text-center">
          {/* Icon */}
          <div
            className={`inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full ${iconConfig.bgColor} mb-4`}
          >
            <i className={`${iconConfig.icon} text-5xl md:text-6xl ${iconConfig.textColor}`}></i>
          </div>

          {/* Title */}
          {title && (
            <h2 className="text-xl md:text-2xl font-Cairo font-bold text-gray-800 mb-3">{title}</h2>
          )}

          {/* Message */}
          {message && (
            <p className="text-sm md:text-base text-gray-600 font-Cairo mb-6 leading-relaxed whitespace-pre-line">
                   {message}
            </p>
          )}

          {/* Optional Input */}
          {showInput && (
            <div className="mb-6">
              <input
                type="text"
                autoFocus
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none font-Cairo text-sm"
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirm();
                }}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            {showCancelButton && (
              <button
                onClick={handleCancelClick}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-Cairo font-medium hover:bg-gray-300 transition-colors duration-200 min-w-[100px]"
              >
                {cancelText}
              </button>
            )}
            {showConfirmButton && (
              <button
                onClick={handleConfirm}
                className={`px-6 py-2.5 rounded-lg font-Cairo font-medium transition-colors duration-200 min-w-[100px] ${
                  type === 'error'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : type === 'warning'
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
`;
document.head.appendChild(style);

export default CustomSwal;
