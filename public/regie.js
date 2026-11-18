(() => {
  const socket = io();
  const $ = id => document.getElementById(id);
  let authorized = false;
  socket.on('connect', () => { $('connection-label').textContent = 'Serveur connecté'; $('connection-dot').classList.add('online'); if (authorized) $('login-error').textContent = 'Connexion rétablie : saisissez à nouveau le code.'; authorized = false; $('locked').hidden = false; $('controls').hidden = true; });
  socket.on('disconnect', () => { $('connection-label').textContent = 'Hors connexion'; $('connection-dot').classList.remove('online'); });
  $('login-form').addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('login', $('pin').value, result => {
      if (!result?.ok) { $('login-error').textContent = 'Code incorrect. Vérifiez ADMIN_PIN.'; return; }
      authorized = true; $('pin').value = ''; $('locked').hidden = true; $('controls').hidden = false; $('login-error').textContent = '';
    });
  });
  socket.on('state', state => {
    if (!authorized) return;
    $('tv-status').textContent = state.tvConnected ? 'TV connectée' : 'TV hors ligne';
    $('tv-status').classList.toggle('good', state.tvConnected);
    $('video-status').textContent = !state.videoLoaded ? 'Vidéo à charger sur la TV' : state.playing ? 'Diaporama en lecture' : 'Diaporama en pause';
    $('ticker-visible').checked = state.tickerVisible;
    if (document.activeElement !== $('ticker-text')) $('ticker-text').value = state.ticker;
    if (document.activeElement !== $('ticker-speed')) $('ticker-speed').value = state.tickerSpeed;
    updatePreview();
  });
  function updatePreview() { $('ticker-preview-text').textContent = $('ticker-text').value || 'Votre message apparaîtra ici'; $('speed-label').textContent = $('ticker-speed').value + ' s'; }
  $('ticker-text').addEventListener('input', updatePreview);
  $('ticker-speed').addEventListener('input', updatePreview);
  function applyTicker() { socket.emit('ticker', { text: $('ticker-text').value, visible: $('ticker-visible').checked, speed: Number($('ticker-speed').value) }); }
  $('ticker-apply').addEventListener('click', applyTicker);
  $('ticker-visible').addEventListener('change', applyTicker);
  for (const id of ['play', 'pause', 'restart', 'mute']) $(id).addEventListener('click', () => socket.emit('video-command', id));
  $('switch-game').addEventListener('click', () => {
    const tv = $('tv-url').value.trim(), host = $('host-url').value.trim();
    function valid(value) { try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; } }
    if (!valid(tv) || !valid(host)) { $('handoff-status').textContent = 'Indiquez deux liens complets commençant par https://'; return; }
    if (!confirm('Passer la télévision au Blind Test V2 et ouvrir l’interface animateur sur le Mac ?')) return;
    const windowRef = window.open(host, '_blank');
    socket.emit('switch-to-blindtest', tv);
    $('handoff-status').textContent = windowRef ? 'Commande envoyée à la TV. Interface animateur ouverte dans un nouvel onglet.' : 'Commande envoyée à la TV. Autorisez les fenêtres pop-up et ouvrez manuellement le lien animateur.';
  });
})();
