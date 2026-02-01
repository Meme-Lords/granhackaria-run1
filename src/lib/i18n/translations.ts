export type Locale = "en" | "es";

export const translations = {
  en: {
    // Header
    nav: {
      events: "Events",
      about: "About",
    },

    // Hero
    hero: {
      location: "Las Palmas de Gran Canaria",
      title: "Discover Local Events",
      subtitle:
        "Find concerts, exhibitions, workshops and more happening in your city",
    },

    // Event sections
    sections: {
      today: "Today",
      tomorrow: "Tomorrow",
      thisWeek: "This Week",
      viewAll: "View all →",
      noEvents: "No events scheduled",
    },

    event: {
      viewOriginal: "View Original",
      close: "Close",
      loading: "Loading…",
    },

    // Categories
    categories: {
      music: "Music",
      arts: "Arts",
      food: "Food",
      sports: "Sports",
      festival: "Festival",
      theater: "Theater",
      workshop: "Workshop",
      market: "Market",
    },

    // Footer
    footer: {
      copyright: "© 2026 EventosGC. All rights reserved.",
      privacy: "Privacy",
      terms: "Terms",
      contact: "Contact",
    },

    // About page
    about: {
      heroTitle: "Helping You Feel at Home in Gran Canaria",
      heroSubtitle:
        "EventosGC is built by remote workers and digital nomads who landed in Las Palmas and wanted to do more than just work from cafés. From jazz nights at the Alfredo Kraus Auditorium to tapas festivals in Vegueta, we help you find experiences that turn a new city into home.",
      stats: {
        eventsListed: "Events Listed",
        partnerVenues: "Partner Venues",
        countriesRepresented: "Countries Represented",
        founded: "Founded",
      },
      whatWeDo: "What We Do",
      features: {
        curatedEvents: {
          title: "Curated Events",
          description:
            "We handpick the best concerts, exhibitions, workshops, and festivals happening across the island.",
        },
        localDiscovery: {
          title: "Local Discovery",
          description:
            "From Vegueta's historic plazas to Las Canteras beachfront venues, discover events in every corner of the city.",
        },
        communityDriven: {
          title: "Community Driven",
          description:
            "Built by remote workers who fell in love with Gran Canaria. We know what it's like to arrive somewhere new and want to connect.",
        },
      },
      ourStory: "Our Story",
      storyParagraphs: [
        "EventosGC started at a coworking space in Las Palmas. A group of us—remote workers and digital nomads from different corners of the world—kept having the same conversation: \"Did you hear about that concert last week?\" Always last week. Always too late.",
        "In 2026, we decided to fix that. We built EventosGC to be the guide we wished we had when we first arrived. Not just a calendar, but a way to actually connect with the island—its music, food, art, and people.",
        "We're not locals, but Gran Canaria has become home. And we want to help others—whether you're here for a month or a decade—feel the same way.",
      ],
      values: {
        passionForDiscovery: {
          title: "Passion for Discovery",
          description:
            "We believe the best way to experience a new place is through its culture, music, and people.",
        },
        qualityFirst: {
          title: "Quality First",
          description:
            "Every event is verified to ensure you have accurate information and a great experience.",
        },
        builtForEveryone: {
          title: "Built for Everyone",
          description:
            "Whether you're a digital nomad, expat, tourist, or local—we help you find your community.",
        },
      },
      cta: {
        title: "Ready to Explore?",
        subtitle:
          "Close the laptop, step outside, and discover what's happening in Las Palmas today. Your next favorite memory is just a click away.",
        button: "Browse Events",
      },
    },

    // Privacy page
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: January 2026",
      sections: {
        introduction: {
          title: "Introduction",
          content: [
            'EventosGC ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our website and services.',
            "We're a small team of remote workers who built this platform to help people discover events in Las Palmas de Gran Canaria. We only collect what we need and we don't sell your data. Simple as that.",
          ],
        },
        informationCollected: {
          title: "Information We Collect",
          youProvide: "Information you provide",
          youProvideItems: [
            "Account information (email, name) when you sign up",
            "Event preferences and saved events",
            "Communications when you contact us",
          ],
          automatic: "Information collected automatically",
          automaticItems: [
            "Device information (browser type, operating system)",
            "Usage data (pages visited, time spent)",
            "Location data (city-level, only with your permission)",
          ],
        },
        howWeUse: {
          title: "How We Use Your Information",
          items: [
            "To provide and improve our event discovery services",
            "To personalize your experience and show relevant events",
            "To send event reminders and updates (if you opt in)",
            "To respond to your questions and support requests",
            "To analyze usage patterns and improve our platform",
          ],
        },
        dataSharing: {
          title: "Data Sharing",
          content: "We do not sell your personal information. We may share data with:",
          items: [
            "Service providers who help us run our platform (hosting, analytics)",
            "Event organizers, only if you explicitly RSVP or register",
            "Legal authorities if required by law",
          ],
        },
        cookies: {
          title: "Cookies",
          content:
            "We use cookies to keep you logged in, remember your preferences, and understand how people use our site. You can disable cookies in your browser settings, but some features may not work properly.",
        },
        yourRights: {
          title: "Your Rights",
          content: "Under GDPR and other privacy laws, you have the right to:",
          items: [
            "Access your personal data",
            "Correct inaccurate data",
            "Request deletion of your data",
            "Export your data in a portable format",
            "Withdraw consent at any time",
          ],
          contact: "To exercise any of these rights, email us at privacy@eventosgc.com.",
        },
        dataSecurity: {
          title: "Data Security",
          content:
            "We use industry-standard security measures to protect your data, including encryption in transit (HTTPS) and at rest. However, no system is 100% secure, so we encourage you to use strong passwords and be cautious online.",
        },
        dataRetention: {
          title: "Data Retention",
          content:
            "We keep your data for as long as you have an account with us. If you delete your account, we'll remove your personal data within 30 days, except where we're required to keep it for legal reasons.",
        },
        changes: {
          title: "Changes to This Policy",
          content:
            "We may update this policy from time to time. We'll notify you of significant changes by email or through a notice on our website.",
        },
        contactUs: {
          title: "Contact Us",
          content:
            "Questions about this privacy policy? Reach out to us at privacy@eventosgc.com or find us at one of the coworking spaces in Las Palmas—we're usually the ones asking about weekend events.",
        },
      },
    },

    // Terms page
    terms: {
      title: "Terms of Service",
      lastUpdated: "Last updated: January 2026",
      sections: {
        agreement: {
          title: "Agreement to Terms",
          content: [
            "By accessing or using EventosGC, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our service.",
            "We've tried to keep these terms readable and fair. If something doesn't make sense, reach out and we'll explain.",
          ],
        },
        whatWeProvide: {
          title: "What We Provide",
          content: [
            "EventosGC is an event discovery platform for Las Palmas de Gran Canaria. We aggregate and display information about local events including concerts, exhibitions, workshops, festivals, and other activities.",
            "We are not the organizers of these events. We provide information to help you discover what's happening, but the events themselves are run by third parties.",
          ],
        },
        userAccounts: {
          title: "User Accounts",
          content: "To access certain features, you may need to create an account. When you do:",
          items: [
            "Provide accurate and complete information",
            "Keep your password secure and confidential",
            "Notify us immediately of any unauthorized access",
            "You're responsible for all activity under your account",
          ],
          ageRequirement: "You must be at least 16 years old to create an account.",
        },
        acceptableUse: {
          title: "Acceptable Use",
          content: "You agree not to:",
          items: [
            "Use the service for any illegal purpose",
            "Post false, misleading, or spam content",
            "Scrape or harvest data without permission",
            "Attempt to gain unauthorized access to our systems",
            "Interfere with other users' enjoyment of the service",
            "Impersonate others or misrepresent your affiliation",
          ],
        },
        eventInformation: {
          title: "Event Information",
          content: [
            "We strive to provide accurate event information, but we can't guarantee that all details are correct or up-to-date. Events may be cancelled, rescheduled, or changed without notice by the organizers.",
            "Always verify important details (time, location, tickets) with the event organizer before attending. We are not responsible for inaccurate information or changes made by event organizers.",
          ],
        },
        intellectualProperty: {
          title: "Intellectual Property",
          content: [
            "The EventosGC name, logo, and original content are owned by us. You may not use our branding without permission.",
            "Event information, images, and descriptions may be owned by the respective event organizers and venues. We display this content under fair use or with permission.",
          ],
        },
        thirdPartyLinks: {
          title: "Third-Party Links",
          content:
            "Our service may contain links to third-party websites or services (ticketing platforms, venue websites, etc.). We are not responsible for the content or practices of these external sites.",
        },
        liability: {
          title: "Limitation of Liability",
          content: [
            'EventosGC is provided "as is" without warranties of any kind. To the fullest extent permitted by law, we disclaim all warranties, express or implied.',
            "We are not liable for any damages arising from your use of the service, including but not limited to: missed events, incorrect information, or issues with third-party event organizers.",
          ],
        },
        termination: {
          title: "Termination",
          content:
            "We may suspend or terminate your account at any time for violations of these terms or for any other reason at our discretion. You may also delete your account at any time through your account settings.",
        },
        changes: {
          title: "Changes to Terms",
          content:
            "We may update these terms from time to time. We'll notify you of significant changes by email or through a notice on our website. Continued use of the service after changes constitutes acceptance of the new terms.",
        },
        governingLaw: {
          title: "Governing Law",
          content:
            "These terms are governed by the laws of Spain. Any disputes will be resolved in the courts of Las Palmas de Gran Canaria.",
        },
        contactUs: {
          title: "Contact Us",
          content:
            "Questions about these terms? Reach out at legal@eventosgc.com. We're real people and we're happy to clarify anything.",
        },
      },
    },
  },

  es: {
    // Header
    nav: {
      events: "Eventos",
      about: "Nosotros",
    },

    // Hero
    hero: {
      location: "Las Palmas de Gran Canaria",
      title: "Descubre Eventos Locales",
      subtitle:
        "Encuentra conciertos, exposiciones, talleres y más en tu ciudad",
    },

    // Event sections
    sections: {
      today: "Hoy",
      tomorrow: "Mañana",
      thisWeek: "Esta Semana",
      viewAll: "Ver todos →",
      noEvents: "No hay eventos programados",
    },

    event: {
      viewOriginal: "Ver original",
      close: "Cerrar",
      loading: "Cargando…",
    },

    // Categories
    categories: {
      music: "Música",
      arts: "Arte",
      food: "Gastronomía",
      sports: "Deportes",
      festival: "Festival",
      theater: "Teatro",
      workshop: "Taller",
      market: "Mercado",
    },

    // Footer
    footer: {
      copyright: "© 2026 EventosGC. Todos los derechos reservados.",
      privacy: "Privacidad",
      terms: "Términos",
      contact: "Contacto",
    },

    // About page
    about: {
      heroTitle: "Ayudándote a Sentirte en Casa en Gran Canaria",
      heroSubtitle:
        "EventosGC está creado por trabajadores remotos y nómadas digitales que llegaron a Las Palmas y querían hacer algo más que trabajar desde cafeterías. Desde noches de jazz en el Auditorio Alfredo Kraus hasta festivales de tapas en Vegueta, te ayudamos a encontrar experiencias que convierten una nueva ciudad en hogar.",
      stats: {
        eventsListed: "Eventos Listados",
        partnerVenues: "Lugares Asociados",
        countriesRepresented: "Países Representados",
        founded: "Fundado",
      },
      whatWeDo: "Lo Que Hacemos",
      features: {
        curatedEvents: {
          title: "Eventos Seleccionados",
          description:
            "Seleccionamos los mejores conciertos, exposiciones, talleres y festivales de toda la isla.",
        },
        localDiscovery: {
          title: "Descubrimiento Local",
          description:
            "Desde las plazas históricas de Vegueta hasta los locales frente a la playa de Las Canteras, descubre eventos en cada rincón de la ciudad.",
        },
        communityDriven: {
          title: "Impulsado por la Comunidad",
          description:
            "Creado por trabajadores remotos que se enamoraron de Gran Canaria. Sabemos lo que es llegar a un lugar nuevo y querer conectar.",
        },
      },
      ourStory: "Nuestra Historia",
      storyParagraphs: [
        "EventosGC comenzó en un espacio de coworking en Las Palmas. Un grupo de nosotros—trabajadores remotos y nómadas digitales de diferentes partes del mundo—teníamos la misma conversación: \"¿Te enteraste del concierto de la semana pasada?\" Siempre la semana pasada. Siempre demasiado tarde.",
        "En 2026, decidimos cambiar eso. Creamos EventosGC para ser la guía que nos hubiera gustado tener cuando llegamos. No solo un calendario, sino una forma de conectar realmente con la isla—su música, comida, arte y gente.",
        "No somos locales, pero Gran Canaria se ha convertido en nuestro hogar. Y queremos ayudar a otros—ya sea que estés aquí por un mes o una década—a sentir lo mismo.",
      ],
      values: {
        passionForDiscovery: {
          title: "Pasión por Descubrir",
          description:
            "Creemos que la mejor manera de experimentar un lugar nuevo es a través de su cultura, música y gente.",
        },
        qualityFirst: {
          title: "Calidad Primero",
          description:
            "Cada evento está verificado para asegurar que tengas información precisa y una gran experiencia.",
        },
        builtForEveryone: {
          title: "Creado para Todos",
          description:
            "Ya seas nómada digital, expatriado, turista o local—te ayudamos a encontrar tu comunidad.",
        },
      },
      cta: {
        title: "¿Listo para Explorar?",
        subtitle:
          "Cierra el portátil, sal y descubre lo que está pasando en Las Palmas hoy. Tu próximo recuerdo favorito está a un clic de distancia.",
        button: "Ver Eventos",
      },
    },

    // Privacy page
    privacy: {
      title: "Política de Privacidad",
      lastUpdated: "Última actualización: Enero 2026",
      sections: {
        introduction: {
          title: "Introducción",
          content: [
            'EventosGC ("nosotros" o "nos") respeta tu privacidad y se compromete a proteger tus datos personales. Esta política de privacidad explica cómo recopilamos, usamos y protegemos tu información cuando utilizas nuestro sitio web y servicios.',
            "Somos un pequeño equipo de trabajadores remotos que creamos esta plataforma para ayudar a las personas a descubrir eventos en Las Palmas de Gran Canaria. Solo recopilamos lo que necesitamos y no vendemos tus datos. Así de simple.",
          ],
        },
        informationCollected: {
          title: "Información que Recopilamos",
          youProvide: "Información que proporcionas",
          youProvideItems: [
            "Información de cuenta (email, nombre) cuando te registras",
            "Preferencias de eventos y eventos guardados",
            "Comunicaciones cuando nos contactas",
          ],
          automatic: "Información recopilada automáticamente",
          automaticItems: [
            "Información del dispositivo (tipo de navegador, sistema operativo)",
            "Datos de uso (páginas visitadas, tiempo empleado)",
            "Datos de ubicación (a nivel de ciudad, solo con tu permiso)",
          ],
        },
        howWeUse: {
          title: "Cómo Usamos tu Información",
          items: [
            "Para proporcionar y mejorar nuestros servicios de descubrimiento de eventos",
            "Para personalizar tu experiencia y mostrar eventos relevantes",
            "Para enviar recordatorios y actualizaciones de eventos (si lo aceptas)",
            "Para responder a tus preguntas y solicitudes de soporte",
            "Para analizar patrones de uso y mejorar nuestra plataforma",
          ],
        },
        dataSharing: {
          title: "Compartir Datos",
          content:
            "No vendemos tu información personal. Podemos compartir datos con:",
          items: [
            "Proveedores de servicios que nos ayudan a operar nuestra plataforma (hosting, analítica)",
            "Organizadores de eventos, solo si confirmas asistencia o te registras explícitamente",
            "Autoridades legales si lo requiere la ley",
          ],
        },
        cookies: {
          title: "Cookies",
          content:
            "Usamos cookies para mantener tu sesión iniciada, recordar tus preferencias y entender cómo la gente usa nuestro sitio. Puedes desactivar las cookies en la configuración de tu navegador, pero algunas funciones podrían no funcionar correctamente.",
        },
        yourRights: {
          title: "Tus Derechos",
          content: "Bajo el RGPD y otras leyes de privacidad, tienes derecho a:",
          items: [
            "Acceder a tus datos personales",
            "Corregir datos inexactos",
            "Solicitar la eliminación de tus datos",
            "Exportar tus datos en un formato portable",
            "Retirar tu consentimiento en cualquier momento",
          ],
          contact:
            "Para ejercer cualquiera de estos derechos, escríbenos a privacy@eventosgc.com.",
        },
        dataSecurity: {
          title: "Seguridad de Datos",
          content:
            "Utilizamos medidas de seguridad estándar de la industria para proteger tus datos, incluyendo cifrado en tránsito (HTTPS) y en reposo. Sin embargo, ningún sistema es 100% seguro, por lo que te animamos a usar contraseñas fuertes y ser cauteloso en línea.",
        },
        dataRetention: {
          title: "Retención de Datos",
          content:
            "Mantenemos tus datos mientras tengas una cuenta con nosotros. Si eliminas tu cuenta, borraremos tus datos personales en 30 días, excepto donde estemos obligados a conservarlos por razones legales.",
        },
        changes: {
          title: "Cambios en Esta Política",
          content:
            "Podemos actualizar esta política de vez en cuando. Te notificaremos de cambios significativos por email o mediante un aviso en nuestro sitio web.",
        },
        contactUs: {
          title: "Contáctanos",
          content:
            "¿Preguntas sobre esta política de privacidad? Escríbenos a privacy@eventosgc.com o encuéntranos en uno de los espacios de coworking de Las Palmas—normalmente somos los que preguntamos por los eventos del fin de semana.",
        },
      },
    },

    // Terms page
    terms: {
      title: "Términos de Servicio",
      lastUpdated: "Última actualización: Enero 2026",
      sections: {
        agreement: {
          title: "Aceptación de los Términos",
          content: [
            "Al acceder o usar EventosGC, aceptas estar sujeto a estos Términos de Servicio. Si no estás de acuerdo con alguna parte de los términos, no puedes acceder a nuestro servicio.",
            "Hemos intentado mantener estos términos legibles y justos. Si algo no tiene sentido, contáctanos y te lo explicamos.",
          ],
        },
        whatWeProvide: {
          title: "Lo Que Ofrecemos",
          content: [
            "EventosGC es una plataforma de descubrimiento de eventos para Las Palmas de Gran Canaria. Agregamos y mostramos información sobre eventos locales incluyendo conciertos, exposiciones, talleres, festivales y otras actividades.",
            "No somos los organizadores de estos eventos. Proporcionamos información para ayudarte a descubrir lo que está pasando, pero los eventos en sí son organizados por terceros.",
          ],
        },
        userAccounts: {
          title: "Cuentas de Usuario",
          content:
            "Para acceder a ciertas funciones, puede que necesites crear una cuenta. Cuando lo hagas:",
          items: [
            "Proporciona información precisa y completa",
            "Mantén tu contraseña segura y confidencial",
            "Notifícanos inmediatamente de cualquier acceso no autorizado",
            "Eres responsable de toda la actividad bajo tu cuenta",
          ],
          ageRequirement: "Debes tener al menos 16 años para crear una cuenta.",
        },
        acceptableUse: {
          title: "Uso Aceptable",
          content: "Aceptas no:",
          items: [
            "Usar el servicio para cualquier propósito ilegal",
            "Publicar contenido falso, engañoso o spam",
            "Extraer o recopilar datos sin permiso",
            "Intentar obtener acceso no autorizado a nuestros sistemas",
            "Interferir con el disfrute del servicio por parte de otros usuarios",
            "Suplantar a otros o tergiversar tu afiliación",
          ],
        },
        eventInformation: {
          title: "Información de Eventos",
          content: [
            "Nos esforzamos por proporcionar información precisa sobre eventos, pero no podemos garantizar que todos los detalles sean correctos o estén actualizados. Los eventos pueden ser cancelados, reprogramados o modificados sin previo aviso por los organizadores.",
            "Siempre verifica los detalles importantes (hora, lugar, entradas) con el organizador del evento antes de asistir. No somos responsables de información inexacta o cambios realizados por los organizadores de eventos.",
          ],
        },
        intellectualProperty: {
          title: "Propiedad Intelectual",
          content: [
            "El nombre EventosGC, el logo y el contenido original son de nuestra propiedad. No puedes usar nuestra marca sin permiso.",
            "La información, imágenes y descripciones de eventos pueden ser propiedad de los respectivos organizadores de eventos y locales. Mostramos este contenido bajo uso justo o con permiso.",
          ],
        },
        thirdPartyLinks: {
          title: "Enlaces a Terceros",
          content:
            "Nuestro servicio puede contener enlaces a sitios web o servicios de terceros (plataformas de venta de entradas, sitios web de locales, etc.). No somos responsables del contenido o prácticas de estos sitios externos.",
        },
        liability: {
          title: "Limitación de Responsabilidad",
          content: [
            'EventosGC se proporciona "tal cual" sin garantías de ningún tipo. En la máxima medida permitida por la ley, renunciamos a todas las garantías, expresas o implícitas.',
            "No somos responsables de ningún daño derivado de tu uso del servicio, incluyendo pero no limitado a: eventos perdidos, información incorrecta o problemas con organizadores de eventos de terceros.",
          ],
        },
        termination: {
          title: "Terminación",
          content:
            "Podemos suspender o terminar tu cuenta en cualquier momento por violaciones de estos términos o por cualquier otra razón a nuestra discreción. También puedes eliminar tu cuenta en cualquier momento a través de la configuración de tu cuenta.",
        },
        changes: {
          title: "Cambios en los Términos",
          content:
            "Podemos actualizar estos términos de vez en cuando. Te notificaremos de cambios significativos por email o mediante un aviso en nuestro sitio web. El uso continuado del servicio después de los cambios constituye la aceptación de los nuevos términos.",
        },
        governingLaw: {
          title: "Ley Aplicable",
          content:
            "Estos términos se rigen por las leyes de España. Cualquier disputa se resolverá en los tribunales de Las Palmas de Gran Canaria.",
        },
        contactUs: {
          title: "Contáctanos",
          content:
            "¿Preguntas sobre estos términos? Escríbenos a legal@eventosgc.com. Somos personas reales y estaremos encantados de aclarar cualquier cosa.",
        },
      },
    },
  },
};

export type Translations = (typeof translations)["en"];
