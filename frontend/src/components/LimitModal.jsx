import React, { useEffect } from 'react';

/**
 * Modal shown when the guest attempts to book more than the allowed 5 rooms.
 * Click outside or press Esc to close.
 */
export default function LimitModal({ open, onClose }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="limit-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative bg-cream rounded-lg shadow-2xl border border-ink/15 max-w-md w-full p-6">
        {/* Ember accent bar */}
        <div className="w-12 h-1 bg-ember rounded-full mb-4" />

        <h2
          id="limit-modal-title"
          className="font-display text-2xl text-ink mb-2"
        >
          Booking limit reached
        </h2>
        <p className="text-ink/70 leading-relaxed mb-5">
          A single guest can book a maximum of{' '}
          <span className="font-medium text-ink">5 rooms</span> at a time.
          Please reduce the count and try again.
        </p>

        <button
          onClick={onClose}
          autoFocus
          className="w-full px-5 py-2.5 bg-ink text-cream rounded-md font-medium tracking-wide hover:bg-ink/90 active:scale-[0.98] transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
