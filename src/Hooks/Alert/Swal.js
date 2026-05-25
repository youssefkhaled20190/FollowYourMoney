import CustomSwal from "../../Components/SwalAlert"
import React, { useState } from "react";

export const useSwal = () => {
 const [swalState, setSwalState] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    confirmText: 'OK',
    showCancelButton: false,
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null
  });

  const showSwal = (options) => {
    setSwalState({
      isOpen: true,
      type: options.type || 'success',
      title: options.title || '',
      message: options.message || '',
      confirmText: options.confirmText || 'OK',
      showCancelButton: options.showCancelButton || false,
      cancelText: options.cancelText || 'Cancel',
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null
    });
  };

  const closeSwal = () => {
    setSwalState(prev => ({ ...prev, isOpen: false }));
  };

  const showSuccess = (title, message, options = {}) => {
    showSwal({
      type: 'success',
      title,
      message,
      ...options
    });
  };

  const showError = (title, message, options = {}) => {
    showSwal({
      type: 'error',
      title,
      message,
      ...options
    });
  };

  const showDeleteConfirmation = (title = 'Are you sure?', message = 'This action cannot be undone!', onConfirm, onCancel) => {
    showSwal({
      type: 'error',
      title,
      message,
      confirmText: 'Yes, Delete',
      showCancelButton: true,
      cancelText: 'Cancel',
      onConfirm,
      onCancel
    });
  };

  return {
    swalState,
    showSwal,
    closeSwal,
    showSuccess,
    showError,
    showDeleteConfirmation,
    SwalComponent: () => (
      <CustomSwal
        {...swalState}
        onClose={closeSwal}
      />
    )
  };
};

