'use client';

import React from 'react';

export default function ConfirmModal({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}: {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="card z-10 max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-400 mb-4">{description}</p>}
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn btn w-24 bg-gray-700 text-white">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} disabled={loading} className="btn btn-primary w-32">
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
