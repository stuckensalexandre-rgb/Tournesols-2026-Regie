(() => {
  const socket = io();
  const $ = id => document.getElementById(id);
  const video = $('slideshow');
  let objectUrl;
  socket.on('connect', () => socket.emit('identify-tv'));
  function status() { socket.emit('tv-status', { loaded: Boolean(video.src), playing: !video.paused }); }
  video.addEventListener('playing', status);
  video.addEventListener('pause', status);
  video.addEventListener('loadedmetadata', status);
  $('video-file').addEventListener('change', () => {
    const file = $('video-file').files?.[0]; if (!file) return;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    video.load();
    $('tv-start').disabled = false;
    status();
  });
  function start() {
    if (!video.src) return;
    video.play().then(() => { $('standby').hidden = true; $('tv-setup').classList.add('collapsed'); status(); }).catch(() => { $('tv-setup').classList.remove('collapsed'); });
  }
  $('tv-start').addEventListener('click', start);
  $('tv-fullscreen').addEventListener('click', () => document.documentElement.requestFullscreen?.().catch(() => {}));
  $('tv-hide').addEventListener('click', () => $('tv-setup').classList.add('collapsed'));
  $('tv-settings-button').addEventListener('click', () => $('tv-setup').classList.toggle('collapsed'));
  socket.on('tv-settings', config => {
    const text = config.ticker || '';
    $('ticker-content').textContent = text;
    $('ticker-duplicate').textContent = text;
    $('ticker').hidden = !config.tickerVisible || !text;
    $('ticker').style.setProperty('--ticker-duration', `${Number(config.tickerSpeed) || 24}s`);
  });
  socket.on('video-command', command => {
    if (command === 'play') start();
    if (command === 'pause') video.pause();
    if (command === 'restart') { video.currentTime = 0; start(); }
    if (command === 'mute') video.muted = true;
    if (command === 'unmute') video.muted = false;
  });
  socket.on('navigate', url => { if (typeof url === 'string' && /^https?:\/\//.test(url)) window.location.assign(url); });
})();
