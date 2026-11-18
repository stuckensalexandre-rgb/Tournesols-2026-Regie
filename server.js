'use strict';
const express = require('express');
const http = require('node:http');
const { Server } = require('socket.io');
const path = require('node:path');
const { timingSafeEqual } = require('node:crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const pin = process.env.ADMIN_PIN || (process.env.NODE_ENV === 'test' ? 'test-only-secret-2026' : '');
if (!pin || pin.length < 10) {
  console.error('Définir ADMIN_PIN (au moins 10 caractères) dans les variables d’environnement.');
  process.exit(1);
}

function sameSecret(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

const state = {
  ticker: 'Bienvenue au Gala des Tournesols · Namur · 2026',
  tickerVisible: false,
  tickerSpeed: 24,
  playing: false,
  videoLoaded: false,
  loop: true,
  tvConnected: false,
  screen: 'accueil'
};
const allowedCommands = new Set(['play', 'pause', 'restart', 'mute', 'unmute']);

app.disable('x-powered-by');
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
app.get('/', (_req, res) => res.redirect('/regie.html'));

function announce() { io.to('admin').emit('state', state); }

io.on('connection', socket => {
  let role = null;
  socket.on('identify-tv', () => {
    if (role === 'admin') return;
    role = 'tv';
    socket.join('tv');
    state.tvConnected = true;
    announce();
    socket.emit('tv-settings', { ticker: state.ticker, tickerVisible: state.tickerVisible, tickerSpeed: state.tickerSpeed, loop: state.loop });
  });
  socket.on('login', (candidate, callback) => {
    const valid = sameSecret(candidate, pin);
    if (valid) { role = 'admin'; socket.join('admin'); socket.emit('state', state); }
    if (typeof callback === 'function') callback({ ok: valid });
  });
  socket.on('ticker', payload => {
    if (role !== 'admin' || !payload || typeof payload !== 'object') return;
    const ticker = typeof payload.text === 'string' ? payload.text.trim().slice(0, 240) : state.ticker;
    state.ticker = ticker;
    state.tickerVisible = Boolean(payload.visible);
    state.tickerSpeed = Math.max(12, Math.min(70, Number(payload.speed) || 24));
    io.to('tv').emit('tv-settings', { ticker: state.ticker, tickerVisible: state.tickerVisible, tickerSpeed: state.tickerSpeed });
    announce();
  });
  socket.on('set-loop', enabled => {
    if (role !== 'admin') return;
    state.loop = Boolean(enabled);
    io.to('tv').emit('set-loop', state.loop);
    announce();
  });
  socket.on('video-command', command => {
    if (role !== 'admin' || !allowedCommands.has(command)) return;
    if (command === 'play' || command === 'restart') state.playing = true;
    if (command === 'pause') state.playing = false;
    io.to('tv').emit('video-command', command);
    announce();
  });
  socket.on('tv-status', payload => {
    if (role !== 'tv' || !payload || typeof payload !== 'object') return;
    state.videoLoaded = Boolean(payload.loaded);
    state.playing = Boolean(payload.playing);
    announce();
  });
  socket.on('switch-to-blindtest', destination => {
    if (role !== 'admin') return;
    if (typeof destination !== 'string' || destination.length > 1500) return;
    let url;
    try { url = new URL(destination); } catch { return; }
    if (!['https:', 'http:'].includes(url.protocol)) return;
    state.screen = 'blindtest';
    io.to('tv').emit('navigate', url.href);
    announce();
  });
  socket.on('disconnect', () => {
    if (role === 'tv') {
      state.tvConnected = io.sockets.adapter.rooms.has('tv');
      if (!state.tvConnected) { state.playing = false; state.videoLoaded = false; }
      announce();
    }
  });
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  server.listen(port, '0.0.0.0', () => console.log(`Régie prête sur le port ${port}`));
}
module.exports = { app, server, io, sameSecret };
