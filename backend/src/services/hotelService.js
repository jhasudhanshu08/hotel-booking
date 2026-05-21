/**
 * In-memory state service for the hotel.
 *
 * In a real system this would be backed by a database with proper
 * concurrency control. For this assignment a single-process in-memory
 * store is sufficient and makes the algorithm easy to demonstrate.
 */

const { buildInitialRooms } = require('../data/rooms');
const { bookRooms } = require('./bookingService');

class HotelService {
  constructor() {
    this.rooms = buildInitialRooms();
    this.bookings = []; // history of bookings (for "last booking" highlight)
  }

  /** Return a defensive copy of all rooms. */
  getAllRooms() {
    return this.rooms.map((r) => ({ ...r }));
  }

  /** Return the most recent booking (or null). */
  getLastBooking() {
    return this.bookings.length ? this.bookings[this.bookings.length - 1] : null;
  }

  /**
   * Attempt to book `count` rooms. On success, mutates state and records the
   * booking. On failure, returns an error object.
   */
  book(count) {
    const result = bookRooms(this.rooms, count);
    if (!result.success) return result;

    // Mutate the actual stored rooms (the algorithm returned references).
    for (const r of result.bookedRooms) {
      const stored = this.rooms.find((x) => x.roomNumber === r.roomNumber);
      stored.isOccupied = true;
    }

    const booking = {
      id: this.bookings.length + 1,
      timestamp: new Date().toISOString(),
      requestedCount: count,
      bookedRoomNumbers: result.bookedRooms.map((r) => r.roomNumber),
      firstRoom: result.firstRoom.roomNumber,
      lastRoom: result.lastRoom.roomNumber,
      totalTravelTime: result.totalTravelTime,
    };
    this.bookings.push(booking);

    return { success: true, booking };
  }

  /**
   * Randomly mark rooms as occupied with the given fill ratio (0..1).
   * Rooms not chosen are explicitly marked available (overwrites prior state).
   */
  randomize(fillRatio = 0.4) {
    const ratio = Math.max(0, Math.min(1, fillRatio));
    for (const r of this.rooms) {
      r.isOccupied = Math.random() < ratio;
    }
    this.bookings = []; // randomization invalidates booking history
    return this.getAllRooms();
  }

  /** Clear all occupancy and history. */
  reset() {
    for (const r of this.rooms) r.isOccupied = false;
    this.bookings = [];
    return this.getAllRooms();
  }

  /** Aggregate stats for the dashboard. */
  getStats() {
    const total = this.rooms.length;
    const occupied = this.rooms.filter((r) => r.isOccupied).length;
    return {
      total,
      occupied,
      available: total - occupied,
      occupancyRate: total ? +(occupied / total).toFixed(2) : 0,
    };
  }
}

// Export a singleton: a single hotel for the whole process.
module.exports = new HotelService();
