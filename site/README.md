# MYTALZ · Landing page

Sitio estático (HTML + CSS + JS sin dependencias). No requiere build: se publica copiando la carpeta `site/` a cualquier hosting estático (Vercel, Netlify, cPanel, etc.).

## Ver en local

```bash
python -m http.server 5173 --directory site
```

Abrir http://localhost:5173

## Estructura

| Archivo | Qué contiene |
|---|---|
| `index.html` | Contenido de la página (prerenderizado, SEO, datos estructurados) |
| `privacidad.html` | Aviso de privacidad (**borrador**, `noindex`) |
| `assets/js/config.js` | **Datos del negocio**: WhatsApp, correos, horario, servicios |
| `assets/js/main.js` | Menú móvil, horario abierto/cerrado, carrusel, proceso animado, formulario |
| `assets/css/styles.css` | Tokens (`:root`) de color, tipografía, espacio y movimiento + estilos |
| `assets/img/` | Fotos optimizadas en 800 px y 1600 px, logo y favicon |

## Cambios frecuentes

- **Teléfono / correos / horario**: edita `assets/js/config.js`. Si cambias el teléfono o correos, actualiza también los enlaces directos en `index.html` (busca `524272902886` y `@gmail.com`) y el bloque JSON-LD del `<head>`.
- **Servicios**: el `id` de cada servicio (p. ej. `troquelado`) debe coincidir en `config.js`, en el `<option value>` del formulario y en el `data-service` del botón que lo preselecciona.
- **Clientes del carrusel**: edita la lista `<ul class="clients-list">` en `index.html`. El carrusel se arma solo a partir de esa lista.
- **Fotos de trabajos (galerías de servicios)**:
  1. Copia las fotos originales a la carpeta `MYTALZ/Fotos-trabajos/`, con nombres como `cnc-01.jpg`, `troquelado-01.jpg`, `soldadura-01.jpg`, `ensamble-01.jpg`.
  2. Ejecuta desde la carpeta `MYTALZ`: `powershell -ExecutionPolicy Bypass -File herramientas\optimizar-fotos.ps1`. Genera `<nombre>-800.jpg` y `<nombre>-1600.jpg` en `site/assets/img/trabajos/`.
  3. Agrega cada foto en `assets/js/config.js` → `gallery`, en el servicio que corresponda: `{ src: "assets/img/trabajos/cnc-01", alt: "Qué se ve en la foto", caption: "Texto opcional" }`.
  - Si una imagen NO es un trabajo real del taller (de banco o generada), agrega `illustrative: true`: aparece la etiqueta «Imagen ilustrativa». Hoy la llevan `troquelados2` y `ensamble1`.
  - Con una sola foto se muestra fija; con dos o más aparecen los controles y la transición «soldada». Si un servicio no tiene fotos, se muestra su esquema técnico.
  - Las fotos actuales de Maquinado CNC y Soldadura son temporales: reemplázalas por las reales.
- **Otras fotos** (hero, visita a planta): guarda versiones de 800 y 1600 px de ancho en `assets/img/` y actualiza `src`, `srcset`, `width` y `height`.
- **Colores**: cambia las variables de `:root` en `styles.css`.

## Cómo funciona el formulario

No hay backend. El visitante llena la orden y elige:

- **Continuar en WhatsApp** → abre `wa.me/524272902886` con el mensaje armado.
- **Enviar por correo** → abre su cliente de correo dirigido a `jojuar4@gmail.com` y `narteaga309@gmail.com`.

En ambos casos el visitante revisa y envía el mensaje; la página no guarda nada.

## Pendientes antes de publicar

1. Dominio definitivo → agregar `canonical`, `og:url`, `og:image` absoluta, `sitemap.xml` y `robots.txt`.
2. Dirección exacta del taller → agregar mapa, «Abrir en Google Maps» y «Cómo llegar».
3. Datos del responsable para el aviso de privacidad y validación legal.
4. Logotipos oficiales de Topre, LG y Brose (con autorización) si se quieren en lugar del nombre en texto.
5. Confirmar que las fotos son del taller; si alguna es de banco de imágenes, identificarla como ilustrativa.
6. Cabeceras de seguridad (CSP, HSTS) según el hosting elegido.
7. Fotos originales de «Piezas maquinadas de precisión» y «Bujes y pernos maquinados» (las del flyer de WhatsApp son demasiado pequeñas para la web). Hoy aparecen como lista en el servicio de Maquinado CNC.
