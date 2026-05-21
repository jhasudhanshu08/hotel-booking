import React from 'react';

function Stat({ label, value, accent }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] tracking-[0.18em] uppercase text-ink/55 font-medium">
        {label}
      </span>
      <span
        className={`font-display text-2xl ${accent ? 'text-' + accent : 'text-ink'}`}
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

function Legend() {
  const items = [
    { label: 'Available', class: 'bg-bone border-ink/20' },
    { label: 'Occupied', class: 'bg-ember/90 border-ember' },
    { label: 'Just Booked', class: 'bg-moss border-moss' },
  ];
  return (
    <div className="flex items-center gap-4">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span className={`w-3 h-3 border rounded-sm ${it.class}`} />
          <span className="text-xs text-ink/65">{it.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function BookingInfo({ booking, stats, error }) {
  return (
    <div className="bg-cream border border-ink/15 rounded-lg p-5 animate-fade-in">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex-1 min-w-[280px]">
          <h2 className="font-display text-lg text-ink mb-3">
            {error ? 'Could not book' : booking ? 'Latest Booking' : 'Ready to book'}
          </h2>

          {error && (
            <p className="text-ember text-sm">{error}</p>
          )}

          {!error && booking && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat label="Rooms" value={booking.bookedRoomNumbers.length} />
              <Stat label="First" value={booking.firstRoom} />
              <Stat label="Last" value={booking.lastRoom} />
              <Stat
                label="Travel Time"
                value={`${booking.totalTravelTime} min`}
              />
              <div className="col-span-2 sm:col-span-4 mt-1">
                <span className="text-[10px] tracking-[0.18em] uppercase text-ink/55 font-medium">
                  Room Numbers
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {booking.bookedRoomNumbers.map((rn) => (
                    <span
                      key={rn}
                      className="px-2 py-0.5 bg-moss/15 text-moss font-mono text-xs rounded border border-moss/30"
                    >
                      {rn}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!error && !booking && (
            <p className="text-ink/60 text-sm">
              Choose how many rooms you need (1–5) and click <em>Book</em>.
              The system will pick the optimal set: same floor first, otherwise
              the configuration that minimizes travel time.
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          {stats && (
            <div className="flex gap-4">
              <Stat label="Available" value={stats.available} />
              <Stat label="Occupied" value={stats.occupied} />
            </div>
          )}
          <Legend />
        </div>
      </div>
    </div>
  );
}
