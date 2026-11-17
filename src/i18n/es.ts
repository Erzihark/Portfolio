// Spanish is the main copy. The English file has the same keys.
export default {
  meta: {
    title: 'Manuel Carretero | Tecnología a la medida de tu negocio',
    description:
      'Consultor y desarrollador independiente. Sistemas internos, apps nuevas, mejoras a tu software y experiencias interactivas a la medida de tu negocio.',
    ogDescription: 'Tecnología a la medida de tu negocio, no al revés. Cuéntame qué necesitas.'
  },
  skip: 'Saltar al contenido',
  nav: {
    label: 'Secciones',
    menu: 'Menú',
    services: 'Servicios',
    build: 'Arma tu sistema',
    proof: 'Resultados',
    process: 'Cómo trabajo',
    about: 'Sobre mí',
    contact: 'Escríbeme',
    language: 'Idioma'
  },
  hero: {
    eyebrow: 'Consultor y desarrollador independiente',
    title: 'Tecnología a la medida de tu negocio, no al revés.',
    text: 'Tú me cuentas el problema. Yo encuentro la solución correcta y la construyo: a veces es automatizar, a veces conectar lo que ya usas, a veces una app nueva.',
    primary: 'Cuéntame qué necesitas',
    secondary: 'Ver cómo trabajo',
    points: [
      'Más de 5 años en empresas de EE. UU. y México',
      'Trabajas directamente con quien lo construye',
      'Sin tecnicismos'
    ],
    stageAria: 'Vista 3D de cuatro cosas que puedo construir, una por cada tipo de servicio',
    stageFallback: '3D no disponible',
    stepsLabel: 'Tipos de servicio',
    ctaSay1: 'Escríbeme qué te estorba. Lo hablamos sin tecnicismos.',
    ctaSay2: 'Aquí te cuento cómo trabajo, paso a paso.',
    stageSay: 'Así se arma:'
  },
  services: {
    tag: 'SERVICIOS',
    title: 'Lo que puedo resolver por ti',
    sub: 'Cuatro tipos de trabajo. Cuéntame tu problema y decidimos juntos cuál te conviene.',
    painLabel: 'Te pasa',
    doLabel: 'Lo que hago',
    proofLabel: 'Prueba',
    items: [
      {
        title: 'Sistemas internos y automatización',
        pain: 'Tu equipo pasa el día entre Excel, WhatsApp y papeles, y los pedidos o pendientes se pierden en el camino.',
        does: 'Reúno todo en un solo sistema hecho a tu medida y automatizo las tareas que hoy se repiten a mano.',
        proof: 'En una organización educativa, una sola plataforma reemplazó cuatro herramientas sueltas.',
        say: '¿Tu equipo vive en hojas de cálculo? Lo ordenamos.'
      },
      {
        title: 'Apps y productos nuevos',
        pain: 'Tienes una idea, o quieres que tus clientes compren y reserven desde el celular, y no sabes por dónde empezar.',
        does: 'Te ayudo a definir una primera versión sencilla y la construyo para iOS, Android y web.',
        proof: 'He construido software que mueve dinero real: estados de cuenta, pagos y conexiones con otros sistemas.',
        say: '¿Tienes una idea? Empecemos por lo más simple.'
      },
      {
        title: 'Mejorar software existente',
        pain: 'Tu sistema o tu página es lento, ya está viejo y cada cambio pequeño tarda semanas.',
        does: 'Encuentro dónde se atora, lo acelero y lo actualizo por partes, sin detener tu operación.',
        proof: 'En una empresa de publicidad digital, las páginas pasaron de cargar en unos 3 segundos a unos 0.7.',
        say: '¿Tu sistema va lento? Lo afinamos.'
      },
      {
        title: 'Experiencias interactivas',
        pain: 'Quieres que tu marca destaque y que la gente no solo mire, sino que toque, juegue y recuerde.',
        does: 'Creo contenido interactivo en 2D, 3D y realidad aumentada, y mido cómo lo usa cada visitante.',
        proof: 'Anuncios interactivos con 2D, 3D, realidad aumentada y física, con seguimiento en tiempo real.',
        say: '¿Quieres que tu marca se pueda tocar? Lo hacemos 3D.'
      }
    ],
    noteTag: 'TAMBIÉN OFREZCO',
    noteTitle: 'Conocer mejor a tus clientes para vender más',
    noteText:
      'Te ayudo a ordenar tus datos para ver qué se vende, quién vuelve y qué funciona, y así tomar mejores decisiones.',
    noteSay: 'Si sabes qué les gusta a tus clientes, vendes mejor.'
  },
  build: {
    tag: 'ARMA TU SISTEMA',
    title: 'Arma tu sistema',
    sub: 'Marca lo que te pasa en tu negocio y mira cómo podríamos resolverlo.',
    stageAria: 'Vista 3D de lo que podríamos construir, una parte por cada área',
    stageFallback: '3D no disponible',
    counterNone: 'Sin selección',
    counter: '{n} de 4 áreas en marcha',
    clear: 'Quitar todo',
    resultTag: 'LO QUE PODRÍAMOS CONSTRUIR',
    empty: 'Marca lo que te pasa y aquí verás cómo podríamos ayudarte.',
    send: 'Contarle esto a Manuel',
    greeting: '¡Hola! Cuéntame qué te quita el sueño y lo armamos.',
    removed: 'Listo, lo quito.',
    lines: [
      {
        id: 'ops',
        n: '01',
        title: 'Operación y datos',
        module: 'Panel de tu negocio',
        chips: [
          {
            id: 'ops1',
            label: 'Llevo mi negocio entre Excel, WhatsApp y libretas',
            say: 'Todo junto en un solo lugar. Qué alivio.',
            benefit: 'Todo tu negocio en un solo lugar, sin hojas sueltas.'
          },
          {
            id: 'ops2',
            label: 'Se me pierden pedidos, citas o pendientes',
            say: 'Que nada se te pase: te aviso a tiempo.',
            benefit: 'Cada pedido, cita o pendiente a la vista, con avisos para que nada se quede olvidado.'
          },
          {
            id: 'ops3',
            label: 'Hago a mano las mismas tareas cada semana',
            say: 'Eso lo puede hacer la computadora. Tú atiende a tus clientes.',
            benefit: 'Las tareas que se repiten se hacen solas y tú recuperas tu tiempo.'
          },
          {
            id: 'ops4',
            label: 'Nunca encuentro la información cuando la necesito',
            say: 'Todo ordenado y a un clic de distancia.',
            benefit: 'Cualquier dato, a un clic, justo cuando lo necesitas.'
          }
        ]
      },
      {
        id: 'app',
        n: '02',
        title: 'App o idea nueva',
        module: 'Tu app',
        chips: [
          {
            id: 'app1',
            label: 'Tengo una idea y no sé por dónde empezar',
            say: '¡Una idea! Empecemos por lo más sencillo.',
            benefit: 'Una primera versión sencilla para probar tu idea con personas reales, sin gastar de más.'
          },
          {
            id: 'app2',
            label: 'Quiero que mis clientes compren o reserven en línea',
            say: 'Tu negocio abierto a cualquier hora.',
            benefit: 'Tus clientes compran o reservan en línea, cuando ellos quieran.'
          },
          {
            id: 'app3',
            label: 'Quiero una app para mis clientes o mi equipo',
            say: 'Una app a tu medida, fácil de usar.',
            benefit: 'Una app hecha a la medida de tus clientes o de tu equipo, fácil de usar.'
          }
        ]
      },
      {
        id: 'soft',
        n: '03',
        title: 'Software existente',
        module: 'Tu sistema, mejorado',
        chips: [
          {
            id: 'soft1',
            label: 'Mi página o sistema tarda mucho en cargar',
            say: 'Vamos a ver dónde se atora.',
            benefit: 'Tu página o sistema responde más rápido y nadie se queda esperando.'
          },
          {
            id: 'soft2',
            label: 'Mi sistema es viejo y nadie se atreve a moverle',
            say: 'Se renueva por partes, sin tirar lo que ya funciona.',
            benefit: 'Tu sistema actual se renueva poco a poco, sin detener tu negocio.'
          },
          {
            id: 'soft3',
            label: 'Cada cambio pequeño tarda semanas',
            say: 'Un cambio pequeño no debería ser tan complicado.',
            benefit: 'Los cambios pequeños se hacen con rapidez y sin sustos.'
          }
        ]
      },
      {
        id: 'exp',
        n: '04',
        title: 'Experiencias y datos',
        module: 'Tu marca y tus clientes',
        chips: [
          {
            id: 'exp1',
            label: 'Quiero que mi marca destaque en internet',
            say: '¡Que te vean y se acuerden de ti!',
            benefit: 'Una experiencia en internet que hace que tu marca se vea distinta y se recuerde.'
          },
          {
            id: 'exp2',
            label: 'Quiero conocer mejor a mis clientes para vender más',
            say: 'Si sabes qué les gusta, vendes mejor.',
            benefit: 'Conocer mejor a tus clientes y ver qué es lo que más se vende y qué funciona.'
          }
        ]
      }
    ]
  },
  proof: {
    tag: 'RESULTADOS',
    title: 'Lo que ya he construido',
    sub: 'Más de 5 años haciendo software para empresas de EE. UU. y México. Tres ejemplos, contados por lo que le cambiaron al negocio.',
    items: [
      {
        kind: 'Cliente · Plataforma educativa',
        org: 'WRSI',
        headline: 'Cuatro herramientas sueltas, una sola plataforma',
        text: 'Una plataforma reemplazó Squarespace, Monday.com, Google Drive y WhatsApp. Los consejeros la usan todos los días y ya no hay registros duplicados.',
        facts: [
          '300 usuarios registrados',
          'Una sola base de código para iOS, Android y web',
          'Tres roles: estudiante, consejero y administrador'
        ]
      },
      {
        kind: 'Empresa · Publicidad digital (adtech) · oct 2022 – abr 2026',
        org: 'Evolve Media LLC',
        headline: 'Páginas que cargan unas 4 veces más rápido',
        text: 'De unos 3 segundos a unos 0.7. Además actualicé sistemas viejos (React 16 a 19, Angular 10 a 18) sin detener la operación.',
        facts: [
          'Más de 20 formularios estandarizados y pantallas con más de 1,000 registros',
          'Pruebas automáticas que cuidan lo que ya funcionaba',
          'Anuncios interactivos en 2D, 3D, realidad aumentada y con física, con seguimiento de eventos en tiempo real'
        ]
      },
      {
        kind: 'Empresa · Tecnología financiera (fintech) · jul 2021 – jul 2022',
        org: 'UnDosTres',
        headline: 'Software que maneja dinero de verdad',
        text: 'He construido software que mueve dinero real, en una empresa de tecnología financiera.',
        facts: ['Estados de cuenta', 'Flujos de pago', 'APIs']
      }
    ]
  },
  process: {
    tag: 'CÓMO TRABAJO',
    title: 'Cómo trabajo',
    sub: 'Cuatro pasos, sin sorpresas.',
    steps: [
      {
        title: 'Entender la necesidad',
        text: 'Platicamos de tu negocio y de lo que te estorba. Sin tecnicismos: yo hago las preguntas.'
      },
      {
        title: 'Proponer una solución',
        text: 'Te explico qué haría, qué incluye y cuánto cuesta, con un alcance claro desde el inicio.'
      },
      {
        title: 'Construirla',
        text: 'Construyo por etapas y te voy mostrando avances, para que puedas corregir a tiempo.'
      },
      {
        title: 'Seguir mejorándola',
        text: 'Después del lanzamiento sigo contigo: mantenimiento y mejoras conforme tu negocio crece.'
      }
    ],
    note: 'Cada proyecto tiene un precio y un alcance definidos, y se paga en mensualidades. Después del lanzamiento, el mantenimiento continúa.'
  },
  about: {
    tag: 'SOBRE MÍ',
    title: 'Sobre mí',
    photoAlt: 'Retrato de Manuel Carretero',
    paragraphs: [
      'Soy Manuel Carretero, consultor y desarrollador independiente.',
      'Trabajo solo: hablas directamente con la persona que construye lo que necesitas, sin intermediarios.',
      'Tengo más de 5 años de experiencia en empresas de EE. UU. y México, desde sistemas internos hasta apps y experiencias interactivas.',
      'No soy diseñador gráfico. Lo que entrego son interfaces funcionales y fáciles de usar.'
    ],
    languages: 'Atiendo en español y en inglés.'
  },
  contact: {
    tag: 'CONTACTO',
    title: 'Cuéntame qué necesitas',
    sub: 'Escríbeme con tus palabras, sin tecnicismos. Te respondo yo directamente.',
    emailLabel: 'O escríbeme a',
    email: 'manuelalejandrosac@gmail.com',
    name: 'Nombre',
    mail: 'Correo electrónico',
    message: 'Mensaje',
    submit: 'Enviar mensaje',
    sending: 'Enviando…',
    refresh: 'Actualizar con mi selección',
    errName: 'Escribe tu nombre.',
    errEmail: 'Escribe un correo válido, por ejemplo nombre@correo.com.',
    errMessage: 'Cuéntame un poco lo que necesitas.',
    success: 'Gracias. Recibí tu mensaje y te respondo pronto.',
    error: 'No pude enviar el mensaje. Escríbeme directamente a',
    errorLink: 'manuelalejandrosac@gmail.com',
    messageEmpty: 'Hola Manuel. Me gustaría platicar sobre mi negocio.',
    messageIntro: 'Hola Manuel. Me gustaría resolver esto:',
    mailSubject: 'Quiero platicar sobre mi negocio'
  },
  footer: {
    tagline: 'Tecnología a la medida de tu negocio, no al revés.',
    role: 'Consultor y desarrollador independiente',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    newTab: '(se abre en una pestaña nueva)',
    language: 'Idioma',
    rights: 'Manuel Carretero'
  },
  crocky: {
    label: 'Crocky, la mascota del sitio',
    pet: 'Acariciar a Crocky',
    hide: 'Ocultar a Crocky',
    show: 'Mostrar a Crocky',
    name: 'Crocky',
    greeting: '¡Hola! Soy Crocky. ¿Qué te gustaría resolver?',
    petLines: ['¡Jeje, gracias!', '¡Eso me gusta!'],
    sections: {
      inicio: '¡Hola! Soy Crocky. ¿Qué te gustaría resolver?',
      servicios: 'Cuatro caminos. Dime cuál se parece más a lo tuyo.',
      'arma-tu-sistema': 'Marca lo que te pasa y mira cómo lo armamos.',
      resultados: 'Esto ya lo construyó Manuel. Nada de promesas al aire.',
      'como-trabajo': 'Cuatro pasos y sin sorpresas.',
      'sobre-mi': 'Él es Manuel. Trabaja solo, así que hablas directo con él.',
      contacto: 'Cuéntale qué necesitas. Yo me quedo vigilando.'
    },
    proofSay: 'Un caso real, contado por lo que cambió.',
    stepSay: 'Un paso a la vez.'
  }
};
