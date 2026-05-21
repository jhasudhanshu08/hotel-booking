import React, { useMemo } from 'react';
import Floor from './Floor';

/**
 * Full hotel visualization.
 * Floors render top-to-bottom (10 → 1) so it looks like a real elevation view.
 * The stairs/lift column on the LEFT is rendered as a dark vertical band.
 */
export default function Hotel({ rooms, lastBooking }) {
  const floors = useMemo(() => {
    const byFloor = new Map();
    for (const r of rooms) {
      if (!byFloor.has(r.floor)) byFloor.set(r.floor, []);
      byFloor.get(r.floor).push(r);
    }
    // Sort rooms within each floor by position, return floors from 10 down to 1
    const result = [];
    for (let f = 10; f >= 1; f--) {
      const list = (byFloor.get(f) || []).sort((a, b) => a.position - b.position);
      result.push({ floor: f, rooms: list });
    }
    return result;
  }, [rooms]);

  const justBookedSet = useMemo(
    () => new Set(lastBooking ? lastBooking.bookedRoomNumbers : []),
    [lastBooking]
  );

  return (
    <div className="relative flex gap-4 p-6 bg-bone/40 rounded-lg border border-ink/10 grain overflow-hidden">
      {/* Stairs / Lift column */}
      <div className="w-12 shrink-0 bg-slate-deep rounded-md relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-between py-4 text-cream/70">
          <div className="text-[10px] tracking-[0.2em] uppercase font-mono [writing-mode:vertical-rl] rotate-180">
            Stairs · Lift
          </div>
          <div className="text-[10px] tracking-[0.2em] uppercase font-mono [writing-mode:vertical-rl] rotate-180">
            Ground
          </div>
        </div>
        {/* Decorative horizontal lines to suggest stair treads */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-cream/15" />
      </div>

      {/* Floors */}
      <div className="flex-1 flex flex-col gap-1.5">
        {floors.map(({ floor, rooms }) => (
          <Floor
            key={floor}
            floor={floor}
            rooms={rooms}
            justBookedSet={justBookedSet}
          />
        ))}
      </div>
    </div>
  );
}
