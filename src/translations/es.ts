import type { TranslationSchema } from "./index";

// Spanish translations
const translations: TranslationSchema = {
  common: {
    appName: "OpenEats",
    openSource: "Código Abierto",
    search: "Buscar",
    filter: "Filtrar",
    loading: "Cargando...",
    noResults: "No se encontraron resultados",
    clearFilters: "Limpiar Filtros",
    applyFilters: "Aplicar Filtros",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    submit: "Enviar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Añadir",
    remove: "Eliminar",
    close: "Cerrar",
    back: "Atrás",
    next: "Siguiente",
    previous: "Anterior",
    continue: "Continuar",
    goBack: "Volver",
    viewAll: "Ver Todo",
    seeMore: "Ver Más",
    seeLess: "Ver Menos",
    showMore: "Mostrar Más",
    showLess: "Mostrar Menos",
    readMore: "Leer Más",
    readLess: "Leer Menos",
    learnMore: "Saber Más",
    getStarted: "Comenzar",
    signIn: "Iniciar Sesión",
    signOut: "Cerrar Sesión",
    signUp: "Registrarse",
    register: "Registrarse",
    login: "Iniciar Sesión",
    logout: "Cerrar Sesión",
    myAccount: "Mi Cuenta",
    myProfile: "Mi Perfil",
    myOrders: "Mis Pedidos",
    myFavorites: "Mis Favoritos",
    cart: "Carrito",
    checkout: "Pagar",
    orderNow: "Ordenar Ahora",
    orderAgain: "Ordenar de Nuevo",
    orderHistory: "Historial de Pedidos",
    orderDetails: "Detalles del Pedido",
    orderConfirmation: "Confirmación del Pedido",
    orderSummary: "Resumen del Pedido",
    orderTotal: "Total del Pedido",
    orderStatus: "Estado del Pedido",
    orderDate: "Fecha del Pedido",
    orderNumber: "Número de Pedido",
    orderItems: "Artículos del Pedido",
    deliveryAddress: "Dirección de Entrega",
    deliveryTime: "Tiempo de Entrega",
    deliveryFee: "Tarifa de Entrega",
    deliveryInstructions: "Instrucciones de Entrega",
    deliveryDetails: "Detalles de Entrega",
    pickupDetails: "Detalles de Recogida",
    pickupTime: "Hora de Recogida",
    pickupLocation: "Lugar de Recogida",
    pickupInstructions: "Instrucciones de Recogida",
    subtotal: "Subtotal",
    tax: "Impuesto",
    total: "Total",
    tip: "Propina",
    fees: "Tarifas",
    discount: "Descuento",
    promoCode: "Código Promocional",
    applyPromoCode: "Aplicar Código Promocional",
    addPromoCode: "Añadir Código Promocional",
    removePromoCode: "Eliminar Código Promocional",
    invalidPromoCode: "Código Promocional Inválido",
    paymentMethod: "Método de Pago",
    addPaymentMethod: "Añadir Método de Pago",
    editPaymentMethod: "Editar Método de Pago",
    removePaymentMethod: "Eliminar Método de Pago",
    creditCard: "Tarjeta de Crédito",
    debitCard: "Tarjeta de Débito",
    paypal: "PayPal",
    applePay: "Apple Pay",
    googlePay: "Google Pay",
    cash: "Efectivo",
    cardNumber: "Número de Tarjeta",
    cardholderName: "Nombre del Titular",
    expirationDate: "Fecha de Vencimiento",
    cvv: "CVV",
    billingAddress: "Dirección de Facturación",
    billingAddressSameAsDelivery:
      "La dirección de facturación es la misma que la de entrega",
    saveForFutureUse: "Guardar para uso futuro",
    addAddress: "Añadir Dirección",
    editAddress: "Editar Dirección",
    removeAddress: "Eliminar Dirección",
    address: "Dirección",
    addressLine1: "Línea de Dirección 1",
    addressLine2: "Línea de Dirección 2",
    city: "Ciudad",
    state: "Estado",
    zipCode: "Código Postal",
    country: "País",
    phoneNumber: "Número de Teléfono",
    email: "Correo Electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar Contraseña",
    forgotPassword: "¿Olvidaste tu Contraseña?",
    resetPassword: "Restablecer Contraseña",
    changePassword: "Cambiar Contraseña",
    currentPassword: "Contraseña Actual",
    newPassword: "Nueva Contraseña",
    confirmNewPassword: "Confirmar Nueva Contraseña",
    rememberMe: "Recuérdame",
    stayLoggedIn: "Mantener Sesión Iniciada",
    dontHaveAccount: "¿No tienes una cuenta?",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    createAccount: "Crear Cuenta",
    createPassword: "Crear Contraseña",
    firstName: "Nombre",
    lastName: "Apellido",
    fullName: "Nombre Completo",
    username: "Nombre de Usuario",
    bio: "Biografía",
    website: "Sitio Web",
    socialMedia: "Redes Sociales",
    facebook: "Facebook",
    twitter: "Twitter",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    youtube: "YouTube",
    tiktok: "TikTok",
    snapchat: "Snapchat",
    pinterest: "Pinterest",
    reddit: "Reddit",
    github: "GitHub",
    discord: "Discord",
  },

  // Navigation
  nav: {
    home: "Inicio",
    restaurants: "Restaurantes",
    markets: "Mercados",
    localShops: "Tiendas Locales",
    partners: "Para Socios",
    drivers: "Para Conductores",
    about: "Acerca de",
    profile: "Perfil",
    orders: "Pedidos",
    favorites: "Favoritos",
    cart: "Carrito",
    signIn: "Iniciar Sesión",
    signOut: "Cerrar Sesión",
    backToOpenEats: "Volver a OpenEats",
    searchPlaceholder: "Buscar comida, restaurantes...",
    toggleMenu: "Alternar Menú",
    lightMode: "Modo Claro",
    darkMode: "Modo Oscuro",
    theme: "Tema",
  },

  // Home page
  home: {
    hero: {
      title: "Comida y productos locales, sin tarifas ocultas",
      subtitle:
        "Ordena de restaurantes locales, mercados y tiendas con entrega y recogida gratuitas. Código abierto e impulsado por la comunidad.",
      findFoodButton: "Encontrar Comida",
      deliveryAddressPlaceholder: "Ingresa la dirección de entrega",
    },
    categories: {
      title: "Categorías",
      viewAll: "Ver Todo",
    },
    restaurantsNearYou: {
      title: "Restaurantes Cerca de Ti",
      delivery: "Entrega",
      pickup: "Recogida",
      noRestaurants: "No se encontraron restaurantes",
      noPickup: "No hay restaurantes de recogida disponibles en esta área",
    },
    popularRestaurants: {
      title: "Restaurantes Populares",
    },
    featuredRestaurants: {
      title: "Restaurantes Destacados",
    },
    ownRestaurant: {
      title: "¿Tienes un Restaurante?",
      subtitle:
        "Únete a nuestra plataforma y llega a más clientes con nuestros precios justos y transparentes.",
      getStarted: "Comenzar",
    },
    footer: {
      about: "Acerca de",
      ourMission: "Nuestra Misión",
      howItWorks: "Cómo Funciona",
      community: "Comunidad",
      contribute: "Contribuir",
      forPartners: "Para Socios",
      joinAsRestaurant: "Únete como Restaurante",
      partnerBenefits: "Beneficios para Socios",
      successStories: "Historias de Éxito",
      partnerPortal: "Portal de Socios",
      forDrivers: "Para Conductores",
      becomeDriver: "Conviértete en Conductor",
      driverApp: "App para Conductores",
      earnings: "Ganancias",
      driverSupport: "Soporte para Conductores",
      downloadApp: "Descarga Nuestra App",
      appStore: "App Store",
      googlePlay: "Google Play",
      noHiddenFees: "Sin Tarifas Ocultas",
      feeDescription:
        "OpenEats es gratuito para usuarios y socios. Solo los pagos en línea incurren en una pequeña tarifa de procesamiento.",
      copyright: "© {{year}} OpenEats. Código abierto bajo Licencia MIT.",
      starUsOnGithub: "Danos una estrella en GitHub",
      learnMoreAboutFees: "Aprende más sobre nuestras tarifas",
    },
  },

  // Restaurant page
  restaurant: {
    promoted: "Promocionado",
    addToFavorites: "Añadir a favoritos",
    removeFromFavorites: "Eliminar de favoritos",
    categories: "Categorías:",
    reviews: "reseñas",
    deliveryTime: "Entrega:",
    minutes: "min",
    hours: "Horario",
    orderTypeSelector: {
      delivery: "Entrega",
      pickup: "Recogida",
      dineIn: "Comer Aquí",
      deliveryTooltip: "Entrega a tu dirección",
      pickupTooltip: "Recogida en el restaurante",
      dineInTooltip: "Ordenar mientras estás en el restaurante",
    },
    menu: {
      viewFullMenu: "Ver Menú Completo",
      readyToOrder: "¿Listo para Ordenar?",
      exploreMenu:
        "Explora nuestro menú completo y haz tu pedido para entrega o recogida.",
    },
    about: {
      title: "Sobre Nosotros",
      defaultContent:
        "fue fundado con una misión simple: servir comida deliciosa y de alta calidad hecha con los ingredientes más frescos. Nuestro equipo de chefs experimentados está dedicado a crear experiencias gastronómicas memorables para nuestros clientes, ya sea que estén comiendo aquí, recogiendo comida o pidiendo a domicilio. ¡Nos enorgullece ser parte de la comunidad y esperamos servirle pronto!",
      values: "Nuestros Valores",
      freshIngredients: {
        title: "Ingredientes Frescos",
        description:
          "Obtenemos los ingredientes más frescos de proveedores locales para garantizar la calidad en cada plato.",
      },
      expertChefs: {
        title: "Chefs Expertos",
        description:
          "Nuestro equipo de chefs experimentados aporta pasión y experiencia para crear sabores excepcionales.",
      },
      communityFocus: {
        title: "Enfoque Comunitario",
        description:
          "Estamos orgullosos de ser parte de la comunidad y nos esforzamos por retribuir siempre que sea posible.",
      },
      team: "Conoce a Nuestro Equipo",
      headChef: "Chef Principal",
      restaurantManager: "Gerente del Restaurante",
      owner: "Propietario",
    },
    contact: {
      title: "Contáctanos",
      restaurantInfo: "Información del Restaurante",
      address: "Dirección",
      phone: "Teléfono",
      email: "Correo Electrónico",
      hours: "Horario",
      sendMessage: "Envíanos un Mensaje",
      namePlaceholder: "Nombre",
      emailPlaceholder: "Correo Electrónico",
      messagePlaceholder: "Mensaje",
      sendButton: "Enviar Mensaje",
      sending: "Enviando...",
      messageSent: "Mensaje enviado",
      messageSentDescription:
        "Nos pondremos en contacto contigo lo antes posible",
      missingInfo: "Información faltante",
      missingInfoDescription: "Por favor completa todos los campos",
    },
    new: {
      title: "Crear un nuevo restaurante",
      subtitle:
        "Añade tu restaurante a Open Delivery y comienza a recibir pedidos en línea.",
      sections: {
        basic: "Información básica",
        contact: "Información de contacto",
        address: "Dirección",
        category: "Categoría del restaurante",
        serviceOptions: "Opciones de servicio",
      },
      fields: {
        name: {
          label: "Nombre del restaurante",
          placeholder: "Introduce el nombre de tu restaurante",
        },
        description: {
          label: "Descripción",
          placeholder:
            "Describe tu restaurante, cocina, ofertas especiales, etc.",
        },
        image: {
          label: "URL de la imagen del restaurante",
          placeholder: "https://ejemplo.es/tu-imagen-restaurante.jpg",
        },
        email: {
          label: "Correo electrónico",
          placeholder: "restaurante@ejemplo.es",
        },
        phone: {
          label: "Número de teléfono",
          placeholder: "+34 123 456 789",
        },
        street: {
          label: "Calle",
          placeholder: "Calle Principal",
        },
        streetNumber: {
          label: "Número",
          placeholder: "123",
        },
        city: {
          label: "Ciudad",
          placeholder: "Madrid",
        },
        zip: {
          label: "Código postal",
          placeholder: "28001",
        },
        country: {
          label: "País",
          placeholder: "Selecciona un país",
        },
        mainCategory: {
          label: "Categoría principal",
          placeholder: "Selecciona tu categoría principal de cocina",
        },
        priceLevel: {
          label: "Nivel de precio",
          placeholder: "Selecciona un nivel de precio",
          description:
            "Esto ayuda a los clientes a entender tu rango de precios",
          options: {
            budget: "Económico",
            moderate: "Precio moderado",
            expensive: "Caro",
            premium: "Alta cocina",
          },
        },
        delivery: {
          label: "Servicio a domicilio",
          description: "Ofrecer entrega a las direcciones de los clientes",
        },
        pickup: {
          label: "Servicio de recogida",
          description:
            "Permitir a los clientes recoger pedidos en tu restaurante",
        },
        dineIn: {
          label: "Opción de comer en el local",
          description: "Permitir a los clientes comer en tu restaurante",
        },
      },
      buttons: {
        create: "Crear restaurante",
        creating: "Creando...",
        cancel: "Cancelar",
      },
    },
  },

  // Menu items
  menuItem: {
    add: "Añadir",
    quantity: "Cantidad",
    specialInstructions: "Instrucciones Especiales",
    specialInstructionsPlaceholder: "¿Alguna solicitud especial o alergias?",
    addToCart: "Añadir al Carrito",
    cancel: "Cancelar",
  },

  // Location selector
  location: {
    setLocation: "Establecer ubicación",
    setLocationDescription:
      "Ingresa tu dirección o permítenos detectar tu ubicación actual.",
    useCurrentLocation: "Usar ubicación actual",
    detecting: "Detectando...",
    enterAddress: "Ingresa tu dirección...",
    suggestions: "Sugerencias",
    locationDetected: "Ubicación detectada",
    locationDetectedDescription:
      "Tu ubicación ha sido establecida en coordenadas cerca de {{location}}",
    locationAccessDenied: "Acceso a ubicación denegado",
    locationAccessDeniedDescription:
      "Hemos establecido una ubicación predeterminada. Puedes cambiarla manualmente.",
    locationNotSupported: "Ubicación no soportada",
    locationNotSupportedDescription:
      "La geolocalización no es compatible con tu navegador. Por favor, ingresa tu ubicación manualmente.",
  },

  // Languages
  languages: {
    EN: "English",
    ES: "Español",
    FR: "Français",
    IT: "Italiano",
    DE: "Deutsch",
    ZH: "中文",
  },
  reviews: {
    title: "Reseñas",
    noReviews: "Aún no hay reseñas. ¡Sé el primero en dejar una reseña!",
    hideItemReviews: "Ocultar reseñas de productos",
    showItemReviews: "Mostrar {{count}} {{reviewText}} de productos",
    reviewSingular: "reseña",
    reviewPlural: "reseñas",
    rateRestaurant: "Calificar el Restaurante",
    selectRating: "Seleccionar calificación",
    stars: "estrellas",
    experiencePlaceholder: "Comparte tu experiencia con este restaurante...",
    rateItems: "Califica los Productos que Pediste",
    rateItemsDescription: "Por favor califica al menos un producto",
    itemThoughtPlaceholder: "¿Qué piensas sobre {{itemName}}?",
    submitReview: "Enviar Reseña",
    submitting: "Enviando...",
    signInRequired: "Inicio de sesión requerido",
    signInRequiredDescription: "Por favor inicia sesión para dejar una reseña",
    ratingRequired: "Calificación requerida",
    ratingRequiredDescription: "Por favor califica el restaurante",
    productRatingRequired: "Calificación de producto requerida",
    productRatingRequiredDescription: "Por favor califica al menos un producto",
  },
  search: {
    title: "Resultados de Búsqueda",
    resultsFor: '{{count}} resultados para "{{query}}"',
    searchPlaceholder: "Buscar restaurantes...",
    filters: "Filtros",
    refineSearch: "Refina tus resultados de búsqueda",
    sortBy: "Ordenar Por",
    relevance: "Relevancia",
    rating: "Calificación",
    deliveryTime: "Tiempo de Entrega",
    priceLowToHigh: "Precio (Menor a Mayor)",
    priceHighToLow: "Precio (Mayor a Menor)",
    priceRange: "Rango de Precio",
    inexpensive: "$ (Económico)",
    moderate: "$$ (Moderado)",
    expensive: "$$$ (Costoso)",
    dietary: "Dietético",
    vegetarian: "Vegetariano",
    vegan: "Vegano",
    glutenFree: "Sin Gluten",
    clearAll: "Limpiar Todo",
    applyFilters: "Aplicar Filtros",
    restaurantsFound: "{{count}} {{restaurantText}} encontrados",
    restaurantSingular: "Restaurante",
    restaurantPlural: "Restaurantes",
    noRestaurantsFound:
      "No se encontraron restaurantes que coincidan con tus criterios de búsqueda",
    noPickupRestaurants:
      "No hay restaurantes de recogida disponibles que coincidan con tus criterios de búsqueda",
  },
  cart: {
    title: "Tu Carrito",
    empty: "Tu carrito está vacío",
    startShopping: "Empezar a comprar",
    continueShopping: "Continuar comprando",
    itemsInCart: "{{count}} artículos en el carrito",
    subtotal: "Subtotal",
    deliveryFee: "Tarifa de Entrega",
    tax: "Impuesto",
    total: "Total",
    checkout: "Pagar",
    remove: "Eliminar",
    specialInstructions: "Instrucciones Especiales:",
    quantity: "Cantidad:",
    from: "de",
  },
  checkout: {
    title: "Pago",
    deliveryDetails: "Detalles de Entrega",
    deliveryAddress: "Dirección de Entrega",
    changeAddress: "Cambiar",
    deliveryInstructions: "Instrucciones de Entrega",
    deliveryInstructionsPlaceholder:
      "Agregar instrucciones para el repartidor...",
    contactDetails: "Detalles de Contacto",
    name: "Nombre",
    phone: "Teléfono",
    email: "Correo Electrónico",
    paymentMethod: "Método de Pago",
    creditCard: "Tarjeta de Crédito",
    paypal: "PayPal",
    applePay: "Apple Pay",
    googlePay: "Google Pay",
    cash: "Efectivo contra Entrega",
    cardNumber: "Número de Tarjeta",
    cardholderName: "Nombre del Titular",
    expiryDate: "Fecha de Vencimiento",
    cvv: "CVV",
    orderSummary: "Resumen del Pedido",
    subtotal: "Subtotal",
    deliveryFee: "Tarifa de Entrega",
    tax: "Impuesto",
    total: "Total",
    placeOrder: "Realizar Pedido",
    placingOrder: "Realizando Pedido...",
    orderPlaced: "Pedido Realizado",
    orderPlacedDescription: "Tu pedido ha sido realizado con éxito",
    orderFailed: "Pedido Fallido",
    orderFailedDescription:
      "Hubo un error al realizar tu pedido. Por favor, inténtalo de nuevo.",
  },
  profile: {
    title: "Mi Perfil",
    personalInfo: "Información Personal",
    name: "Nombre",
    email: "Correo Electrónico",
    phone: "Teléfono",
    addresses: "Direcciones",
    addAddress: "Añadir Dirección",
    editAddress: "Editar Dirección",
    deleteAddress: "Eliminar Dirección",
    defaultAddress: "Dirección Predeterminada",
    makeDefault: "Establecer como Predeterminada",
    paymentMethods: "Métodos de Pago",
    addPaymentMethod: "Añadir Método de Pago",
    editPaymentMethod: "Editar Método de Pago",
    deletePaymentMethod: "Eliminar Método de Pago",
    defaultPaymentMethod: "Método de Pago Predeterminado",
    preferences: "Preferencias",
    language: "Idioma",
    notifications: "Notificaciones",
    emailNotifications: "Notificaciones por Correo Electrónico",
    pushNotifications: "Notificaciones Push",
    smsNotifications: "Notificaciones SMS",
    saveChanges: "Guardar Cambios",
    saving: "Guardando...",
    changesSaved: "Cambios Guardados",
    changesSavedDescription: "Tus cambios han sido guardados con éxito",
    changesFailed: "Cambios Fallidos",
    changesFailedDescription:
      "Hubo un error al guardar tus cambios. Por favor, inténtalo de nuevo.",
  },
  auth: {
    login: {
      title: "Bienvenido de Nuevo",
      subtitle: "Inicia sesión en tu cuenta para continuar",
      emailLabel: "Correo Electrónico",
      emailPlaceholder: "Ingresa tu correo electrónico",
      passwordLabel: "Contraseña",
      passwordPlaceholder: "Ingresa tu contraseña",
      rememberMe: "Recuérdame",
      forgotPassword: "¿Olvidaste tu contraseña?",
      loginButton: "Iniciar Sesión",
      noAccount: "¿No tienes una cuenta?",
      createAccount: "Crear una cuenta",
      loginError: "Correo electrónico o contraseña inválidos",
      or: "O",
    },
    signup: {
      title: "Crear una Cuenta",
      subtitle: "Regístrate para comenzar con OpenEats",
      firstNameLabel: "Nombre",
      firstNamePlaceholder: "Ingresa tu nombre",
      lastNameLabel: "Apellido",
      lastNamePlaceholder: "Ingresa tu apellido",
      emailLabel: "Correo Electrónico",
      emailPlaceholder: "Ingresa tu correo electrónico",
      passwordLabel: "Contraseña",
      passwordPlaceholder: "Crea una contraseña",
      confirmPasswordLabel: "Confirmar Contraseña",
      confirmPasswordPlaceholder: "Confirma tu contraseña",
      termsAndConditions: "Términos y Condiciones",
      privacyPolicy: "Política de Privacidad",
      agreeToTerms: "Acepto los {0} y la {1}",
      createAccountButton: "Crear Cuenta",
      alreadyHaveAccount: "¿Ya tienes una cuenta?",
      signIn: "Iniciar sesión",
      signupError: "Hubo un error al crear tu cuenta",
      passwordRequirements: "La contraseña debe tener al menos 8 caracteres",
      passwordsMustMatch: "Las contraseñas deben coincidir",
      or: "O",
    },
    verifyEmail: {
      title: "Verifica tu Correo Electrónico",
      subtitle:
        "Por favor verifica tu dirección de correo electrónico para continuar",
      checkInbox: "Hemos enviado un enlace de verificación a {email}",
      didNotReceiveEmail: "¿No recibiste un correo electrónico?",
      resendEmail: "Reenviar correo de verificación",
      emailResent: "Correo reenviado exitosamente",
    },
    resetPassword: {
      title: "Restablecer Contraseña",
      subtitle:
        "Ingresa tu correo electrónico para recibir un enlace de restablecimiento de contraseña",
      emailLabel: "Correo Electrónico",
      emailPlaceholder: "Ingresa tu correo electrónico",
      submitButton: "Enviar Enlace de Restablecimiento",
      backToLogin: "Volver al inicio de sesión",
      emailSent: "Correo de restablecimiento de contraseña enviado",
      checkInbox:
        "Por favor revisa tu bandeja de entrada para más instrucciones",
    },
  },
  countries: {
    DE: "Alemania",
    AT: "Austria",
    CH: "Suiza",
  },

  // About page
  about: {
    header: {
      title: "Acerca de {{appName}}",
      subtitle:
        "La alternativa gratuita a las plataformas de entrega - sin tarifas de intermediarios",
    },
    mission: {
      title: "Nuestra Misión",
      paragraph1:
        "{{appName}} conecta a los restaurantes directamente con los clientes a través de una innovadora red peer-to-peer. Creemos en una industria de restaurantes justa sin las excesivas tarifas que afectan a los ya reducidos márgenes de los restaurantes locales.",
      paragraph2:
        "Como plataforma de código abierto, nos aseguramos de estar comprometidos con la comunidad a la que servimos, no con accionistas o capitalistas de riesgo.",
      imageAlt: "Restaurante local",
    },
    orderTypes: {
      title: "Opciones de Pedido Flexibles",
      delivery: {
        title: "Entrega",
        description:
          "Recibe tu comida cómodamente en casa - ya sea con los propios repartidores del restaurante o a través de nuestra red de repartidores.",
      },
      pickup: {
        title: "Recogida",
        description:
          "Haz tu pedido con antelación y recoge tu comida sin esperar. Simple, rápido y conveniente.",
      },
      table: {
        title: "Pedido en Mesa",
        description:
          "Pide directamente desde tu smartphone en la mesa - sin tener que llamar al camarero. Moderno y eficiente.",
      },
    },
    business: {
      title: "Nuestro Modelo de Negocio",
      description:
        "A diferencia de las plataformas comerciales que cobran hasta un 30% de comisión, {{appName}} ofrece todas las funciones básicas de forma gratuita. Solo ganamos con servicios adicionales opcionales.",
      imageAlt: "Modelo de negocio transparente",
      features: {
        basic: {
          title: "Funciones Básicas",
          value: "GRATIS",
        },
        delivery: {
          title: "Red de Entrega",
          value: "Solo cuando se utiliza (auto-entrega gratuita)",
        },
        payments: {
          title: "Pagos Online",
          value: "Pequeña tarifa (pago en efectivo in situ es gratuito)",
        },
      },
    },
    stakeholders: {
      title: "Para Todos los Participantes",
      restaurants: {
        title: "Para Restaurantes",
        description:
          "Gestión de pedidos gratuita, menús digitales y tu propia presencia online sin tarifas ocultas ni compromisos contractuales prolongados.",
      },
      customers: {
        title: "Para Clientes",
        description:
          "Pide en restaurantes locales con precios transparentes y sin recargos ocultos - ya sea para entrega, recogida o en mesa.",
      },
      drivers: {
        title: "Para Repartidores",
        description:
          "Compensación justa a través de un modelo de pago transparente, horarios de trabajo flexibles y el 100% de tus propinas se quedan contigo.",
      },
    },
    opensource: {
      title: "Código Abierto",
      paragraph1:
        "{{appName}} está construido y mantenido por una comunidad de desarrolladores que creen en el poder del código abierto. Nuestro código está disponible gratuitamente para que cualquiera lo use, modifique o contribuya.",
      paragraph2:
        "A través de nuestro enfoque de código abierto, nos aseguramos de que nuestra plataforma permanezca transparente, segura y alineada con los intereses de la comunidad.",
      githubButton: "Ver en GitHub",
      imageAlt: "Comunidad de código abierto",
    },
    join: {
      title: "Forma Parte del Movimiento",
      description:
        "Ya seas cliente, dueño de restaurante, repartidor o desarrollador - hay un lugar para todos en la comunidad {{appName}}.",
      buttons: {
        order: "Pedir Comida",
        restaurant: "Registrar Restaurante",
        driver: "Convertirse en Repartidor",
      },
    },
  },
};

export default translations;
