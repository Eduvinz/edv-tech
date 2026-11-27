// Aviso de cookies: la página no usa cookies de publicidad ni analítica, solo almacenamiento necesario.
// Se muestra una vez; al cerrarlo se guarda en el navegador.
(function () {
  var KEY = 'edv-cookies';
  try { if (localStorage.getItem(KEY)) return; } catch (e) { return; }
  var box = document.createElement('div');
  box.className = 'cookie-bar';
  box.setAttribute('role', 'region');
  box.setAttribute('aria-label', 'Aviso de cookies');
  box.innerHTML = '<p><b>Cookies:</b> no usamos cookies de publicidad ni de analítica. Solo guardamos en tu navegador lo necesario para que la página funcione (versión clara u oscura y tus reservas). <a href="terminos.html#cookies">Más información</a></p>' +
    '<button type="button" class="btn btn-acc btn-sm">Entendido</button>';
  box.querySelector('button').addEventListener('click', function () {
    try { localStorage.setItem(KEY, new Date().toISOString()); } catch (e) {}
    box.classList.add('out');
    setTimeout(function () { box.remove(); }, 300);
  });
  document.body.appendChild(box);
})();
