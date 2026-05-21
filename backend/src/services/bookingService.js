/**
 * Booking algorithm.
 *
 * Travel-time model (per the assignment):
 *   - Horizontal: 1 minute between two adjacent rooms on the same floor.
 *   - Vertical:   2 minutes between adjacent floors (via stairs/lift on the left).
 *
 * Travel time between two rooms A (floor f1, position p1) and B (floor f2, position p2):
 *   - Same floor (f1 === f2):       |p1 - p2|
 *   - Different floors:             (p1 - 1) + 2 * |f1 - f2| + (p2 - 1)
 *     (walk from A to stairs, take stairs to B's floor, walk from stairs to B)
 *
 * Booking rules (priority order):
 *   1. Max 5 rooms per booking.
 *   2. Prefer all rooms on the SAME floor — pick the floor + window
 *      that minimizes (lastPos - firstPos) among floors with enough availability.
 *   3. If no single floor has enough rooms, span across floors and minimize
 *      total travel time between the first and last room of the booking.
 */

const MAX_ROOMS_PER_BOOKING = 5;

/**
 * Compute travel time (in minutes) between two rooms.
 */
function travelTime(roomA, roomB) {
  if (roomA.floor === roomB.floor) {
    return Math.abs(roomA.position - roomB.position);
  }
  return (
    (roomA.position - 1) +
    2 * Math.abs(roomA.floor - roomB.floor) +
    (roomB.position - 1)
  );
}

/**
 * Given a sorted list of booked rooms, identify the "first" and "last" room
 * and the total travel time between them.
 *
 * "First" = lowest floor, then lowest position.
 * "Last"  = highest floor, then highest position.
 */
function summarizeBooking(bookedRooms) {
  if (bookedRooms.length === 0) {
    return { firstRoom: null, lastRoom: null, totalTravelTime: 0 };
  }
  const sorted = [...bookedRooms].sort(
    (a, b) => a.floor - b.floor || a.position - b.position
  );
  const firstRoom = sorted[0];
  const lastRoom = sorted[sorted.length - 1];
  return {
    firstRoom,
    lastRoom,
    totalTravelTime: travelTime(firstRoom, lastRoom),
  };
}

/**
 * Try to book `count` rooms entirely on a single floor.
 * Returns the optimal selection (smallest window) or null if no floor can fit.
 */
function findBestSingleFloorBooking(rooms, count) {
  // Group available rooms by floor.
  const availableByFloor = new Map();
  for (const room of rooms) {
    if (room.isOccupied) continue;
    if (!availableByFloor.has(room.floor)) availableByFloor.set(room.floor, []);
    availableByFloor.get(room.floor).push(room);
  }

  let best = null;

  // Iterate floors in ascending order for deterministic preference
  // (lower floors win on a tie, since less effort to reach the lobby).
  const floors = [...availableByFloor.keys()].sort((a, b) => a - b);

  for (const floor of floors) {
    const floorRooms = availableByFloor.get(floor).sort(
      (a, b) => a.position - b.position
    );
    if (floorRooms.length < count) continue;

    // Slide a window of size `count` across this floor's available rooms.
    // Window cost = position span between first and last room in the window.
    for (let i = 0; i + count <= floorRooms.length; i++) {
      const window = floorRooms.slice(i, i + count);
      const span = window[count - 1].position - window[0].position;
      if (!best || span < best.span) {
        best = { rooms: window, span, floor };
      }
    }
  }

  return best ? best.rooms : null;
}

/**
 * Fallback: book `count` rooms that span multiple floors.
 *
 * Strategy: Enumerate every contiguous "slice" of `count` rooms from the global
 * list of available rooms sorted by (floor asc, position asc). For each slice,
 * compute the travel time between its first and last room. Pick the slice with
 * minimum travel time.
 *
 * Why this works: With max 5 rooms per booking and 97 rooms total, the search
 * space is at most ~97 windows — trivially fast. Picking contiguous rooms in
 * (floor, position) order naturally clusters them in the building, which is
 * exactly what minimizes travel time between endpoints.
 */
function findBestMultiFloorBooking(rooms, count) {
  const available = rooms
    .filter((r) => !r.isOccupied)
    .sort((a, b) => a.floor - b.floor || a.position - b.position);

  if (available.length < count) return null;

  let best = null;
  for (let i = 0; i + count <= available.length; i++) {
    const window = available.slice(i, i + count);
    const time = travelTime(window[0], window[count - 1]);
    if (!best || time < best.time) {
      best = { rooms: window, time };
    }
  }

  return best ? best.rooms : null;
}

/**
 * Main booking function. Returns either:
 *   { success: true, bookedRooms, firstRoom, lastRoom, totalTravelTime }
 * or:
 *   { success: false, error }
 */
function bookRooms(rooms, count) {
  if (!Number.isInteger(count) || count < 1) {
    return { success: false, error: 'Number of rooms must be a positive integer.' };
  }
  if (count > MAX_ROOMS_PER_BOOKING) {
    return {
      success: false,
      error: `A single guest can book at most ${MAX_ROOMS_PER_BOOKING} rooms at a time.`,
    };
  }

  const availableCount = rooms.filter((r) => !r.isOccupied).length;
  if (availableCount < count) {
    return {
      success: false,
      error: `Only ${availableCount} room(s) are available; cannot book ${count}.`,
    };
  }

  // Rule 2: prefer a single floor.
  let selected = findBestSingleFloorBooking(rooms, count);

  // Rules 3 & 4: span across floors if needed.
  if (!selected) {
    selected = findBestMultiFloorBooking(rooms, count);
  }

  if (!selected) {
    return { success: false, error: 'Unable to allocate the requested rooms.' };
  }

  const summary = summarizeBooking(selected);

  return {
    success: true,
    bookedRooms: selected,
    firstRoom: summary.firstRoom,
    lastRoom: summary.lastRoom,
    totalTravelTime: summary.totalTravelTime,
  };
}

module.exports = {
  bookRooms,
  travelTime,
  summarizeBooking,
  MAX_ROOMS_PER_BOOKING,
};
