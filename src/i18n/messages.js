// All visible text. Keep the English and Spanish keys identical.
const messages = {
  en: {
    meta: {
      title: 'Manuel Carretero | Custom Software for Businesses',
      description:
        'Freelance developer building custom software for businesses: automation, online sales, dashboards, web and mobile apps. Tell me your idea.'
    },
    hint: 'DRAG A PLANET INTO VIEW',
    planets: {
      home: 'Home',
      skills: 'Services',
      projects: 'Work',
      experience: 'Results',
      contact: 'Contact'
    },
    header: {
      role: 'Freelance Developer',
      cta: 'Start a project',
      menu: 'Menu',
      sections: 'Sections',
      language: 'Language',
      switchTo: 'Switch language to English'
    },
    common: {
      close: 'Close',
      startProject: 'Start a project',
      newTab: '(opens in a new tab)'
    },
    home: {
      portraitAlt: 'Portrait of Manuel Carretero',
      availability: 'Open to new projects',
      eyebrow: 'Custom software for businesses',
      titleBefore: 'Grow your business with software ',
      titleHighlight: 'built for you',
      titleAfter: '.',
      description:
        'Do you want to serve more customers, make your team’s work easier or launch a new idea? I design and build digital tools to help you do it. You work with me directly, from the first call to launch.',
      seeWork: 'See my work',
      stats: [
        { value: '+50%', label: 'More sales closed for an education company (WRSI)' },
        { value: '300', label: 'Users registered in the first month' },
        { value: '50%', label: 'Faster client processing' }
      ],
      tagsLabel: 'What I build',
      tags: [
        'Process automation',
        'Online stores & bookings',
        'Dashboards & reports',
        'Web & mobile apps',
        'Speed & maintenance'
      ]
    },
    services: {
      eyebrow: 'What could we do for your business?',
      heading: 'Every business is different. These are some of the possibilities.',
      items: [
        {
          number: '01',
          title: 'Do more with less manual work',
          text: 'Automate repetitive tasks, serve your customers faster, bring all your tools together in one place and create automatic reports, including Excel. For your business problem, I build a custom software solution.'
        },
        {
          number: '02',
          title: 'Open new ways to sell',
          text: 'Online stores, quote calculators, bookings, self-service portals and product showcases. All in one app or website for your business. Your business gets visibility and sales run on their own.'
        },
        {
          number: '03',
          title: 'Make better use of your data',
          text: 'Bring your sales information together and study how your customers behave so you can decide better. You can even offer ad space for extra income. Know your customer so you can sell more.'
        },
        {
          number: '04',
          title: 'Create something new or improve what you have',
          text: 'From a digital idea built from scratch to new features for your existing software, faster systems or interactive experiences, plus maintenance and updates. Keep your business modern and up to date.'
        }
      ],
      noNeedTitle: 'You don’t have to know what software you need',
      noNeedText:
        'Tell me what you want to achieve. Together we decide whether to build something new, improve what you already use or connect your tools.',
      processTitle: 'How we work together',
      steps: [
        { title: 'Talk', text: 'We define your goals, scope and budget on a short call.' },
        {
          title: 'Build',
          text: 'I work in short cycles and show you a working version each time.'
        },
        {
          title: 'Launch',
          text: 'I deploy, hand everything over and stay available for support.'
        }
      ],
      techTitle: 'Technologies I work with',
      tech: [
        'React',
        'Vue',
        'Angular',
        'TypeScript',
        'React Native',
        'Expo',
        'Supabase',
        'Three.js',
        'PHP',
        'Go'
      ],
      cta: 'Not sure what you need? Tell me the problem.'
    },
    work: {
      eyebrow: 'A real example',
      heading: 'Software that changed how a company works.',
      badge: 'Featured · Client project',
      title: 'WRSI',
      subtitle:
        'A platform that unifies the students, documents and follow-up of an education consultancy.',
      problemLabel: 'The problem',
      problem:
        'An education consultancy handled students, documents and follow-up by hand. Information was scattered across Word, Excel, notes and WhatsApp.',
      builtLabel: 'What I built',
      built: [
        'One platform that unifies all of the company’s information',
        'Students register on their own and counselors follow up on each one',
        'Staff tools for statuses, filters and custom fields, with separate access for students, counselors, admins, schools and universities',
        'University and program catalog with CSV import and export',
        'Fairs and events with pre-registration, workshop schedules and poster uploads',
        'Available in English and Spanish, on web and mobile'
      ],
      resultsLabel: 'Results',
      results: [
        { value: '300', label: 'Users registered in one month' },
        { value: '+50%', label: 'More sales closed' },
        { value: '50%', label: 'Faster client processing' }
      ],
      stackLabel: 'WRSI technologies',
      stack: ['React Native', 'Expo', 'TypeScript', 'Supabase', 'Monorepo', 'E2E tests'],
      liveSite: 'Visit live site',
      moreTitle: 'Interactive experiments',
      moreText: 'Smaller projects that show how I handle animation, state and rendering.',
      experiments: [
        {
          title: '2048 Clone',
          stack: 'JavaScript · Vue · Game logic',
          text: 'The classic puzzle with smooth tile animations, score tracking and keyboard controls.'
        },
        {
          title: 'Memory Card Game',
          stack: 'Vue · CSS animations · UX',
          text: 'A card-matching game with animated flips and a layout that works on any screen size.'
        },
        {
          title: 'Sorting Visualizer',
          stack: 'Algorithms · Visualization · JavaScript',
          text: 'Animated comparisons of classic sorting algorithms with adjustable speed.'
        }
      ],
      liveDemo: 'Live demo',
      github: 'GitHub',
      ctaText: 'Have a project like this in mind?'
    },
    results: {
      eyebrow: 'Track record',
      heading: '5+ years building software that companies rely on.',
      outcomes: [
        {
          value: '~3s → ~0.7s',
          label: 'Page load time',
          text: 'Cut the main loading time of a production app, with peaks from 5s down to 1s, by improving rendering, data loading and bundling.'
        },
        {
          value: '20+',
          label: 'Forms standardized',
          text: 'Moved more than 20 forms to one shared, type-safe system. Changes are faster and bugs are fewer.'
        },
        {
          value: '1,000+',
          label: 'Records handled smoothly',
          text: 'Built data-heavy screens with filters, search and multi-step workflows that stay fast with over a thousand entries.'
        },
        {
          value: '2D · 3D · AR',
          label: 'Interactive ads',
          text: 'Built multiplatform interactive ad experiences with real-time event tracking for analytics.'
        }
      ],
      alsoTitle: 'Also',
      also: [
        'Test suites (Cypress, Playwright) that cut production bugs and make big changes safe',
        'Upgrades of large apps from React 16 to 19 and Angular 10 to 18',
        'Clear API documentation that helps frontend and backend teams work together'
      ],
      backgroundTitle: 'Where I have worked',
      roles: [
        {
          role: 'Front End Engineer',
          company: 'Evolve Media LLC · Remote',
          date: 'Oct 2022 – Apr 2026',
          text: 'Performance, architecture and interactive ad experiences for a media company.'
        },
        {
          role: 'Software Engineer',
          company: 'UnDosTres · Remote',
          date: 'Jul 2021 – Jul 2022',
          text: 'Statements, payment flows and APIs for credit card services (PHP, Go, Kotlin).'
        }
      ],
      cta: 'Want results like these for your business?'
    },
    contact: {
      heading: 'What would you like to achieve in your business?',
      sub: 'Tell me your idea, even if you don’t know yet what system you need. We talk through the options and how I can help.',
      direct: 'Prefer to write directly?',
      name: 'Your name',
      email: 'Email',
      topic: 'What do you need?',
      topicPlaceholder: 'Choose an option',
      topics: [
        { value: 'automate', label: 'Automate manual work' },
        { value: 'sell', label: 'Sell online or take bookings' },
        { value: 'data', label: 'Use my data better' },
        { value: 'build', label: 'Build something new or improve my software' },
        { value: 'unsure', label: 'I’m not sure yet' }
      ],
      message: 'Tell me about your idea',
      submit: 'Send message',
      sending: 'Sending…',
      success: 'Thank you! I received your message and I will reply by email.',
      error: 'The message could not be sent. Please write to me directly at',
      required: 'Required',
      linkedin: 'LinkedIn (opens in a new tab)',
      github: 'GitHub (opens in a new tab)',
      instagram: 'Instagram (opens in a new tab)'
    }
  },

  es: {
    meta: {
      title: 'Manuel Carretero | Software a medida para negocios',
      description:
        'Desarrollador freelance: software a medida para negocios. Automatización, ventas en línea, reportes, apps web y móviles. Cuéntame tu idea.'
    },
    hint: 'ARRASTRA UN PLANETA A LA VISTA',
    planets: {
      home: 'Inicio',
      skills: 'Servicios',
      projects: 'Proyectos',
      experience: 'Resultados',
      contact: 'Contacto'
    },
    header: {
      role: 'Desarrollador freelance',
      cta: 'Inicia tu proyecto',
      menu: 'Menú',
      sections: 'Secciones',
      language: 'Idioma',
      switchTo: 'Cambiar idioma a español'
    },
    common: {
      close: 'Cerrar',
      startProject: 'Inicia tu proyecto',
      newTab: '(se abre en una pestaña nueva)'
    },
    home: {
      portraitAlt: 'Retrato de Manuel Carretero',
      availability: 'Disponible para nuevos proyectos',
      eyebrow: 'Desarrollo de software a medida para negocios',
      titleBefore: 'Haz crecer tu negocio con software ',
      titleHighlight: 'hecho para ti',
      titleAfter: '.',
      description:
        '¿Quieres atender a más clientes, facilitar el trabajo de tu equipo o lanzar una nueva idea? Diseño y desarrollo herramientas digitales para ayudarte a lograrlo. Trabajas conmigo directamente, desde la primera llamada hasta el lanzamiento.',
      seeWork: 'Ver mi trabajo',
      stats: [
        { value: '+50%', label: 'Más ventas concretadas para una empresa de asesoría (WRSI)' },
        { value: '300', label: 'Usuarios registrados en el primer mes' },
        { value: '50%', label: 'Más rápido procesar clientes' }
      ],
      tagsLabel: 'Qué construyo',
      tags: [
        'Automatización de procesos',
        'Tiendas en línea y reservas',
        'Paneles y reportes',
        'Apps web y móviles',
        'Velocidad y mantenimiento'
      ]
    },
    services: {
      eyebrow: '¿Qué podríamos hacer por tu negocio?',
      heading: 'Cada negocio es distinto. Estas son algunas de las posibilidades.',
      items: [
        {
          number: '01',
          title: 'Haz más con menos trabajo manual',
          text: 'Automatiza tareas repetitivas, atiende a tus clientes más rápido, unifica todas tus herramientas en un mismo lugar y genera reportes automáticos, incluso en Excel. Para tu problema de negocio, te presento una solución de software personalizada.'
        },
        {
          number: '02',
          title: 'Abre nuevas formas de vender',
          text: 'Tiendas en línea, cotizadores, reservas, portales de autoservicio y muestrarios de productos. Todo en una app o sitio web para tu negocio. Tu negocio gana visibilidad y las ventas se automatizan.'
        },
        {
          number: '03',
          title: 'Aprovecha mejor tus datos',
          text: 'Reúne la información de tus ventas y analiza el comportamiento de tus clientes para tomar mejores decisiones. Incluso puedes ofrecer espacio publicitario para ingresos extra. Conoce a tu cliente para poder vender más.'
        },
        {
          number: '04',
          title: 'Crea algo nuevo o mejora lo que tienes',
          text: 'Desde una idea digital hecha desde cero hasta nuevas funciones para tu software existente, sistemas más rápidos o experiencias interactivas, además de mantenimiento y actualizaciones. Mantén tu negocio moderno y al día.'
        }
      ],
      noNeedTitle: 'No tienes que saber qué software necesitas',
      noNeedText:
        'Tú me cuentas qué quieres lograr. Juntos vemos si crear algo nuevo, mejorar lo que ya usas o conectar tus herramientas.',
      processTitle: 'Cómo trabajamos juntos',
      steps: [
        {
          title: 'Platicamos',
          text: 'Definimos tus objetivos, el alcance y el presupuesto en una llamada corta.'
        },
        {
          title: 'Construyo',
          text: 'Trabajo en ciclos cortos y te muestro una versión funcional cada vez.'
        },
        {
          title: 'Lanzamos',
          text: 'Publico el sistema, te entrego todo y sigo disponible para dar soporte.'
        }
      ],
      techTitle: 'Tecnologías con las que trabajo',
      tech: [
        'React',
        'Vue',
        'Angular',
        'TypeScript',
        'React Native',
        'Expo',
        'Supabase',
        'Three.js',
        'PHP',
        'Go'
      ],
      cta: '¿No sabes qué necesitas? Cuéntame el problema.'
    },
    work: {
      eyebrow: 'Un ejemplo real',
      heading: 'Software que cambió la forma de trabajar de una empresa.',
      badge: 'Destacado · Proyecto para cliente',
      title: 'WRSI',
      subtitle:
        'Una plataforma que unifica a los alumnos, documentos y seguimiento de una empresa de asesoría educativa.',
      problemLabel: 'El problema',
      problem:
        'Una empresa de asesoría educativa manejaba alumnos, documentos y seguimiento de forma manual. La información estaba esparcida en Word, Excel, notas y WhatsApp.',
      builtLabel: 'Lo que construí',
      built: [
        'Una sola plataforma que unifica toda la información de la empresa',
        'Los estudiantes se registran por su cuenta y los consejeros les dan seguimiento',
        'Herramientas para el equipo: estatus, filtros y campos personalizados, con acceso separado para estudiantes, consejeros, administradores, escuelas y universidades',
        'Catálogo de universidades y programas con importación y exportación CSV',
        'Ferias y eventos con preregistro, horarios de talleres y carga de carteles',
        'Disponible en español e inglés, en web y móvil'
      ],
      resultsLabel: 'Resultados',
      results: [
        { value: '300', label: 'Usuarios registrados en un mes' },
        { value: '+50%', label: 'Más ventas concretadas' },
        { value: '50%', label: 'Más rápido procesar clientes' }
      ],
      stackLabel: 'Tecnologías de WRSI',
      stack: ['React Native', 'Expo', 'TypeScript', 'Supabase', 'Monorepo', 'Pruebas E2E'],
      liveSite: 'Visitar el sitio',
      moreTitle: 'Experimentos interactivos',
      moreText: 'Proyectos pequeños que muestran cómo manejo animación, estado y renderizado.',
      experiments: [
        {
          title: 'Clon de 2048',
          stack: 'JavaScript · Vue · Lógica de juego',
          text: 'El clásico rompecabezas con animaciones fluidas, puntuación y control con teclado.'
        },
        {
          title: 'Juego de memoria',
          stack: 'Vue · Animaciones CSS · UX',
          text: 'Un juego de parejas de cartas con volteos animados y un diseño que se adapta a cualquier pantalla.'
        },
        {
          title: 'Visualizador de ordenamiento',
          stack: 'Algoritmos · Visualización · JavaScript',
          text: 'Comparaciones animadas de algoritmos de ordenamiento clásicos con velocidad ajustable.'
        }
      ],
      liveDemo: 'Ver demo',
      github: 'GitHub',
      ctaText: '¿Tienes en mente un proyecto como este?'
    },
    results: {
      eyebrow: 'Trayectoria',
      heading: 'Más de 5 años creando software en el que las empresas confían.',
      outcomes: [
        {
          value: '~3s → ~0.7s',
          label: 'Tiempo de carga',
          text: 'Reduje el tiempo de carga principal de una app en producción, con picos de 5s a 1s, al mejorar el renderizado, la carga de datos y el empaquetado.'
        },
        {
          value: '20+',
          label: 'Formularios estandarizados',
          text: 'Moví más de 20 formularios a un sistema compartido y con tipos seguros. Los cambios son más rápidos y hay menos errores.'
        },
        {
          value: '1,000+',
          label: 'Registros manejados con fluidez',
          text: 'Construí pantallas con muchos datos, filtros, búsqueda y flujos de varios pasos que siguen siendo rápidos con más de mil registros.'
        },
        {
          value: '2D · 3D · AR',
          label: 'Anuncios interactivos',
          text: 'Desarrollé anuncios interactivos multiplataforma con seguimiento de eventos en tiempo real para analítica.'
        }
      ],
      alsoTitle: 'También',
      also: [
        'Pruebas automatizadas (Cypress, Playwright) que reducen errores en producción y hacen seguros los cambios grandes',
        'Actualización de apps grandes de React 16 a 19 y de Angular 10 a 18',
        'Documentación clara de APIs que ayuda a que frontend y backend trabajen juntos'
      ],
      backgroundTitle: 'Dónde he trabajado',
      roles: [
        {
          role: 'Ingeniero Front End',
          company: 'Evolve Media LLC · Remoto',
          date: 'Oct 2022 – Abr 2026',
          text: 'Rendimiento, arquitectura y anuncios interactivos para una empresa de medios.'
        },
        {
          role: 'Ingeniero de Software',
          company: 'UnDosTres · Remoto',
          date: 'Jul 2021 – Jul 2022',
          text: 'Estados de cuenta, flujos de pago y APIs para servicios de tarjetas de crédito (PHP, Go, Kotlin).'
        }
      ],
      cta: '¿Quieres resultados como estos para tu negocio?'
    },
    contact: {
      heading: '¿Qué te gustaría lograr en tu negocio?',
      sub: 'Cuéntame tu idea, aunque todavía no sepas qué sistema necesitas. Platicamos de opciones y de cómo podría ayudarte.',
      direct: '¿Prefieres escribirme directamente?',
      name: 'Tu nombre',
      email: 'Correo electrónico',
      topic: '¿Qué necesitas?',
      topicPlaceholder: 'Elige una opción',
      topics: [
        { value: 'automate', label: 'Automatizar trabajo manual' },
        { value: 'sell', label: 'Vender en línea o recibir reservas' },
        { value: 'data', label: 'Aprovechar mejor mis datos' },
        { value: 'build', label: 'Crear algo nuevo o mejorar mi software' },
        { value: 'unsure', label: 'Todavía no estoy seguro' }
      ],
      message: 'Cuéntame tu idea',
      submit: 'Enviar mensaje',
      sending: 'Enviando…',
      success: '¡Gracias! Recibí tu mensaje y te responderé por correo.',
      error: 'No se pudo enviar el mensaje. Por favor escríbeme directamente a',
      required: 'Obligatorio',
      linkedin: 'LinkedIn (se abre en una pestaña nueva)',
      github: 'GitHub (se abre en una pestaña nueva)',
      instagram: 'Instagram (se abre en una pestaña nueva)'
    }
  }
};

export default messages;
