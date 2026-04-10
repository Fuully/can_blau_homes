(function () {
  'use strict';

  var main = document.getElementById('apartment-main');
  if (!main) return;

  /**
   * Sin barra final (/apartments/formentor), el navegador resuelve mal rutas relativas
   * (p. ej. index.json → /apartments/index.json). Forzamos URL de carpeta con / final.
   */
  function getApartmentDirectoryHref() {
    var u = new URL(window.location.href);
    var p = u.pathname;
    if (p.endsWith('/')) {
      /* ya es directorio */
    } else if (/\.html?$/i.test(p)) {
      p = p.replace(/\/[^/]+$/, '/');
    } else {
      p = p + '/';
    }
    u.pathname = p;
    u.hash = '';
    u.search = '';
    return u.href;
  }

  var dirHref = getApartmentDirectoryHref();
  var jsonUrl = new URL('index.json', dirHref).href;
  var catalogUrl = new URL('../catalog.json', dirHref).href;
  var isFileProtocol = window.location.protocol === 'file:';

  function escapeHtml(text) {
    var d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  /**
   * file:// no puede usar fetch() a JSON de forma fiable: solo datos embebidos.
   * http(s):// intenta fetch primero; si falla, usa window.* cargados por *-embed.js
   */
  function loadFromNetworkOrEmbed(url, globalValue) {
    if (isFileProtocol) {
      if (globalValue != null) {
        return Promise.resolve(globalValue);
      }
      return Promise.reject(new Error('no embed on file'));
    }
    return fetch(url, { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('http');
        return r.json();
      })
      .catch(function () {
        if (globalValue != null) {
          return globalValue;
        }
        throw new Error('no data');
      });
  }

  function loadApartmentData() {
    return loadFromNetworkOrEmbed(jsonUrl, window.APARTMENT_PAGE_DATA);
  }

  function loadCatalogData() {
    return loadFromNetworkOrEmbed(catalogUrl, window.APARTMENTS_CATALOG);
  }

  function buildCarouselHtml(data) {
    var paths = data.gallery && data.gallery.length ? data.gallery : ['img/apartment.jpg'];
    var altMain = data.galleryAlt || 'Apartamento ' + data.name;
    var slides = paths
      .map(function (rel, idx) {
        var src = encodeURI(rel.replace(/^\//, ''));
        var alt = idx === 0 ? escapeHtml(altMain) : '';
        var hidden = idx > 0 ? ' aria-hidden="true"' : '';
        return (
          '<div class="carousel-slide">' +
          '<img src="' +
          src +
          '" alt="' +
          alt +
          '" width="1200" height="750" loading="' +
          (idx === 0 ? 'eager' : 'lazy') +
          '"' +
          hidden +
          ' />' +
          '</div>'
        );
      })
      .join('');

    return (
      '<section class="apartment-carousel-section" aria-labelledby="apartment-title">' +
      '<div class="apartment-carousel" data-carousel role="region" aria-roledescription="carrusel" aria-label="Galería del apartamento">' +
      '<div class="carousel-viewport">' +
      '<div class="carousel-track">' +
      slides +
      '</div></div>' +
      '<div class="carousel-controls">' +
      '<button type="button" class="carousel-btn carousel-btn-prev" data-carousel-prev aria-label="Foto anterior">‹</button>' +
      '<div class="carousel-dots" data-carousel-dots role="tablist" aria-label="Seleccionar foto"></div>' +
      '<button type="button" class="carousel-btn carousel-btn-next" data-carousel-next aria-label="Foto siguiente">›</button>' +
      '</div></div></section>'
    );
  }

  function buildServicesList(items) {
    return items.map(function (item) {
      return '<li>' + escapeHtml(item) + '</li>';
    }).join('');
  }

  function buildSiblings(catalog, currentSlug) {
    var order = catalog.order || [];
    var labels = catalog.labels || {};
    var parts = [
      '<li><a href="../../index.html#terraza">Terraza</a></li>'
    ];
    order.forEach(function (slug) {
      var label = labels[slug] || slug;
      if (slug === currentSlug) {
        parts.push(
          '<li><a href="../' + encodeURIComponent(slug) + '/index.html" aria-current="page">' +
            escapeHtml(label) +
            '</a></li>'
        );
      } else {
        parts.push(
          '<li><a href="../' + encodeURIComponent(slug) + '/index.html">' + escapeHtml(label) + '</a></li>'
        );
      }
    });
    return parts.join('');
  }

  function render(data, catalog) {
    var name = data.name || data.slug;
    document.title = 'Apartamento ' + name + ' – Can Blau Homes';
    var meta = document.querySelector('meta[name="description"]');
    if (meta && data.metaDescription) {
      meta.setAttribute('content', data.metaDescription);
    }

    var introHtml = (data.intro || []).join('');
    var roomList = buildServicesList(data.servicesRoom || []);
    var buildingList = buildServicesList(data.servicesBuilding || []);

    main.innerHTML =
      '<nav class="apartment-breadcrumb container" aria-label="Migas de pan">' +
      '<a href="../../index.html">Inicio</a>' +
      '<span class="apartment-breadcrumb-sep" aria-hidden="true">/</span>' +
      '<a href="../../index.html#alojamientos">Alojamientos</a>' +
      '<span class="apartment-breadcrumb-sep" aria-hidden="true">/</span>' +
      '<span>' +
      escapeHtml(name) +
      '</span></nav>' +
      buildCarouselHtml(data) +
      '<article class="section apartment-detail">' +
      '<div class="container container-text">' +
      '<header class="apartment-header">' +
      '<span class="section-label">Apartamento</span>' +
      '<h1 id="apartment-title">' +
      escapeHtml(name) +
      '</h1>' +
      '<p class="apartment-tagline">' +
      escapeHtml(data.tagline || '') +
      '</p></header>' +
      '<div class="apartment-intro">' +
      introHtml +
      '</div>' +
      '<div class="apartment-body">' +
      (data.bodyHtml || '') +
      '</div>' +
      '<h2 class="apartment-services-title">Servicios de la estancia</h2>' +
      '<div class="apartment-services">' +
      '<div class="apartment-services-block"><h3>Habitación</h3><ul>' +
      roomList +
      '</ul></div>' +
      '<div class="apartment-services-block"><h3>Edificio</h3><ul>' +
      buildingList +
      '</ul></div></div>' +
      (data.extras
        ? '<p class="apartment-extras">' + escapeHtml(data.extras) + '</p>'
        : '') +
      '<div class="apartment-cta">' +
      '<a href="../../index.html#reservas" class="btn btn-primary">Reservar</a>' +
      '<a href="../../index.html#contacto" class="btn btn-outline">Contacto</a>' +
      '</div></div></article>' +
      '<nav class="section apartment-siblings" aria-label="Otros alojamientos">' +
      '<div class="container">' +
      '<h2 class="apartment-siblings-title">Más alojamientos</h2>' +
      '<ul class="apartment-siblings-list">' +
      buildSiblings(catalog, data.slug) +
      '</ul></div></nav>';

    var carouselRoot = main.querySelector('[data-carousel]');
    if (carouselRoot && typeof window.initApartmentCarousel === 'function') {
      window.initApartmentCarousel(carouselRoot);
    }
  }

  main.innerHTML =
    '<p class="apartment-loading" role="status">Cargando apartamento…</p>';

  Promise.all([loadApartmentData(), loadCatalogData()])
    .then(function (results) {
      render(results[0], results[1]);
    })
    .catch(function (err) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[apartment-page]', err && err.message, {
          protocol: location.protocol,
          tieneApartmentEmbed: window.APARTMENT_PAGE_DATA != null,
          tieneCatalogEmbed: window.APARTMENTS_CATALOG != null
        });
      }
      var hint =
        isFileProtocol
          ? ' En <code>file://</code> hace falta <code>../catalog-embed.js</code> y <code>./apartment-embed.js</code> (genera con <code>node sync-apartment-embeds.js</code>).'
          : ' Comprueba que existan los JSON y los <code>*-embed.js</code> en el servidor, o que <code>fetch</code> no devuelva HTML en lugar de JSON.';
      main.innerHTML =
        '<div class="container container-text section"><p>No se pudo cargar la información del apartamento.' +
        hint +
        '</p></div>';
    });
})();
