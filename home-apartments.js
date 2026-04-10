(function () {
  'use strict';

  var grid = document.getElementById('apartments-catalog');
  if (!grid) return;

  var catalogUrl = new URL('apartments/catalog.json', window.location.href).href;

  function escapeHtml(text) {
    var d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  function cardHtml(slug, data, catalog) {
    var labels = catalog.labels || {};
    var label = labels[slug] || 'Apartamento ' + slug;
    var price = data.cardPrice || '';
    var gallery = data.gallery || [];
    var first = gallery.length ? gallery[0] : 'img/apartment.jpg';
    var imgUrl = 'apartments/' + encodeURIComponent(slug) + '/' + encodeURI(first.replace(/^\//, ''));
    var fichaUrl = 'apartments/' + encodeURIComponent(slug) + '/index.html';

    return (
      '<article class="apartamento-card">' +
      '<div class="apartamento-image" style="background-image: url(&quot;' +
      escapeHtml(imgUrl) +
      '&quot;); background-size: cover; background-position: center;"></div>' +
      '<div class="apartamento-body">' +
      '<h3><a href="' +
      escapeHtml(fichaUrl) +
      '" class="apartamento-title-link">' +
      escapeHtml(label) +
      '</a></h3>' +
      '<p class="apartamento-price">' +
      escapeHtml(price) +
      '</p>' +
      '<p class="apartamento-links">' +
      '<a href="' +
      escapeHtml(fichaUrl) +
      '" class="link-arrow">Ver apartamento</a>' +
      '</p></div></article>'
    );
  }

  grid.setAttribute('role', 'status');
  grid.textContent = 'Cargando alojamientos…';

  fetch(catalogUrl)
    .then(function (r) {
      if (!r.ok) throw new Error('catalog');
      return r.json();
    })
    .then(function (catalog) {
      var slugs = catalog.homeCards || [];
      return Promise.all(
        slugs.map(function (slug) {
          var url = new URL('apartments/' + encodeURIComponent(slug) + '/index.json', window.location.href).href;
          return fetch(url).then(function (r) {
            if (!r.ok) throw new Error(slug);
            return r.json();
          });
        })
      ).then(function (dataList) {
        var html = '';
        for (var i = 0; i < slugs.length; i++) {
          html += cardHtml(slugs[i], dataList[i], catalog);
        }
        grid.removeAttribute('role');
        grid.innerHTML = html;
      });
    })
    .catch(function () {
      grid.innerHTML =
        '<p class="apartamentos-error">No se pudieron cargar los apartamentos. Usa un servidor local (por ejemplo <code>npx serve</code>) y comprueba <code>apartments/catalog.json</code>.</p>';
    });
})();
