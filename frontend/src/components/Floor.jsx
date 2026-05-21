import React from 'react';
import Room from './Room';

/**
 * A single floor row: floor label + rooms.
 * Floor 10 only has 7 rooms; we pad with empty slots so the grid stays aligned.
 */
export default function Floor({ floor, rooms, justBookedSet }) {
  const ROOMS_PER_FLOOR = 10;
  const padding = ROOMS_PER_FLOOR - rooms.length;

  return (
    <div className="flex items-center gap-2">
      <div className="w-10 shrink-0 text-right">
        <div className="font-display text-sm text-ink/60">F{floor}</div>
      </div>
      <div className="grid grid-cols-10 gap-1.5 flex-1">
        {rooms.map((room) => (
          <Room
            key={room.roomNumber}
            room={room}
            isJustBooked={justBookedSet.has(room.roomNumber)}
          />
        ))}
        {/* Empty placeholder cells so floor 10 aligns visually */}
        {Array.from({ length: padding }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}
      </div>
    </div>
  );
}
