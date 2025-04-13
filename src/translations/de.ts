import type { Countries, Languages } from "./index";

// German translations
const translations = {
  common: {
    appName: "OpenEats",
    openSource: "Open Source",
    search: "Suchen",
    filter: "Filter",
    loading: "Wird geladen...",
    noResults: "Keine Ergebnisse gefunden",
    clearFilters: "Filter löschen",
    applyFilters: "Filter anwenden",
    error: "Fehler",
    success: "Erfolg",
    cancel: "Abbrechen",
    submit: "Absenden",
    save: "Speichern",
    delete: "Löschen",
    edit: "Bearbeiten",
    add: "Hinzufügen",
    remove: "Entfernen",
    close: "Schließen",
    back: "Zurück",
    next: "Weiter",
    previous: "Zurück",
    continue: "Fortfahren",
    goBack: "Zurückgehen",
    viewAll: "Alle anzeigen",
    seeMore: "Mehr anzeigen",
    seeLess: "Weniger anzeigen",
    showMore: "Mehr anzeigen",
    showLess: "Weniger anzeigen",
    readMore: "Weiterlesen",
    readLess: "Weniger lesen",
    learnMore: "Mehr erfahren",
    getStarted: "Loslegen",
    signIn: "Anmelden",
    signOut: "Abmelden",
    signUp: "Registrieren",
    register: "Registrieren",
    login: "Anmelden",
    logout: "Abmelden",
    myAccount: "Mein Konto",
    myProfile: "Mein Profil",
    myOrders: "Meine Bestellungen",
    myFavorites: "Meine Favoriten",
    cart: "Warenkorb",
    checkout: "Zur Kasse",
    orderNow: "Jetzt bestellen",
    orderAgain: "Erneut bestellen",
    orderHistory: "Bestellverlauf",
    orderDetails: "Bestelldetails",
    orderConfirmation: "Bestellbestätigung",
    orderSummary: "Bestellübersicht",
    orderTotal: "Gesamtbetrag",
    orderStatus: "Bestellstatus",
    orderDate: "Bestelldatum",
    orderNumber: "Bestellnummer",
    orderItems: "Bestellte Artikel",
    deliveryAddress: "Lieferadresse",
    deliveryTime: "Lieferzeit",
    deliveryFee: "Liefergebühr",
    deliveryInstructions: "Lieferanweisungen",
    deliveryDetails: "Lieferdetails",
    pickupDetails: "Abholdetails",
    pickupTime: "Abholzeit",
    pickupLocation: "Abholort",
    pickupInstructions: "Abholanweisungen",
    subtotal: "Zwischensumme",
    tax: "Steuern",
    total: "Gesamt",
    tip: "Trinkgeld",
    fees: "Gebühren",
    discount: "Rabatt",
    promoCode: "Gutscheincode",
    applyPromoCode: "Gutscheincode anwenden",
    addPromoCode: "Gutscheincode hinzufügen",
    removePromoCode: "Gutscheincode entfernen",
    invalidPromoCode: "Ungültiger Gutscheincode",
    paymentMethod: "Zahlungsmethode",
    addPaymentMethod: "Zahlungsmethode hinzufügen",
    editPaymentMethod: "Zahlungsmethode bearbeiten",
    removePaymentMethod: "Zahlungsmethode entfernen",
    creditCard: "Kreditkarte",
    debitCard: "Debitkarte",
    paypal: "PayPal",
    applePay: "Apple Pay",
    googlePay: "Google Pay",
    cash: "Bargeld",
    cardNumber: "Kartennummer",
    cardholderName: "Name des Karteninhabers",
    expirationDate: "Ablaufdatum",
    cvv: "CVV",
    billingAddress: "Rechnungsadresse",
    billingAddressSameAsDelivery: "Rechnungsadresse ist gleich Lieferadresse",
    saveForFutureUse: "Für zukünftige Verwendung speichern",
    addAddress: "Adresse hinzufügen",
    editAddress: "Adresse bearbeiten",
    removeAddress: "Adresse entfernen",
    address: "Adresse",
    addressLine1: "Adresszeile 1",
    addressLine2: "Adresszeile 2",
    city: "Stadt",
    state: "Bundesland",
    zipCode: "Postleitzahl",
    country: "Land",
    phoneNumber: "Telefonnummer",
    email: "E-Mail",
    password: "Passwort",
    confirmPassword: "Passwort bestätigen",
    forgotPassword: "Passwort vergessen?",
    resetPassword: "Passwort zurücksetzen",
    changePassword: "Passwort ändern",
    currentPassword: "Aktuelles Passwort",
    newPassword: "Neues Passwort",
    confirmNewPassword: "Neues Passwort bestätigen",
    rememberMe: "Angemeldet bleiben",
    stayLoggedIn: "Angemeldet bleiben",
    dontHaveAccount: "Noch kein Konto?",
    alreadyHaveAccount: "Bereits ein Konto?",
    createAccount: "Konto erstellen",
    createPassword: "Passwort erstellen",
    firstName: "Vorname",
    lastName: "Nachname",
    fullName: "Vollständiger Name",
    username: "Benutzername",
    bio: "Biografie",
    website: "Webseite",
    socialMedia: "Soziale Medien",
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
    home: "Startseite",
    restaurants: "Restaurants",
    markets: "Märkte",
    localShops: "Lokale Geschäfte",
    partners: "Für Partner",
    drivers: "Für Fahrer",
    about: "Über uns",
    profile: "Profil",
    orders: "Bestellungen",
    favorites: "Favoriten",
    cart: "Warenkorb",
    signIn: "Anmelden",
    signOut: "Abmelden",
    backToOpenEats: "Zurück zu OpenEats",
    searchPlaceholder: "Suche nach Essen, Restaurants...",
    toggleMenu: "Menü umschalten",
    lightMode: "Heller Modus",
    darkMode: "Dunkler Modus",
    theme: "Thema",
  },

  // Home page
  home: {
    hero: {
      title: "Lokales Essen und Waren, keine versteckten Gebühren",
      subtitle:
        "Bestelle bei lokalen Restaurants, Märkten und Geschäften mit kostenloser Lieferung und Abholung. Open Source und von der Community betrieben.",
      findFoodButton: "Essen finden",
      deliveryAddressPlaceholder: "Lieferadresse eingeben",
    },
    categories: {
      title: "Kategorien",
      viewAll: "Alle anzeigen",
    },
    restaurantsNearYou: {
      title: "Restaurants in deiner Nähe",
      delivery: "Lieferung",
      pickup: "Abholung",
      noRestaurants: "Keine Restaurants gefunden",
      noPickup: "Keine Abholrestaurants in dieser Gegend verfügbar",
    },
    popularRestaurants: {
      title: "Beliebte Restaurants",
    },
    featuredRestaurants: {
      title: "Empfohlene Restaurants",
    },
    ownRestaurant: {
      title: "Besitzt du ein Restaurant?",
      subtitle:
        "Tritt unserer Plattform bei und erreiche mehr Kunden mit unseren fairen, transparenten Preisen.",
      getStarted: "Loslegen",
    },
    footer: {
      about: "Über uns",
      ourMission: "Unsere Mission",
      howItWorks: "Wie es funktioniert",
      community: "Gemeinschaft",
      contribute: "Beitragen",
      forPartners: "Für Partner",
      joinAsRestaurant: "Als Restaurant beitreten",
      partnerBenefits: "Partnervorteile",
      successStories: "Erfolgsgeschichten",
      partnerPortal: "Partner-Portal",
      forDrivers: "Für Fahrer",
      becomeDriver: "Fahrer werden",
      driverApp: "Fahrer-App",
      earnings: "Verdienste",
      driverSupport: "Fahrer-Support",
      downloadApp: "Unsere App herunterladen",
      appStore: "App Store",
      googlePlay: "Google Play",
      noHiddenFees: "Keine versteckten Gebühren",
      feeDescription:
        "OpenEats ist kostenlos für Benutzer und Partner. Nur Online-Zahlungen verursachen eine kleine Bearbeitungsgebühr.",
      copyright: "© {{year}} OpenEats. Open Source unter MIT-Lizenz.",
      starUsOnGithub: "Sterne uns auf GitHub",
      learnMoreAboutFees: "Erfahre mehr über unsere Gebühren",
    },
  },

  // Restaurant page
  restaurant: {
    promoted: "Beworben",
    verified: "Verifiziert",
    uncategorized: "Nicht kategorisiert",
    orders: "Bestellungen",
    delivery: "Lieferung",
    pickup: "Abholung",
    addToFavorites: "Zu Favoriten hinzufügen",
    removeFromFavorites: "Aus Favoriten entfernen",
    categories: "Kategorien",
    reviews: "Bewertungen",
    deliveryTime: "Lieferung:",
    minutes: "Min",
    hours: "Öffnungszeiten",
    weekdays: "Montag - Freitag",
    weekends: "Samstag - Sonntag",
    addedToFavorites: "Zu Favoriten hinzugefügt",
    removedFromFavorites: "Aus Favoriten entfernt",
    notFound: "Restaurant nicht gefunden",
    notFoundDescription: "Das gesuchte Restaurant existiert nicht oder wurde entfernt.",
    readyToOrder: "Bereit zum Bestellen?",
    exploreMenu: "Erkunde unser vollständiges Menü und gib deine Bestellung für Lieferung oder Abholung auf.",
    orderTypeSelector: {
      delivery: "Lieferung",
      pickup: "Abholung",
      dineIn: "Vor Ort essen",
      deliveryTooltip: "Lieferung an deine Adresse",
      pickupTooltip: "Abholung vom Restaurant",
      dineInTooltip: "Bestellen während du im Restaurant bist",
    },
    menu: {
      viewFullMenu: "Vollständiges Menü anzeigen",
      readyToOrder: "Bereit zum Bestellen?",
      exploreMenu:
        "Erkunde unser vollständiges Menü und gib deine Bestellung für Lieferung oder Abholung auf.",
    },
    about: {
      title: "Über uns",
      defaultContent:
        "wurde mit einer einfachen Mission gegründet: köstliches, hochwertiges Essen aus frischesten Zutaten zu servieren. Unser Team erfahrener Köche ist bestrebt, unvergessliche Essenserlebnisse für unsere Kunden zu schaffen, egal ob du vor Ort isst, abholst oder liefern lässt. Wir sind stolz darauf, Teil der Gemeinschaft zu sein und freuen uns darauf, dir bald zu dienen!",
      values: "Unsere Werte",
      freshIngredients: {
        title: "Frische Zutaten",
        description:
          "Wir beziehen die frischesten Zutaten von lokalen Lieferanten, um Qualität in jedem Gericht zu gewährleisten.",
      },
      expertChefs: {
        title: "Erfahrene Köche",
        description:
          "Unser Team erfahrener Köche bringt Leidenschaft und Expertise mit, um außergewöhnliche Aromen zu kreieren.",
      },
      communityFocus: {
        title: "Gemeinschaftsfokus",
        description:
          "Wir sind stolz darauf, Teil der Gemeinschaft zu sein und bemühen uns, wann immer möglich, etwas zurückzugeben.",
      },
      team: "Lerne unser Team kennen",
      headChef: "Chefkoch",
      restaurantManager: "Restaurantleiter",
      owner: "Inhaber",
    },
    contact: {
      title: "Kontaktiere uns",
      restaurantInfo: "Restaurant-Informationen",
      address: "Adresse",
      phone: "Telefon",
      email: "E-Mail",
      hours: "Öffnungszeiten",
      sendMessage: "Sende uns eine Nachricht",
      namePlaceholder: "Name",
      emailPlaceholder: "E-Mail",
      messagePlaceholder: "Nachricht",
      sendButton: "Nachricht senden",
      sending: "Wird gesendet...",
      messageSent: "Nachricht gesendet",
      messageSentDescription:
        "Wir werden uns so schnell wie möglich bei dir melden",
      missingInfo: "Fehlende Informationen",
      missingInfoDescription: "Bitte fülle alle Felder aus",
    },
    new: {
      title: "Neues Restaurant erstellen",
      subtitle:
        "Fügen Sie Ihr Restaurant zu Open Delivery hinzu und erhalten Sie Online-Bestellungen.",
      sections: {
        basic: "Grundinformationen",
        contact: "Kontaktinformationen",
        address: "Adresse",
        category: "Restaurantkategorie",
        serviceOptions: "Serviceoptionen",
      },
      fields: {
        name: {
          label: "Restaurantname",
          placeholder: "Geben Sie den Namen Ihres Restaurants ein",
        },
        description: {
          label: "Beschreibung",
          placeholder:
            "Beschreiben Sie Ihr Restaurant, Ihre Küche, besondere Angebote usw.",
        },
        image: {
          label: "Restaurant-Bild-URL",
          placeholder: "https://beispiel.de/ihr-restaurant-bild.jpg",
        },
        email: {
          label: "E-Mail",
          placeholder: "restaurant@beispiel.de",
        },
        phone: {
          label: "Telefonnummer",
          placeholder: "+49 123 456789",
        },
        street: {
          label: "Straße",
          placeholder: "Hauptstraße",
        },
        streetNumber: {
          label: "Hausnummer",
          placeholder: "123",
        },
        city: {
          label: "Stadt",
          placeholder: "Berlin",
        },
        zip: {
          label: "Postleitzahl",
          placeholder: "10115",
        },
        country: {
          label: "Land",
          placeholder: "Wählen Sie ein Land",
        },
        mainCategory: {
          label: "Hauptkategorie",
          placeholder: "Wählen Sie Ihre Hauptküchenkategorie",
        },
        priceLevel: {
          label: "Preisniveau",
          placeholder: "Wählen Sie ein Preisniveau",
          description: "Dies hilft Kunden, Ihre Preisklasse zu verstehen",
          options: {
            budget: "Preisgünstig",
            moderate: "Mittlere Preisklasse",
            expensive: "Gehoben",
            premium: "Premium-Gastronomie",
          },
        },
        delivery: {
          label: "Lieferservice",
          description: "Bieten Sie Lieferung an die Adressen der Kunden an",
        },
        pickup: {
          label: "Abholservice",
          description:
            "Ermöglichen Sie Kunden, Bestellungen in Ihrem Restaurant abzuholen",
        },
        dineIn: {
          label: "Vor-Ort-Option",
          description: "Ermöglichen Sie Kunden, in Ihrem Restaurant zu essen",
        },
      },
      buttons: {
        create: "Restaurant erstellen",
        creating: "Wird erstellt...",
        cancel: "Abbrechen",
      },
    },
  },

  // Menu items
  menuItem: {
    add: "Hinzufügen",
    quantity: "Menge",
    specialInstructions: "Besondere Anweisungen",
    specialInstructionsPlaceholder: "Besondere Wünsche oder Allergien?",
    addToCart: "In den Warenkorb",
    cancel: "Abbrechen",
  },

  // Reviews
  reviews: {
    title: "Bewertungen",
    noReviews:
      "Noch keine Bewertungen. Sei der Erste, der eine Bewertung hinterlässt!",
    hideItemReviews: "Artikelbewertungen ausblenden",
    showItemReviews: "{{count}} Artikel{{reviewText}} anzeigen",
    reviewSingular: "bewertung",
    reviewPlural: "bewertungen",
    rateRestaurant: "Bewerte das Restaurant",
    selectRating: "Bewertung auswählen",
    stars: "Sterne",
    experiencePlaceholder: "Teile deine Erfahrung mit diesem Restaurant...",
    rateItems: "Bewerte die bestellten Artikel",
    rateItemsDescription: "Bitte bewerte mindestens einen Artikel",
    itemThoughtPlaceholder: "Was hältst du von {{itemName}}?",
    submitReview: "Bewertung abschicken",
    submitting: "Wird abgeschickt...",
    signInRequired: "Anmeldung erforderlich",
    signInRequiredDescription:
      "Bitte melde dich an, um eine Bewertung zu hinterlassen",
    ratingRequired: "Bewertung erforderlich",
    ratingRequiredDescription: "Bitte bewerte das Restaurant",
    productRatingRequired: "Produktbewertung erforderlich",
    productRatingRequiredDescription: "Bitte bewerte mindestens ein Produkt",
  },

  // Location selector
  location: {
    setLocation: "Standort festlegen",
    setLocationDescription:
      "Gib deine Adresse ein oder lass uns deinen aktuellen Standort erkennen.",
    useCurrentLocation: "Aktuellen Standort verwenden",
    detecting: "Wird erkannt...",
    enterAddress: "Gib deine Adresse ein...",
    suggestions: "Vorschläge",
    locationDetected: "Standort erkannt",
    locationDetectedDescription:
      "Dein Standort wurde auf Koordinaten in der Nähe von {{location}} festgelegt",
    locationAccessDenied: "Standortzugriff verweigert",
    locationAccessDeniedDescription:
      "Wir haben einen Standardstandort festgelegt. Du kannst ihn manuell ändern.",
    locationNotSupported: "Standort nicht unterstützt",
    locationNotSupportedDescription:
      "Geolokalisierung wird von deinem Browser nicht unterstützt. Bitte gib deinen Standort manuell ein.",
  },

  // Search page
  search: {
    title: "Suchergebnisse",
    resultsFor: '{{count}} Ergebnisse für "{{query}}"',
    searchPlaceholder: "Restaurants suchen...",
    filters: "Filter",
    refineSearch: "Verfeinere deine Suchergebnisse",
    sortBy: "Sortieren nach",
    relevance: "Relevanz",
    rating: "Bewertung",
    deliveryTime: "Lieferzeit",
    priceLowToHigh: "Preis (niedrig zu hoch)",
    priceHighToLow: "Preis (hoch zu niedrig)",
    priceRange: "Preisklasse",
    inexpensive: "$ (Günstig)",
    moderate: "$$ (Moderat)",
    expensive: "$$$ (Teuer)",
    dietary: "Ernährung",
    vegetarian: "Vegetarisch",
    vegan: "Vegan",
    glutenFree: "Glutenfrei",
    clearAll: "Alle löschen",
    applyFilters: "Filter anwenden",
    restaurantsFound: "{{count}} {{restaurantText}} gefunden",
    restaurantSingular: "Restaurant",
    restaurantPlural: "Restaurants",
    noRestaurantsFound:
      "Keine Restaurants gefunden, die deinen Suchkriterien entsprechen",
    noPickupRestaurants:
      "Keine Abholrestaurants verfügbar, die deinen Suchkriterien entsprechen",
  },

  // Cart
  cart: {
    title: "Dein Warenkorb",
    empty: "Dein Warenkorb ist leer",
    startShopping: "Einkaufen beginnen",
    continueShopping: "Einkauf fortsetzen",
    itemsInCart: "{{count}} Artikel im Warenkorb",
    subtotal: "Zwischensumme",
    deliveryFee: "Liefergebühr",
    tax: "Steuern",
    total: "Gesamt",
    checkout: "Zur Kasse",
    remove: "Entfernen",
    specialInstructions: "Besondere Anweisungen:",
    quantity: "Menge:",
    from: "von",
  },

  // Checkout
  checkout: {
    title: "Kasse",
    deliveryDetails: "Lieferdetails",
    deliveryAddress: "Lieferadresse",
    changeAddress: "Ändern",
    deliveryInstructions: "Lieferanweisungen",
    deliveryInstructionsPlaceholder: "Anweisungen für den Fahrer hinzufügen...",
    contactDetails: "Kontaktdaten",
    name: "Name",
    phone: "Telefon",
    email: "E-Mail",
    paymentMethod: "Zahlungsmethode",
    creditCard: "Kreditkarte",
    paypal: "PayPal",
    applePay: "Apple Pay",
    googlePay: "Google Pay",
    cash: "Barzahlung bei Lieferung",
    cardNumber: "Kartennummer",
    cardholderName: "Name des Karteninhabers",
    expiryDate: "Ablaufdatum",
    cvv: "CVV",
    orderSummary: "Bestellübersicht",
    subtotal: "Zwischensumme",
    deliveryFee: "Liefergebühr",
    tax: "Steuern",
    total: "Gesamt",
    placeOrder: "Bestellung aufgeben",
    placingOrder: "Bestellung wird aufgegeben...",
    orderPlaced: "Bestellung aufgegeben",
    orderPlacedDescription: "Deine Bestellung wurde erfolgreich aufgegeben",
    orderFailed: "Bestellung fehlgeschlagen",
    orderFailedDescription:
      "Bei der Aufgabe deiner Bestellung ist ein Fehler aufgetreten. Bitte versuche es erneut.",
  },

  // Profile
  profile: {
    title: "Mein Profil",
    personalInfo: "Persönliche Informationen",
    name: "Name",
    email: "E-Mail",
    phone: "Telefon",
    addresses: "Adressen",
    addAddress: "Adresse hinzufügen",
    editAddress: "Adresse bearbeiten",
    deleteAddress: "Adresse löschen",
    defaultAddress: "Standardadresse",
    makeDefault: "Als Standard festlegen",
    paymentMethods: "Zahlungsmethoden",
    addPaymentMethod: "Zahlungsmethode hinzufügen",
    editPaymentMethod: "Zahlungsmethode bearbeiten",
    deletePaymentMethod: "Zahlungsmethode löschen",
    defaultPaymentMethod: "Standard-Zahlungsmethode",
    preferences: "Präferenzen",
    language: "Sprache",
    notifications: "Benachrichtigungen",
    emailNotifications: "E-Mail-Benachrichtigungen",
    pushNotifications: "Push-Benachrichtigungen",
    smsNotifications: "SMS-Benachrichtigungen",
    saveChanges: "Änderungen speichern",
    saving: "Wird gespeichert...",
    changesSaved: "Änderungen gespeichert",
    changesSavedDescription: "Deine Änderungen wurden erfolgreich gespeichert",
    changesFailed: "Änderungen fehlgeschlagen",
    changesFailedDescription:
      "Beim Speichern deiner Änderungen ist ein Fehler aufgetreten. Bitte versuche es erneut.",
  },

  // About page
  about: {
    header: {
      title: "Über {{appName}}",
      subtitle:
        "Die freie Alternative zu Lieferando & Co. - ohne Zwischenhändlergebühren",
    },
    mission: {
      title: "Unsere Mission",
      paragraph1:
        "{{appName}} verbindet Restaurants direkt mit Kunden über ein innovatives Peer-to-Peer-Netzwerk. Wir glauben an eine faire Gastronomiebranche ohne die überhöhten Gebühren, die die ohnehin schon geringen Margen der lokalen Restaurants belasten.",
      paragraph2:
        "Als Open-Source-Plattform stellen wir sicher, dass wir der Gemeinschaft verpflichtet sind, die wir bedienen - nicht Aktionären oder Risikokapitalgebern.",
      imageAlt: "Lokales Restaurant",
    },
    orderTypes: {
      title: "Flexible Bestellwege",
      delivery: {
        title: "Lieferung",
        description:
          "Lassen Sie sich Ihr Essen bequem nach Hause liefern - entweder mit den eigenen Fahrern des Restaurants oder über unser Fahrernetzwerk.",
      },
      pickup: {
        title: "Abholung",
        description:
          "Bestellen Sie vor und holen Sie Ihr Essen ohne Wartezeit ab. Einfach, schnell und bequem.",
      },
      table: {
        title: "Tischbestellung",
        description:
          "Bestellen Sie direkt vom Smartphone am Tisch - ohne Kellner rufen zu müssen. Modern und effizient.",
      },
    },
    business: {
      title: "Unser Geschäftsmodell",
      description:
        "Anders als kommerzielle Plattformen, die bis zu 30% Provision verlangen, bietet {{appName}} alle Grundfunktionen kostenlos an. Wir verdienen nur an optionalen Zusatzleistungen.",
      imageAlt: "Transparentes Geschäftsmodell",
      features: {
        basic: {
          title: "Grundfunktionen",
          value: "KOSTENLOS",
        },
        delivery: {
          title: "Liefernetzwerk",
          value: "Nur bei Nutzung (Selbstlieferung kostenlos)",
        },
        payments: {
          title: "Online-Zahlungen",
          value: "Kleine Gebühr (Barzahlung vor Ort kostenlos)",
        },
      },
    },
    stakeholders: {
      title: "Für alle Beteiligten",
      restaurants: {
        title: "Für Gastronomen",
        description:
          "Kostenlose Bestellverwaltung, digitale Speisekarten und ein eigener Online-Auftritt ohne versteckte Gebühren oder lange Vertragsbindungen.",
      },
      customers: {
        title: "Für Kunden",
        description:
          "Bestellen Sie bei lokalen Restaurants mit transparenten Preisen und ohne versteckte Aufschläge - egal ob zur Lieferung, Abholung oder am Tisch.",
      },
      drivers: {
        title: "Für Fahrer",
        description:
          "Faire Vergütung durch ein transparentes Bezahlmodell, flexible Einsatzzeiten und 100% Ihrer Trinkgelder bleiben bei Ihnen.",
      },
    },
    opensource: {
      title: "Open Source",
      paragraph1:
        "{{appName}} wird von einer Gemeinschaft von Entwicklern aufgebaut und gepflegt, die an die Kraft von Open Source glauben. Unser Code ist frei verfügbar für jeden, der ihn nutzen, modifizieren oder dazu beitragen möchte.",
      paragraph2:
        "Durch unseren Open-Source-Ansatz stellen wir sicher, dass unsere Plattform transparent, sicher und an den Interessen der Gemeinschaft ausgerichtet bleibt.",
      githubButton: "Auf GitHub ansehen",
      imageAlt: "Open-Source-Gemeinschaft",
    },
    join: {
      title: "Werden Sie Teil der Bewegung",
      description:
        "Ob Kunde, Restaurantbesitzer, Fahrer oder Entwickler - für jeden gibt es einen Platz in der {{appName}}-Gemeinschaft.",
      buttons: {
        order: "Essen bestellen",
        restaurant: "Restaurant anmelden",
        driver: "Fahrer werden",
      },
    },
  },

  // Language names
  languages: {
    EN: "English",
    ES: "Español",
    FR: "Français",
    IT: "Italiano",
    DE: "Deutsch",
    ZH: "中文",
  } as { [key in Languages]: string },

  // Country names
  countries: {
    DE: "Deutschland",
    AT: "Österreich",
    CH: "Schweiz",
  } as { [key in Countries]: string },

  // Add auth section
  auth: {
    login: {
      title: "Willkommen zurück",
      subtitle: "Melde dich an, um fortzufahren",
      emailLabel: "E-Mail",
      emailPlaceholder: "Gib deine E-Mail ein",
      passwordLabel: "Passwort",
      passwordPlaceholder: "Gib dein Passwort ein",
      rememberMe: "Angemeldet bleiben",
      forgotPassword: "Passwort vergessen?",
      loginButton: "Anmelden",
      noAccount: "Noch kein Konto?",
      or: "Oder",
      createAccount: "Konto erstellen",
      loginError: "Ungültige E-Mail oder Passwort",
    },
    signup: {
      title: "Konto erstellen",
      subtitle: "Registriere dich, um mit OpenEats zu beginnen",
      firstNameLabel: "Vorname",
      firstNamePlaceholder: "Gib deinen Vornamen ein",
      lastNameLabel: "Nachname",
      lastNamePlaceholder: "Gib deinen Nachnamen ein",
      emailLabel: "E-Mail",
      emailPlaceholder: "Gib deine E-Mail ein",
      passwordLabel: "Passwort",
      passwordPlaceholder: "Erstelle ein Passwort",
      confirmPasswordLabel: "Passwort bestätigen",
      confirmPasswordPlaceholder: "Bestätige dein Passwort",
      termsAndConditions: "Nutzungsbedingungen",
      privacyPolicy: "Datenschutzrichtlinie",
      agreeToTerms: "Ich stimme den {0} und der {1} zu",
      createAccountButton: "Konto erstellen",
      or: "Oder",
      alreadyHaveAccount: "Bereits ein Konto?",
      signIn: "Anmelden",
      signupError:
        "Bei der Erstellung deines Kontos ist ein Fehler aufgetreten",
      passwordRequirements: "Das Passwort muss mindestens 8 Zeichen lang sein",
      passwordsMustMatch: "Die Passwörter müssen übereinstimmen",
    },
    verifyEmail: {
      title: "E-Mail bestätigen",
      subtitle: "Bitte bestätige deine E-Mail-Adresse, um fortzufahren",
      checkInbox: "Wir haben einen Bestätigungslink an {email} gesendet",
      didNotReceiveEmail: "Keine E-Mail erhalten?",
      resendEmail: "Bestätigungs-E-Mail erneut senden",
      emailResent: "E-Mail erfolgreich erneut gesendet",
    },
    resetPassword: {
      title: "Passwort zurücksetzen",
      subtitle:
        "Gib deine E-Mail ein, um einen Link zum Zurücksetzen des Passworts zu erhalten",
      emailLabel: "E-Mail",
      emailPlaceholder: "Gib deine E-Mail ein",
      submitButton: "Zurücksetzungslink senden",
      backToLogin: "Zurück zur Anmeldung",
      emailSent: "E-Mail zum Zurücksetzen des Passworts gesendet",
      checkInbox: "Bitte überprüfe deinen Posteingang für weitere Anweisungen",
    },
  },
};

export default translations;
