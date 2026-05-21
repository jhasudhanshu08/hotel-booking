const express = require('express');
const cors = require('cors');
const roomsRouter = require('./routes/rooms');

const app = express();
const PORT = process.env.PORT || 4000;

const rawOrigins = (process.env.ALLOWED_ORIGINS || '').trim();
let corsOrigin;
if (!rawOrigins || rawOrigins === '*') {
  corsOrigin = '*';
} else {
  corsOrigin = rawOrigins.split(',').map((s) => s.trim()).filter(Boolean);
}

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Health check (useful for Render's keep-alive pings).
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', roomsRouter);

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Hotel booking API listening on port ${PORT}`);
});
