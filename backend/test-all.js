/**
 * Comprehensive test suite for the Hotel Room Reservation System.
 * Covers every requirement from the PDF assignment.
 *
 * Run: node test-all.js
 */

const { buildInitialRooms, FLOOR_CONFIG } = require('./src/data/rooms');
const {
  bookRooms,
  travelTime,
  MAX_ROOMS_PER_BOOKING,
} = require('./src/services/bookingService');
const hotelService = require('./src/services/hotelService');

let passed = 0;
let failed = 0;
const failures = [];

function assertEqual(actual, expected, name) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  PASS  ${name}`);
    passed++;
  } else {
    console.log(`  FAIL  ${name}`);
    console.log(`        expected: ${e}`);
    console.log(`        actual:   ${a}`);
    failed++;
    failures.push(name);
  }
}

function assertTrue(cond, name) {
  if (cond) {
    console.log(`  PASS  ${name}`);
    passed++;
  } else {
    console.log(`  FAIL  ${name}`);
    failed++;
    failures.push(name);
  }
}

function occupyAllExcept(rooms, keepAvailable) {
  rooms.forEach((r) => {
    r.isOccupied = !keepAvailable.includes(r.roomNumber);
  });
}

// =========================================================
// SECTION 1 — Hotel structure (97 rooms, 10 floors layout)
// =========================================================
console.log('\n=== SECTION 1: Hotel structure ===');
{
  const rooms = buildInitialRooms();
  assertEqual(rooms.length, 97, 'Total rooms is 97');

  for (let f = 1; f <= 9; f++) {
    const floorRooms = rooms.filter((r) => r.floor === f);
    assertEqual(floorRooms.length, 10, `Floor ${f} has 10 rooms`);
  }
  const floor10 = rooms.filter((r) => r.floor === 10);
  assertEqual(floor10.length, 7, 'Floor 10 has 7 rooms');

  // Floor 1 numbered 101-110
  const f1Numbers = rooms.filter((r) => r.floor === 1).map((r) => r.roomNumber);
  assertEqual(f1Numbers, [101, 102, 103, 104, 105, 106, 107, 108, 109, 110], 'Floor 1: 101-110');

  // Floor 2 numbered 201-210
  const f2Numbers = rooms.filter((r) => r.floor === 2).map((r) => r.roomNumber);
  assertEqual(f2Numbers, [201, 202, 203, 204, 205, 206, 207, 208, 209, 210], 'Floor 2: 201-210');

  // Floor 10 numbered 1001-1007
  const f10Numbers = floor10.map((r) => r.roomNumber);
  assertEqual(f10Numbers, [1001, 1002, 1003, 1004, 1005, 1006, 1007], 'Floor 10: 1001-1007');

  // Position 1 closest to stairs
  const r101 = rooms.find((r) => r.roomNumber === 101);
  assertEqual(r101.position, 1, 'Room 101 is at position 1 (nearest stairs)');
  const r110 = rooms.find((r) => r.roomNumber === 110);
  assertEqual(r110.position, 10, 'Room 110 is at position 10 (farthest from stairs)');
}

// =========================================================
// SECTION 2 — Travel-time formula
// =========================================================
console.log('\n=== SECTION 2: Travel-time formula ===');
{
  const r101 = { floor: 1, position: 1 };
  const r102 = { floor: 1, position: 2 };
  const r110 = { floor: 1, position: 10 };
  const r201 = { floor: 2, position: 1 };
  const r202 = { floor: 2, position: 2 };
  const r1001 = { floor: 10, position: 1 };
  const r1007 = { floor: 10, position: 7 };

  // Same floor: |p1 - p2|
  assertEqual(travelTime(r101, r102), 1, 'Same floor adjacent: 1 min (101->102)');
  assertEqual(travelTime(r101, r110), 9, 'Same floor full span: 9 min (101->110)');

  // Cross floor: (p1-1) + 2*|f1-f2| + (p2-1)
  // 101 -> 201: 0 + 2 + 0 = 2
  assertEqual(travelTime(r101, r201), 2, 'Cross floor same column: 2 min (101->201)');
  // 101 -> 202: 0 + 2 + 1 = 3
  assertEqual(travelTime(r101, r202), 3, 'Cross floor 101->202: 3 min');
  // 101 -> 1001: 0 + 18 + 0 = 18
  assertEqual(travelTime(r101, r1001), 18, '101 -> 1001: 18 min');
  // 110 -> 1001: 9 + 18 + 0 = 27
  assertEqual(travelTime(r110, r1001), 27, '110 -> 1001: 27 min');
  // 110 -> 1007: 9 + 18 + 6 = 33
  assertEqual(travelTime(r110, r1007), 33, '110 -> 1007: 33 min');
  // Symmetric
  assertEqual(travelTime(r110, r101), 9, 'Symmetric: 110->101 == 101->110');
}

// =========================================================
// SECTION 3 — PDF Example Scenarios
// =========================================================
console.log('\n=== SECTION 3: PDF example scenarios ===');

// PDF Scenario 1: Available 101,102,105,106 / 201,202,203,210 / 301,302
//   Book 4 -> 101,102,105,106 on Floor 1
{
  const rooms = buildInitialRooms();
  occupyAllExcept(rooms, [101, 102, 105, 106, 201, 202, 203, 210, 301, 302]);
  const r = bookRooms(rooms, 4);
  assertTrue(r.success, 'PDF Scenario 1: booking succeeds');
  assertEqual(
    r.bookedRooms.map((x) => x.roomNumber),
    [101, 102, 105, 106],
    'PDF Scenario 1: picks 101,102,105,106'
  );
  // Travel time = 106 - 101 = 5 (same floor)
  assertEqual(r.totalTravelTime, 5, 'PDF Scenario 1: travel time = 5 min');
}

// PDF Scenario 2: Only 2 rooms available on Floor 1 (101, 102), Floor 2 has 4
//   Book 4 -> 201, 202, 203, 210 (Floor 2 has enough rooms — single floor wins)
//   PDF text says "201, 202" but mentions only 2 rooms; with the available set
//   201,202,203,210 on floor 2, the algorithm should pick 4 rooms from floor 2.
{
  const rooms = buildInitialRooms();
  occupyAllExcept(rooms, [101, 102, 201, 202, 203, 210, 301, 302]);
  const r = bookRooms(rooms, 4);
  assertTrue(r.success, 'PDF Scenario 2: booking succeeds');
  // Floor 2 has 4 available — single-floor wins. Window 201,202,203,210
  // is the only 4-room window on floor 2.
  assertEqual(
    r.bookedRooms.map((x) => x.roomNumber),
    [201, 202, 203, 210],
    'PDF Scenario 2: takes 4 rooms from Floor 2'
  );
}

// PDF Scenario 2 strict reading: book 2 rooms when Floor 1 has 101,102
//   -> should pick 101, 102 (lowest floor, smallest window)
{
  const rooms = buildInitialRooms();
  occupyAllExcept(rooms, [101, 102, 201, 202, 203, 210, 301, 302]);
  const r = bookRooms(rooms, 2);
  assertEqual(
    r.bookedRooms.map((x) => x.roomNumber),
    [101, 102],
    'PDF Scenario 2 (book 2): picks 101,102 from Floor 1'
  );
  assertEqual(r.totalTravelTime, 1, 'PDF Scenario 2 (book 2): travel time = 1');
}

// =========================================================
// SECTION 4 — Booking Rule 1: Max 5 rooms per booking
// =========================================================
console.log('\n=== SECTION 4: Max 5 rooms ===');
{
  assertEqual(MAX_ROOMS_PER_BOOKING, 5, 'MAX_ROOMS_PER_BOOKING constant is 5');

  const rooms = buildInitialRooms();
  const r6 = bookRooms(rooms, 6);
  assertEqual(r6.success, false, 'Booking 6 rooms fails');
  assertTrue(
    typeof r6.error === 'string' && r6.error.includes('5'),
    'Error message mentions the 5-room limit'
  );

  const r5 = bookRooms(rooms, 5);
  assertEqual(r5.success, true, 'Booking exactly 5 rooms succeeds');
  assertEqual(r5.bookedRooms.length, 5, 'Booking 5 returns 5 rooms');

  // Edge: 0 and negative
  const r0 = bookRooms(rooms, 0);
  assertEqual(r0.success, false, 'Booking 0 rooms fails');
  const rNeg = bookRooms(rooms, -1);
  assertEqual(rNeg.success, false, 'Booking -1 rooms fails');
  const rFrac = bookRooms(rooms, 2.5);
  assertEqual(rFrac.success, false, 'Booking 2.5 rooms fails (non-integer)');
}

// =========================================================
// SECTION 5 — Booking Rule 2: Same floor preferred
// =========================================================
console.log('\n=== SECTION 5: Same-floor preference ===');

// All rooms free — book 3 should choose lowest floor leftmost
{
  const rooms = buildInitialRooms();
  const r = bookRooms(rooms, 3);
  assertEqual(
    r.bookedRooms.map((x) => x.roomNumber),
    [101, 102, 103],
    'All free, book 3: takes 101,102,103'
  );
  assertEqual(r.totalTravelTime, 2, 'Travel time 101->103 = 2');
}

// Floor 1 cannot fit 5 (one room occupied), floor 2 fully free
{
  const rooms = buildInitialRooms();
  rooms.find((r) => r.roomNumber === 105).isOccupied = true;
  // Floor 1 best window of 5 contiguous: 101-104 + 106? No - sliding 5 over
  // available [101,102,103,104,106,107,108,109,110]:
  //   [101..104,106] span=5; [102..104,106,107] span=5; ... [106..110] span=4
  // Best span on F1 = 4 (rooms 106-110).
  // Floor 2 best window = 201-205 with span 4. Tie -> lowest floor wins.
  const r = bookRooms(rooms, 5);
  assertTrue(r.success, 'Book 5 with 105 occupied succeeds');
  assertEqual(r.bookedRooms[0].floor, 1, 'Stays on Floor 1 when span ties');
  // Both options have span 4; algorithm scans floor 1 first so picks 106-110.
  assertEqual(
    r.bookedRooms.map((x) => x.roomNumber),
    [106, 107, 108, 109, 110],
    'Picks 106-110 on Floor 1 (span 4 ties with F2 but F1 first)'
  );
}

// Single floor preferred even when a tighter-spanning cross-floor window exists
// Floor 1 has 5 rooms scattered (101,103,105,107,109) -> span 8
// Floor 2 fully free -> 5 rooms span 4
// The algorithm picks 201-205 because it's smaller span on a single floor.
{
  const rooms = buildInitialRooms();
  [102, 104, 106, 108, 110].forEach((rn) => {
    rooms.find((r) => r.roomNumber === rn).isOccupied = true;
  });
  const r = bookRooms(rooms, 5);
  assertEqual(
    r.bookedRooms.map((x) => x.roomNumber),
    [201, 202, 203, 204, 205],
    'Smaller-span floor beats scattered lower floor'
  );
}

// =========================================================
// SECTION 6 — Booking Rule 3 & 4: Cross-floor fallback
// =========================================================
console.log('\n=== SECTION 6: Cross-floor fallback ===');

// No single floor has 5 rooms available; must cross floors.
// Floor 1 has 3 rooms (108,109,110), Floor 2 has 2 (201,202), rest occupied.
// Book 5 -> 108,109,110,201,202
{
  const rooms = buildInitialRooms();
  occupyAllExcept(rooms, [108, 109, 110, 201, 202]);
  const r = bookRooms(rooms, 5);
  assertTrue(r.success, 'Cross-floor 5 booking succeeds');
  assertEqual(
    r.bookedRooms.map((x) => x.roomNumber).sort((a, b) => a - b),
    [108, 109, 110, 201, 202],
    'Picks 108,109,110,201,202 across floors'
  );
  // Travel time 108 -> 202: (8-1) + 2*1 + (2-1) = 7 + 2 + 1 = 10
  assertEqual(r.totalTravelTime, 10, 'Cross-floor travel time = 10');
}

// Cross-floor must minimize travel time between first and last room.
// Floor 1 has 1 room (110), Floor 2 has 5 rooms.
// Option A: 110 + 201,202,203,204 -> travel: 9 + 2 + 3 = 14
// Option B: all 5 on F2 (201-205) -> single floor, span 4
// Single floor wins.
{
  const rooms = buildInitialRooms();
  occupyAllExcept(rooms, [110, 201, 202, 203, 204, 205]);
  const r = bookRooms(rooms, 5);
  assertEqual(
    r.bookedRooms.map((x) => x.roomNumber),
    [201, 202, 203, 204, 205],
    'Single floor beats cross-floor when both fit'
  );
}

// Floor 1 has 4 rooms (101-104), Floor 2 has 1 room only (201)
// Book 5 -> must combine. Best window 101,102,103,104,201.
// Travel: 101 -> 201: 0 + 2 + 0 = 2
{
  const rooms = buildInitialRooms();
  occupyAllExcept(rooms, [101, 102, 103, 104, 201]);
  const r = bookRooms(rooms, 5);
  assertEqual(
    r.bookedRooms.map((x) => x.roomNumber).sort((a, b) => a - b),
    [101, 102, 103, 104, 201],
    'Combine F1 + F2 when neither alone fits 5'
  );
  assertEqual(r.totalTravelTime, 2, 'Travel time 101->201 = 2 min');
}

// =========================================================
// SECTION 7 — Capacity limits
// =========================================================
console.log('\n=== SECTION 7: Capacity ===');

// Cannot book more rooms than available.
{
  const rooms = buildInitialRooms();
  rooms.forEach((r) => (r.isOccupied = true)); // all occupied
  const r = bookRooms(rooms, 1);
  assertEqual(r.success, false, 'Book 1 when hotel full -> fails');

  rooms[0].isOccupied = false; // exactly 1 free
  const r2 = bookRooms(rooms, 1);
  assertEqual(r2.success, true, 'Book 1 when 1 free -> succeeds');
  const r3 = bookRooms(rooms, 2);
  assertEqual(r3.success, false, 'Book 2 when 1 free -> fails');
}

// =========================================================
// SECTION 8 — HotelService integration (state mutation & history)
// =========================================================
console.log('\n=== SECTION 8: HotelService integration ===');
{
  hotelService.reset();
  const stats0 = hotelService.getStats();
  assertEqual(stats0.total, 97, 'Service: total rooms is 97');
  assertEqual(stats0.occupied, 0, 'Service: occupied is 0 after reset');
  assertEqual(stats0.available, 97, 'Service: available is 97 after reset');

  const b1 = hotelService.book(3);
  assertEqual(b1.success, true, 'Service: book 3 succeeds');
  assertEqual(b1.booking.bookedRoomNumbers, [101, 102, 103], 'Service: 101-103 booked');

  const stats1 = hotelService.getStats();
  assertEqual(stats1.occupied, 3, 'Service: occupied is 3 after first booking');
  assertEqual(stats1.available, 94, 'Service: available is 94 after first booking');

  // Subsequent booking skips just-booked rooms
  const b2 = hotelService.book(2);
  assertEqual(b2.booking.bookedRoomNumbers, [104, 105], 'Service: next booking picks 104,105');

  const stats2 = hotelService.getStats();
  assertEqual(stats2.occupied, 5, 'Service: occupied is 5 after second booking');

  // Reset clears everything
  hotelService.reset();
  const stats3 = hotelService.getStats();
  assertEqual(stats3.occupied, 0, 'Service: reset clears occupancy');
  assertEqual(hotelService.getLastBooking(), null, 'Service: reset clears bookings history');
}

// Random occupancy generation works and is in range
{
  hotelService.reset();
  hotelService.randomize(0.5);
  const stats = hotelService.getStats();
  assertTrue(stats.occupied >= 0 && stats.occupied <= 97, 'Random: occupied count in valid range');
  assertEqual(stats.occupied + stats.available, 97, 'Random: occupied + available = 97');
  hotelService.reset();
}

// Booking after random occupancy still respects rules
{
  hotelService.reset();
  hotelService.randomize(0.3);
  const availableBefore = hotelService.getStats().available;
  if (availableBefore >= 3) {
    const b = hotelService.book(3);
    assertEqual(b.success, true, 'Random + book 3 succeeds when ≥3 available');
    assertEqual(b.booking.bookedRoomNumbers.length, 3, 'Random + book 3: returns 3 rooms');
  }
  hotelService.reset();
}

// =========================================================
// SUMMARY
// =========================================================
console.log('\n=========================================');
console.log(`TOTAL: ${passed + failed}   PASSED: ${passed}   FAILED: ${failed}`);
console.log('=========================================');
if (failed > 0) {
  console.log('\nFailed tests:');
  failures.forEach((f) => console.log('  - ' + f));
  process.exit(1);
} else {
  console.log('All tests passed.');
  process.exit(0);
}
