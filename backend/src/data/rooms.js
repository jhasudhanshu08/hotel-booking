/**
 * Hotel configuration: 97 rooms across 10 floors.
 *  - Floors 1-9 have 10 rooms each (e.g., Floor 1: 101-110)
 *  - Floor 10 has 7 rooms (1001-1007)
 *
 * Position 1 on each floor is closest to the stairs/lift (left side).
 */

const FLOOR_CONFIG = [
  { floor: 1, rooms: 10, baseNumber: 101 },
  { floor: 2, rooms: 10, baseNumber: 201 },
  { floor: 3, rooms: 10, baseNumber: 301 },
  { floor: 4, rooms: 10, baseNumber: 401 },
  { floor: 5, rooms: 10, baseNumber: 501 },
  { floor: 6, rooms: 10, baseNumber: 601 },
  { floor: 7, rooms: 10, baseNumber: 701 },
  { floor: 8, rooms: 10, baseNumber: 801 },
  { floor: 9, rooms: 10, baseNumber: 901 },
  { floor: 10, rooms: 7, baseNumber: 1001 },
];

/**
 * Build the full list of 97 rooms in a fresh, all-available state.
 * @returns {Array<{roomNumber:number, floor:number, position:number, isOccupied:boolean}>}
 */
function buildInitialRooms() {
  const rooms = [];
  for (const { floor, rooms: roomCount, baseNumber } of FLOOR_CONFIG) {
    for (let position = 1; position <= roomCount; position++) {
      rooms.push({
        roomNumber: baseNumber + (position - 1),
        floor,
        position,
        isOccupied: false,
      });
    }
  }
  return rooms;
}

module.exports = { buildInitialRooms, FLOOR_CONFIG };
