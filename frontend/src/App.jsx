import React, { useEffect, useState, useCallback } from 'react';
import { api } from './api/client';
import Controls from './components/Controls';
import Hotel from './components/Hotel';
import BookingInfo from './components/BookingInfo';

export default function App() {
  const [rooms, setRooms] = useState([]);
  const [lastBooking, setLastBooking] = useState(null);
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Initial load
  useEffect(() => {
    api
      .getRooms()
      .then((data) => {
        setRooms(data.rooms);
        setLastBooking(data.lastBooking);
        setStats(data.stats);
      })
      .catch((e) => setLoadError(e.message));
  }, []);

  const handleBook = useCallback(async (count) => {
    setBusy(true);
    setError(null);
    try {
      const data = await api.book(count);
      setRooms(data.rooms);
      setLastBooking(data.booking);
      setStats(data.stats);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, []);

  const handleRandom = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await api.random(0.4);
      setRooms(data.rooms);
      setLastBooking(null);
      setStats(data.stats);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, []);

  const handleReset = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await api.reset();
      setRooms(data.rooms);
      setLastBooking(null);
      setStats(data.stats);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, []);

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md bg-cream border border-ember/40 rounded-lg p-6 text-center">
          <h1 className="font-display text-2xl text-ember mb-2">
            Backend unreachable
          </h1>
          <p className="text-ink/70 text-sm">
            Could not reach the API at{' '}
            <code className="font-mono text-xs">
              {import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}
            </code>
            . Make sure the backend is running, then refresh.
          </p>
          <p className="text-ink/50 text-xs mt-3">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] tracking-[0.25em] uppercase text-ink/55 mb-1">
              Reservation System
            </p>
            <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
              97 Rooms <span className="text-ink/40">·</span>{' '}
              <span className="italic font-light">10 Floors</span>
            </h1>
          </div>
          <Controls
            onBook={handleBook}
            onRandom={handleRandom}
            onReset={handleReset}
            busy={busy}
          />
        </header>

        {/* Booking info / stats */}
        <section className="mb-6">
          <BookingInfo
            booking={lastBooking}
            stats={stats}
            error={error}
          />
        </section>

        {/* The building */}
        <section>
          <Hotel rooms={rooms} lastBooking={lastBooking} />
        </section>

        <footer className="mt-8 pt-6 border-t border-ink/10 text-xs text-ink/50 flex flex-wrap items-center justify-between gap-2">
          <span>
            Built for the Unstop SDE 3 assignment · Algorithm:
            same-floor first, else minimize total travel time.
          </span>
          <span className="font-mono">
            Horizontal 1 min · Vertical 2 min
          </span>
        </footer>
      </div>
    </div>
  );
}
