const express = require('express');
const hotelService = require('../services/hotelService');

const router = express.Router();

/**
 * GET /api/rooms
 * Returns the full hotel state: all rooms + last booking + stats.
 */
router.get('/rooms', (req, res) => {
  res.json({
    rooms: hotelService.getAllRooms(),
    lastBooking: hotelService.getLastBooking(),
    stats: hotelService.getStats(),
  });
});

/**
 * POST /api/book
 * Body: { count: number }   // 1..5
 * Books the optimal set of rooms and returns the booking summary.
 */
router.post('/book', (req, res) => {
  const { count } = req.body || {};

  if (typeof count !== 'number') {
    return res.status(400).json({ error: 'Body must include a numeric "count".' });
  }

  const result = hotelService.book(count);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    booking: result.booking,
    rooms: hotelService.getAllRooms(),
    stats: hotelService.getStats(),
  });
});

/**
 * POST /api/random
 * Body: { fillRatio?: number }  // optional, defaults to 0.4
 * Generates random occupancy across all rooms.
 */
router.post('/random', (req, res) => {
  const { fillRatio } = req.body || {};
  const rooms = hotelService.randomize(
    typeof fillRatio === 'number' ? fillRatio : 0.4
  );
  res.json({
    rooms,
    lastBooking: null,
    stats: hotelService.getStats(),
  });
});

/**
 * POST /api/reset
 * Clears all occupancy.
 */
router.post('/reset', (req, res) => {
  const rooms = hotelService.reset();
  res.json({
    rooms,
    lastBooking: null,
    stats: hotelService.getStats(),
  });
});

module.exports = router;
