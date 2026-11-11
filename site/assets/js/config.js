/*
 * MYTALZ · Datos del negocio
 * ---------------------------------------------------------------
 * Edita aquí teléfono, correos, horario y servicios. El HTML usa
 * los mismos identificadores (data-service="...") para preseleccionar
 * el servicio en el formulario de cotización.
 */
window.MYTALZ = Object.freeze({
  name: "MYTALZ Maquinado y Troquelado",

  // WhatsApp: solo dígitos, con código de país (52 = México)
  whatsapp: "524272902886",
  whatsappDisplay: "+52 427 290 2886",

  // Correos para solicitar cotización (el mensaje se abre en el cliente de correo del visitante)
  emails: ["jojuar4@gmail.com", "narteaga309@gmail.com"],

  city: "San Juan del Río, Querétaro",
  timeZone: "America/Mexico_City",

  // Horario por día (0 = domingo … 6 = sábado). null = cerrado.
  // Puedes usar varios tramos por día: [["09:00","14:00"],["16:00","19:00"]]
  hours: {
    0: null,
    1: [["09:00", "18:00"]],
    2: [["09:00", "18:00"]],
    3: [["09:00", "18:00"]],
    4: [["09:00", "18:00"]],
    5: [["09:00", "18:00"]],
    6: [["09:00", "18:00"]]
  },

  // id estable → nombre visible (usado en el formulario y los mensajes)
  services: {
    "maquinado-cnc": "Maquinado CNC",
    "troquelado": "Troquelado",
    "soldadura-electrica": "Soldadura eléctrica",
    "soldadura-microalambre": "Soldadura con microalambre",
    "soldadura-tig": "Soldadura TIG con argón",
    "fabricacion-ensambles": "Fabricación y ensambles",
    "otro": "Otro / no estoy seguro"
  },

  /*
   * Galerías de trabajos por servicio.
   * - src: ruta SIN el sufijo de tamaño. Deben existir "<src>-800.jpg" y "<src>-1600.jpg"
   *   (el script herramientas/optimizar-fotos.ps1 las genera en assets/img/trabajos/).
   * - alt: qué se ve en la foto (obligatorio, para accesibilidad y SEO).
   * - caption: texto opcional que aparece sobre la foto.
   * - w / h: proporción original de la foto (ancho / alto), opcional.
   * - illustrative: true si NO es un trabajo real del taller (imagen de banco o generada);
   *   muestra la etiqueta «Imagen ilustrativa».
   * Si un servicio no tiene fotos, se muestra su esquema técnico.
   */
  gallery: {
    "maquinado-cnc": [
      { src: "assets/img/img2", alt: "Centro de maquinado CNC con fresa trabajando una cavidad en una placa de aluminio" },
      { src: "assets/img/hero", alt: "Fresa de planear CNC maquinando una pieza de acero sujeta en prensa" },
      { src: "assets/img/img1", alt: "Torno cortando una pieza de metal con viruta en espiral" }
    ],
    "troquelado": [
      { src: "assets/img/trabajos/troquelados1", alt: "Troquel progresivo con piezas de lámina troqueladas en la tira" },
      { src: "assets/img/trabajos/troquelados2", alt: "Lote de soportes de lámina troquelados y doblados, apilados sobre la mesa", illustrative: true }
    ],
    "soldadura": [
      { src: "assets/img/welding1", alt: "Soldador aplicando soldadura TIG con varilla de aporte sobre una pieza curva" },
      { src: "assets/img/trabajos/soldadura1", alt: "Esmerilado de una estructura metálica soldada, con chispas" }
    ],
    "fabricacion-ensambles": [
      { src: "assets/img/trabajos/ensamble1", alt: "Herramental de ensamble con bloques maquinados, pernos guía y sensores", illustrative: true },
      { src: "assets/img/trabajos/ensamble2", alt: "Pieza maquinada de ensamble sostenida en la mano" }
    ]
  }
});
