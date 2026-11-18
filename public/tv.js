(() => {
  const socket = io();
  const $ = id => document.getElementById(id);
  const video = $('slideshow');
  let objectUrl;
  const videoChannel = 'BroadcastChannel' in window ? new BroadcastChannel('tournesols-regie-video-v1') : null;
  function loadVideo(file) {
    if (!file || !(file instanceof Blob)) return;
    video.pause();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    video.load();
    $('tv-start').disabled = false;
    $('standby').hidden = false;
    status();
  }
  if (videoChannel) {
    videoChannel.onmessage = event => {
      if (event.data?.type === 'regie-ready') videoChannel.postMessage({ type: 'tv-ready' });
      if (event.data?.type !== 'video-file') return;
      try { loadVideo(event.data.file); videoChannel.postMessage({ type: 'video-received', name: event.data.file.name || 'vidéo' }); }
      catch { videoChannel.postMessage({ type: 'video-error' }); }
    };
    videoChannel.postMessage({ type: 'tv-ready' });
  }
  socket.on('connect', () => socket.emit('identify-tv'));
  function status() { socket.emit('tv-status', { loaded: Boolean(video.src), playing: !video.paused }); }
  video.addEventListener('playing', status);
  video.addEventListener('pause', status);
  video.addEventListener('loadedmetadata', status);
  $('video-file').addEventListener('change', () => {
    const file = $('video-file').files?.[0]; if (!file) return;
    loadVideo(file);
  });
  function start() {
    if (!video.src) return;
    video.play().then(() => { $('standby').hidden = true; $('tv-setup').classList.add('collapsed'); status(); }).catch(() => { $('tv-setup').classList.remove('collapsed'); });
  }
  $('tv-start').addEventListener('click', start);
  $('tv-fullscreen').addEventListener('click', () => document.documentElement.requestFullscreen?.().catch(() => {}));
  $('tv-hide').addEventListener('click', () => $('tv-setup').classList.add('collapsed'));
  $('tv-settings-button').addEventListener('click', () => $('tv-setup').classList.toggle('collapsed'));
  socket.on('set-loop', enabled => { video.loop = Boolean(enabled); });
  socket.on('tv-settings', config => {
    if (typeof config.loop === 'boolean') video.loop = config.loop;
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
