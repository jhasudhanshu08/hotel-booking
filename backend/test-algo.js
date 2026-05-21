const { buildInitialRooms } = require('./src/data/rooms');
const { bookRooms, travelTime } = require('./src/services/bookingService');

// ===== TEST 1: PDF Example Scenario =====
// Available: F1: 101, 102, 105, 106 | F2: 201, 202, 203, 210 | F3: 301, 302
// Book 4 rooms -> expect 101, 102, 105, 106
console.log('--- TEST 1: PDF example (book 4) ---');
let rooms = buildInitialRooms();
const available1 = [101, 102, 105, 106, 201, 202, 203, 210, 301, 302];
rooms.forEach(r => { if (!available1.includes(r.roomNumber)) r.isOccupied = true; });
let result = bookRooms(rooms, 4);
console.log('Booked:', result.bookedRooms.map(r => r.roomNumber));
console.log('Travel time:', result.totalTravelTime, 'min');
console.log('Expected: [101, 102, 105, 106]');

// ===== TEST 2: PDF Example Scenario 3 =====
// Floor 1 has only 101, 102 available; rest of building has more
// Book 4 rooms -> should NOT take floor 1, must use a single floor with enough rooms
console.log('\n--- TEST 2: Floor 1 limited, book 4 ---');
rooms = buildInitialRooms();
const available2 = [101, 102, 201, 202, 203, 210, 301, 302];
rooms.forEach(r => { if (!available2.includes(r.roomNumber)) r.isOccupied = true; });
result = bookRooms(rooms, 4);
console.log('Booked:', result.bookedRooms.map(r => r.roomNumber));
console.log('Travel time:', result.totalTravelTime, 'min');
console.log('Expected: 4 rooms on floor 2 (201,202,203,210)');

// ===== TEST 3: All available, book 3 =====
console.log('\n--- TEST 3: All rooms free, book 3 ---');
rooms = buildInitialRooms();
result = bookRooms(rooms, 3);
console.log('Booked:', result.bookedRooms.map(r => r.roomNumber));
console.log('Travel time:', result.totalTravelTime, 'min');
console.log('Expected: 101, 102, 103 (lowest floor, leftmost)');

// ===== TEST 4: Max enforcement =====
console.log('\n--- TEST 4: Try to book 6 ---');
rooms = buildInitialRooms();
result = bookRooms(rooms, 6);
console.log('Result:', result);

// ===== TEST 5: Single floor still preferred over cross-floor =====
console.log('\n--- TEST 5: Floor 1 has only 110, book 5 ---');
rooms = buildInitialRooms();
[101,102,103,104,105,106,107,108,109].forEach(rn => {
  rooms.find(r => r.roomNumber === rn).isOccupied = true;
});
result = bookRooms(rooms, 5);
console.log('Booked:', result.bookedRooms.map(r => r.roomNumber));
console.log('Travel time:', result.totalTravelTime, 'min');
console.log('Expected: 201-205 (floor 2 has 5, beats cross-floor)');

// ===== TEST 6: Travel time formula spot-checks =====
console.log('\n--- TEST 6: Travel time formula ---');
const r101 = { floor:1, position:1 };
const r110 = { floor:1, position:10 };
const r1001 = { floor:10, position:1 };
const r202 = { floor:2, position:2 };
console.log('101 -> 110 (same floor):', travelTime(r101, r110), '| expect 9');
console.log('101 -> 202 (cross-floor):', travelTime(r101, r202), '| expect 3');
console.log('101 -> 1001 (cross-floor):', travelTime(r101, r1001), '| expect 18');
console.log('110 -> 1001 (cross-floor):', travelTime(r110, r1001), '| expect 27');
