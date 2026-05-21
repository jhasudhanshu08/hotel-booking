import React from 'react';

/**
 * Single room cell. Three visual states:
 *   - available (default bone color)
 *   - occupied (deep ember)
 *   - just-booked (moss green, with subtle pulse)
 */
export default function Room({ room, isJustBooked }) {
  const { roomNumber, isOccupied } = room;

  let stateClass;
  if (isJustBooked) {
    stateClass =
      'bg-moss text-cream border-moss animate-pulse-glow';
  } else if (isOccupied) {
    stateClass = 'bg-ember/90 text-cream border-ember';
  } else {
    stateClass =
      'bg-bone text-ink/80 border-ink/15 hover:border-ink/40';
  }

  return (
    <div
      title={`Room ${roomNumber} · ${
        isJustBooked ? 'Just booked' : isOccupied ? 'Occupied' : 'Available'
      }`}
      className={`
        relative aspect-square w-full
        flex items-center justify-center
        text-[11px] font-mono font-medium tracking-tight
        border rounded-[3px]
        transition-all duration-200
        ${stateClass}
      `}
    >
      {roomNumber}
    </div>
  );
}
