import React, { useState } from 'react';
import LimitModal from './LimitModal';

export default function Controls({ onBook, onRandom, onReset, busy }) {
  const [count, setCount] = useState(3);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleBook = (e) => {
    e.preventDefault();
    const n = Number(count);

    // Silently ignore invalid input (e.g. empty, zero, negative, non-integer).
    if (!Number.isInteger(n) || n < 1) return;

    // Enforce the 5-room limit with a popup (matches the backend rule).
    if (n > 5) {
      setShowLimitModal(true);
      return;
    }

    onBook(n);
  };

  return (
    <>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label
            htmlFor="rooms-input"
            className="text-[11px] tracking-[0.15em] uppercase text-ink/60 mb-1.5 font-medium"
          >
            No. of Rooms
          </label>
          <input
            id="rooms-input"
            type="number"
            min={1}
            max={5}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            disabled={busy}
            className="w-24 px-3 py-2 bg-cream border border-ink/20 rounded-md font-mono text-lg text-ink focus:outline-none focus:border-ink/60 focus:ring-2 focus:ring-ink/10 transition"
          />
        </div>

        <button
          onClick={handleBook}
          disabled={busy}
          className="px-5 py-2 bg-ink text-cream rounded-md font-medium tracking-wide hover:bg-ink/90 active:scale-[0.98] transition disabled:opacity-50"
        >
          Book
        </button>

        <button
          onClick={onRandom}
          disabled={busy}
          className="px-5 py-2 bg-cream border border-ink/25 text-ink rounded-md font-medium tracking-wide hover:bg-bone active:scale-[0.98] transition disabled:opacity-50"
        >
          Random Occupancy
        </button>

        <button
          onClick={onReset}
          disabled={busy}
          className="px-5 py-2 bg-cream border border-ember/40 text-ember rounded-md font-medium tracking-wide hover:bg-ember/10 active:scale-[0.98] transition disabled:opacity-50"
        >
          Reset
        </button>
      </div>

      <LimitModal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </>
  );
}
