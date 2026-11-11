/* MYTALZ · Interacciones mínimas: menú, horario, carrusel de clientes,
   trazado del proceso y formulario de cotización (WhatsApp / correo). */
(function () {
  "use strict";

  var CFG = window.MYTALZ;
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  root.classList.remove("no-js");
  root.classList.add("js");
  if (!reduceMotion.matches) root.classList.add("motion");

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Encabezado: borde al desplazar ---------- */
  var header = document.querySelector("[data-header]");
  var hero = document.getElementById("inicio");
  if (header && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle("is-scrolled", entries[0].intersectionRatio < 0.98);
    }, { threshold: [0.98] }).observe(hero);
  }

  /* ---------- Menú móvil (no modal) ---------- */
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    var setMenu = function (open, returnFocus) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector(".sr-only").textContent = open ? "Cerrar menú" : "Menú";
      nav.classList.toggle("is-open", open);
      if (!open && returnFocus) toggle.focus();
    };
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false, true);
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
    window.matchMedia("(min-width: 900px)").addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Horario: abierto / cerrado en la zona del negocio ---------- */
  var statusEl = document.querySelector("[data-hours-status]");
  if (statusEl && CFG) {
    var DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    var toMin = function (hhmm) { var p = hhmm.split(":"); return (+p[0]) * 60 + (+p[1]); };
    var fmt = function (hhmm) {
      var m = toMin(hhmm), h = Math.floor(m / 60), mm = m % 60;
      return (h % 12 || 12) + ":" + String(mm).padStart(2, "0") + (h < 12 ? " a. m." : " p. m.");
    };
    var nowInZone = function () {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: CFG.timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(new Date());
      var get = function (t) { return parts.find(function (p) { return p.type === t; }).value; };
      var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
      return { day: day, min: (+get("hour")) * 60 + (+get("minute")) };
    };
    var updateHours = function () {
      var now = nowInZone();
      var today = CFG.hours[now.day] || [];
      var open = today.find(function (r) { return now.min >= toMin(r[0]) && now.min < toMin(r[1]); });
      if (open) {
        statusEl.textContent = "Abierto ahora · cierra a las " + fmt(open[1]);
        statusEl.className = "hours-status is-open";
      } else {
        // Siguiente apertura: hoy más tarde o en los próximos 7 días
        var next = null;
        for (var i = 0; i < 8 && !next; i++) {
          var d = (now.day + i) % 7;
          var ranges = CFG.hours[d] || [];
          for (var j = 0; j < ranges.length; j++) {
            if (i > 0 || toMin(ranges[j][0]) > now.min) { next = { offset: i, day: d, at: ranges[j][0] }; break; }
          }
        }
        var when = !next ? "" : next.offset === 0 ? "hoy" : next.offset === 1 ? "mañana" : "el " + DAY_NAMES[next.day];
        statusEl.textContent = next ? "Cerrado · abrimos " + when + " a las " + fmt(next.at) : "Cerrado";
        statusEl.className = "hours-status is-closed";
      }
      statusEl.hidden = false;
    };
    updateHours();
    setInterval(updateHours, 60 * 1000);
  }

  /* ---------- Carrusel de clientes (continuo, con pausa) ---------- */
  var marquee = document.querySelector("[data-marquee]");
  var mToggle = document.querySelector("[data-marquee-toggle]");
  if (marquee && mToggle && !reduceMotion.matches) {
    var list = marquee.querySelector("[data-marquee-list]");
    var items = Array.prototype.map.call(list.children, function (li) { return li.textContent; });
    var track = document.createElement("div");
    track.className = "marquee-track";
    track.setAttribute("aria-hidden", "true");
    // Dos mitades idénticas, cada una con suficientes repeticiones para cubrir pantallas anchas
    for (var half = 0; half < 2; half++) {
      var ul = document.createElement("ul");
      for (var rep = 0; rep < 4; rep++) {
        items.forEach(function (name) {
          var li = document.createElement("li");
          li.textContent = name;
          ul.appendChild(li);
        });
      }
      track.appendChild(ul);
    }
    list.classList.add("sr-only");
    marquee.appendChild(track);
    marquee.classList.add("is-animated");
    mToggle.hidden = false;
    var label = mToggle.querySelector("[data-marquee-label]");
    mToggle.addEventListener("click", function () {
      var paused = mToggle.getAttribute("aria-pressed") !== "true";
      mToggle.setAttribute("aria-pressed", String(paused));
      label.textContent = paused ? "Reanudar" : "Pausar";
      marquee.classList.toggle("is-paused", paused);
    });
  }

  /* ---------- Franja del lema: las letras se "construyen" al entrar ---------- */
  var band = document.querySelector("[data-build]");
  if (band && !reduceMotion.matches && "IntersectionObserver" in window) {
    var bandText = band.querySelector(".band-text");
    var full = bandText.textContent.trim();
    var sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = full;
    var visual = document.createElement("span");
    visual.setAttribute("aria-hidden", "true");
    var n = full.replace(/\s/g, "").length, idx = 0;
    full.split(/\s+/).forEach(function (word, w) {
      if (w > 0) visual.appendChild(document.createTextNode(" "));
      var bw = document.createElement("span");
      bw.className = "bw";
      Array.prototype.forEach.call(word, function (c) {
        var ch = document.createElement("span");
        ch.className = "ch";
        ch.textContent = c;
        ch.style.setProperty("--i", idx++);
        bw.appendChild(ch);
      });
      visual.appendChild(bw);
    });
    band.style.setProperty("--n", n);
    bandText.textContent = "";
    bandText.appendChild(sr);
    bandText.appendChild(visual);
    band.classList.add("is-ready");
    var bandIO = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { band.classList.add("is-built"); bandIO.disconnect(); }
    }, { threshold: 0.6 });
    bandIO.observe(band);
  }

  /* ---------- Proceso: avanzar paso a paso "soldando" el cordón ---------- */
  var weld = document.querySelector("[data-weld]");
  if (weld) {
    var wSteps = Array.prototype.slice.call(weld.querySelectorAll(".step"));
    var wMarks = wSteps.map(function (s) { return s.querySelector(".step-mark"); });
    var wTrack = weld.querySelector("[data-weld-track]");
    var wMovers = weld.querySelectorAll("[data-weld-move]");
    var wPrev = weld.querySelector("[data-weld-prev]");
    var wNext = weld.querySelector("[data-weld-next]");
    var wNextLabel = weld.querySelector("[data-weld-next-label]");
    var wStatus = weld.querySelector("[data-weld-status]");
    var current = 0, dists = [], len = 0, vertical = false, timers = [];
    var last = wSteps.length - 1;

    var clearTimers = function () { timers.forEach(clearTimeout); timers = []; };

    var setClasses = function (doneUpTo) {
      wSteps.forEach(function (s, k) {
        s.classList.toggle("is-done", k <= doneUpTo);
        s.classList.toggle("is-current", k === current);
      });
    };

    var setStatus = function () {
      var title = wSteps[current].querySelector("h3").textContent;
      wStatus.innerHTML = "";
      var strong = document.createElement("strong");
      strong.textContent = "Paso " + (current + 1) + " de " + wSteps.length;
      wStatus.appendChild(strong);
      wStatus.appendChild(document.createTextNode(" · " + title));
      wPrev.disabled = current === 0;
      wNextLabel.textContent = current === last ? "Reiniciar" : "Siguiente paso";
    };

    var moveTo = function (i) {
      var off = dists[i] - len;
      var t = vertical ? "translateY(" + off + "px)" : "translateX(" + off + "px)";
      Array.prototype.forEach.call(wMovers, function (m) { m.style.transform = t; });
    };

    var layout = function () {
      var box = weld.getBoundingClientRect();
      var c = wMarks.map(function (m) {
        var r = m.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
      });
      vertical = Math.abs(c[1].y - c[0].y) > Math.abs(c[1].x - c[0].x);
      weld.classList.toggle("is-vertical", vertical);
      var size = 8;
      if (vertical) {
        len = c[last].y - c[0].y;
        Object.assign(wTrack.style, { left: (c[0].x - size / 2) + "px", top: c[0].y + "px", width: size + "px", height: len + "px" });
        dists = c.map(function (p) { return p.y - c[0].y; });
      } else {
        len = c[last].x - c[0].x;
        Object.assign(wTrack.style, { left: c[0].x + "px", top: (c[0].y - size / 2) + "px", width: len + "px", height: size + "px" });
        dists = c.map(function (p) { return p.x - c[0].x; });
      }
      weld.classList.add("no-anim");
      moveTo(current);
      void weld.offsetWidth;
      weld.classList.remove("no-anim");
    };

    var goTo = function (i) {
      if (i === current) return;
      clearTimers();
      var forward = i > current;
      var ms = reduceMotion.matches ? 0 : forward ? 950 * (i - current) : 450;
      weld.style.setProperty("--weld-ms", ms + "ms");
      current = i;
      setStatus();
      if (forward && ms > 0) {
        setClasses(i - 1);
        weld.classList.add("is-welding");
        moveTo(i);
        timers.push(setTimeout(function () {
          weld.classList.remove("is-welding");
          setClasses(i);
          var hot = wSteps[i];
          hot.classList.add("is-hot");
          // Fuera de "timers": el enfriamiento debe terminar aunque se avance otra vez
          setTimeout(function () { hot.classList.remove("is-hot"); }, 1150);
        }, ms));
      } else {
        weld.classList.remove("is-welding");
        wSteps.forEach(function (s) { s.classList.remove("is-hot"); });
        setClasses(i);
        moveTo(i);
      }
    };

    wNext.addEventListener("click", function () { goTo(current === last ? 0 : current + 1); });
    wPrev.addEventListener("click", function () { if (current > 0) goTo(current - 1); });

    weld.classList.add("is-ready");
    weld.querySelector("[data-weld-controls]").hidden = false;
    setClasses(0);
    setStatus();
    layout();
    if ("ResizeObserver" in window) new ResizeObserver(layout).observe(weld);
    else window.addEventListener("resize", layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

    // Primer punto de soldadura al llegar a la sección
    if (!reduceMotion.matches && "IntersectionObserver" in window) {
      var weldIO = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          wSteps[0].classList.add("is-hot");
          setTimeout(function () { wSteps[0].classList.remove("is-hot"); }, 1150);
          weldIO.disconnect();
        }
      }, { threshold: 0.4 });
      weldIO.observe(weld);
    }
  }

/* ---------- Galerías de servicios: la foto nueva entra "soldada" ---------- */
  var SPARKS =
    '<i style="--a:-160deg;--d:30px;--t:0ms"></i><i style="--a:-120deg;--d:24px;--t:90ms"></i>' +
    '<i style="--a:-80deg;--d:34px;--t:180ms"></i><i style="--a:-40deg;--d:26px;--t:40ms"></i>' +
    '<i style="--a:160deg;--d:30px;--t:240ms"></i><i style="--a:120deg;--d:36px;--t:130ms"></i>' +
    '<i style="--a:80deg;--d:26px;--t:300ms"></i><i style="--a:20deg;--d:32px;--t:210ms"></i>';

  Array.prototype.forEach.call(document.querySelectorAll("[data-gallery]"), function (gal) {
    var items = (CFG && CFG.gallery && CFG.gallery[gal.getAttribute("data-gallery")]) || [];
    if (!items.length) return; // sin fotos: se queda el esquema técnico del HTML
    var stage = gal.querySelector(".gallery-stage");
    var label = gal.getAttribute("aria-label") || "Galería";
    var n = items.length, cur = 0, busy = null;
    var MS = reduceMotion.matches ? 0 : 900;

    // Diapositivas: la imagen solo recibe src cuando hace falta (carga diferida real)
    stage.innerHTML = "";
    var slides = items.map(function (it, i) {
      var fig = document.createElement("figure");
      fig.className = "slide" + (i === 0 ? " is-current" : "");
      if (i !== 0) fig.setAttribute("aria-hidden", "true");
      var img = document.createElement("img");
      img.alt = it.alt || "";
      img.decoding = "async";
      img.sizes = "(min-width: 900px) 46vw, 100vw";
      if (it.w && it.h) { img.width = it.w; img.height = it.h; }
      img.dataset.src = it.src + "-800.jpg";
      img.dataset.srcset = it.src + "-800.jpg 800w, " + it.src + "-1600.jpg 1600w";
      fig.appendChild(img);
      if (it.illustrative) {
        img.alt = (it.alt || "") + " (imagen ilustrativa)";
        var badge = document.createElement("span");
        badge.className = "g-badge";
        badge.setAttribute("aria-hidden", "true");
        badge.textContent = "Imagen ilustrativa";
        fig.appendChild(badge);
      }
      if (it.caption) {
        var cap = document.createElement("figcaption");
        cap.textContent = it.caption;
        fig.appendChild(cap);
      }
      stage.appendChild(fig);
      return fig;
    });
    var ensure = function (i) {
      if (i < 0 || i >= n) return Promise.resolve();
      var img = slides[i].querySelector("img");
      if (!img.getAttribute("src")) {
        img.srcset = img.dataset.srcset;
        img.src = img.dataset.src;
      }
      if (img.complete) return Promise.resolve();
      return new Promise(function (res) {
        var done = function () { res(); };
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
        setTimeout(done, 1500);
      });
    };
    ensure(0);
    if (n < 2) return;

    // Costura con antorcha que cruza la foto
    var seam = document.createElement("div");
    seam.className = "g-seam";
    seam.setAttribute("aria-hidden", "true");
    seam.innerHTML = '<span class="g-seam-line"></span><span class="torch-tip">' + SPARKS + "</span>";
    stage.appendChild(seam);

    // Controles: anterior · cordón con un punto por foto · siguiente
    var controls = document.createElement("div");
    controls.className = "g-controls";
    var marks = "";
    for (var k = 0; k < n; k++) {
      marks += '<button type="button" class="g-mark" style="--x:' + (k / (n - 1)) + '" data-g="' + k + '" aria-label="Ver foto ' + (k + 1) + " de " + n + '"><span>' + (k + 1) + "</span></button>";
    }
    controls.innerHTML =
      '<button type="button" class="g-btn" data-g-prev aria-label="Foto anterior"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button>' +
      '<div class="g-track"><span class="g-groove"><span class="g-bead"></span></span>' + marks + "</div>" +
      '<button type="button" class="g-btn" data-g-next aria-label="Foto siguiente"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>';
    gal.appendChild(controls);
    var live = document.createElement("p");
    live.className = "sr-only";
    live.setAttribute("aria-live", "polite");
    gal.appendChild(live);
    var markEls = controls.querySelectorAll(".g-mark");
    gal.style.setProperty("--g-ms", MS + "ms");

    var paint = function (hotIndex) {
      gal.style.setProperty("--p", cur / (n - 1));
      Array.prototype.forEach.call(markEls, function (m, k) {
        m.classList.toggle("is-done", k <= cur);
        m.classList.toggle("is-current", k === cur);
        if (k === cur) m.setAttribute("aria-current", "true"); else m.removeAttribute("aria-current");
      });
      if (hotIndex != null && MS) {
        var hm = markEls[hotIndex];
        hm.classList.remove("is-hot"); void hm.offsetWidth; hm.classList.add("is-hot");
        setTimeout(function () { hm.classList.remove("is-hot"); }, 1150);
      }
      live.textContent = label + ": foto " + (cur + 1) + " de " + n + ". " + (items[cur].alt || "");
    };

    var finish = function () {
      if (!busy) return;
      clearTimeout(busy.timer);
      slides.forEach(function (s, k) {
        s.classList.toggle("is-current", k === busy.to);
        s.classList.remove("is-entering");
        s.style.transition = ""; s.style.clipPath = "";
        if (k === busy.to) s.removeAttribute("aria-hidden"); else s.setAttribute("aria-hidden", "true");
      });
      gal.classList.remove("is-welding");
      seam.style.transition = "none";
      var to = busy.to;
      busy = null;
      paint(to);
      ensure(to + 1);
    };

    var goTo = function (i) {
      i = (i + n) % n;
      if (busy) finish();
      if (i === cur) return;
      var dir = i > cur ? 1 : -1;
      var from = cur;
      cur = i;
      ensure(i).then(function () {
        if (cur !== i) return; // otro clic llegó primero
        gal.style.setProperty("--p", cur / (n - 1)); // el cordón avanza a la par de la costura
        var inc = slides[i];
        busy = { to: i, from: from };
        if (!MS) { finish(); return; }
        inc.style.transition = "none";
        inc.style.clipPath = dir > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)";
        inc.classList.add("is-entering");
        seam.style.transition = "none";
        seam.style.transform = dir > 0 ? "translateX(0%)" : "translateX(100%)";
        void inc.offsetWidth;
        var ease = MS + "ms cubic-bezier(0.35, 0, 0.65, 1)";
        inc.style.transition = "clip-path " + ease;
        seam.style.transition = "transform " + ease;
        gal.classList.add("is-welding");
        inc.style.clipPath = "inset(0 0 0 0)";
        seam.style.transform = dir > 0 ? "translateX(100%)" : "translateX(0%)";
        busy.timer = setTimeout(finish, MS + 30);
      });
    };

    controls.querySelector("[data-g-prev]").addEventListener("click", function () { goTo(cur - 1); });
    controls.querySelector("[data-g-next]").addEventListener("click", function () { goTo(cur + 1); });
    Array.prototype.forEach.call(markEls, function (m) {
      m.addEventListener("click", function () { goTo(+m.getAttribute("data-g")); });
    });

    // Deslizar con el dedo (sin bloquear el desplazamiento vertical)
    var sx = null, sy = null;
    stage.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") { sx = e.clientX; sy = e.clientY; } });
    stage.addEventListener("pointerup", function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      sx = sy = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) goTo(cur + (dx < 0 ? 1 : -1));
    });
    stage.addEventListener("pointercancel", function () { sx = sy = null; });

    gal.classList.add("is-ready");
    paint(null);
    // Precarga la siguiente foto cuando la galería se acerca a la pantalla
    if ("IntersectionObserver" in window) {
      var gio = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { ensure(1); gio.disconnect(); }
      }, { rootMargin: "200px" });
      gio.observe(gal);
    } else { ensure(1); }
  });

/* ---------- Formulario de cotización ---------- */
  var form = document.querySelector("[data-quote-form]");
  if (!form || !CFG) return;

  var fName = form.elements.nombre;
  var fCompany = form.elements.empresa;
  var fService = form.elements.servicio;
  var fDesc = form.elements.descripcion;
  var fVisit = form.elements.visita;
  var statusMsg = form.querySelector("[data-form-status]");
  var counter = form.querySelector("[data-count]");
  var serviceField = form.querySelector("[data-service-field]");

  // Preselección desde los botones de servicio (no borra lo ya escrito)
  document.addEventListener("click", function (e) {
    var link = e.target.closest("[data-service], [data-visit]");
    if (!link) return;
    if (link.hasAttribute("data-service")) {
      var id = link.getAttribute("data-service");
      if (CFG.services[id]) {
        fService.value = id;
        clearError(fService);
        flash(serviceField);
      }
    }
    if (link.hasAttribute("data-visit")) fVisit.checked = true;
  });

  function flash(el) {
    if (reduceMotion.matches || !el) return;
    el.classList.remove("is-flash");
    void el.offsetWidth;
    el.classList.add("is-flash");
  }

  fDesc.addEventListener("input", function () { counter.textContent = String(fDesc.value.length); });

  function errEl(field) { return document.getElementById(field.id + "-err"); }
  function setError(field, msg) {
    var el = errEl(field);
    field.setAttribute("aria-invalid", "true");
    el.textContent = msg;
    el.hidden = false;
  }
  function clearError(field) {
    var el = errEl(field);
    field.removeAttribute("aria-invalid");
    if (el) { el.textContent = ""; el.hidden = true; }
  }
  [fName, fService, fDesc].forEach(function (f) {
    f.addEventListener(f.tagName === "SELECT" ? "change" : "input", function () {
      if (f.getAttribute("aria-invalid") === "true") validateField(f);
    });
  });

  function validateField(f) {
    var v = f.value.trim();
    if (f === fName) {
      if (v.length < 2) { setError(f, "Escribe tu nombre para saber a quién responder."); return false; }
    } else if (f === fService) {
      if (!CFG.services[v]) { setError(f, "Elige un servicio. Si no estás seguro, selecciona «Otro / no estoy seguro»."); return false; }
    } else if (f === fDesc) {
      if (v.length < 10) { setError(f, "Describe brevemente la pieza o el servicio (al menos 10 caracteres)."); return false; }
    }
    clearError(f);
    return true;
  }

  function buildMessage() {
    var lines = [
      "Hola MYTALZ, quiero solicitar una cotización.",
      "",
      "Nombre: " + fName.value.trim()
    ];
    if (fCompany.value.trim()) lines.push("Empresa: " + fCompany.value.trim());
    lines.push("Servicio: " + CFG.services[fService.value]);
    lines.push("Requerimiento: " + fDesc.value.trim());
    if (fVisit.checked) lines.push("Me interesa agendar una visita a planta para el levantamiento.");
    return lines.join("\n");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var via = (e.submitter && e.submitter.value) || "whatsapp";
    statusMsg.textContent = "";
    statusMsg.classList.remove("is-error");

    var ok = [fName, fService, fDesc].map(validateField);
    var firstBad = [fName, fService, fDesc][ok.indexOf(false)];
    if (firstBad) {
      statusMsg.textContent = "Revisa los campos marcados antes de continuar.";
      statusMsg.classList.add("is-error");
      firstBad.focus();
      return;
    }

    var text = buildMessage();
    var url;
    if (via === "email") {
      var subject = "Solicitud de cotización – " + CFG.services[fService.value];
      url = "mailto:" + CFG.emails.join(",") +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(text);
      window.location.href = url;
      statusMsg.textContent = "Abrimos tu aplicación de correo con el mensaje listo. Revísalo y envíalo desde ahí. Si no se abrió, escríbenos a " + CFG.emails.join(" o ") + ".";
    } else {
      url = "https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent(text);
      // Con "noopener" window.open devuelve null siempre; se corta opener a mano
      var win = window.open(url, "_blank");
      if (win) win.opener = null; else window.location.href = url;
      statusMsg.textContent = "Abrimos WhatsApp con tu mensaje. Revísalo y envíalo desde ahí; tus datos siguen aquí por si necesitas volver a intentarlo.";
    }
  });

  // Habilita los envíos solo cuando el JS está listo (evita envíos accidentales)
  form.querySelectorAll("[data-send]").forEach(function (b) { b.disabled = false; });
})();
