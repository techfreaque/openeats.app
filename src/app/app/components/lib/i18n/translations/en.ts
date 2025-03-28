import type { TranslationSchema } from "../types";

// English translations
const translations: TranslationSchema = {
  common: {
    appName: "OpenEats",
    openSource: "Open Source",
    search: "Search",
    filter: "Filter",
    loading: "Loading...",
    noResults: "No results found",
    clearFilters: "Clear Filters",
    applyFilters: "Apply Filters",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    submit: "Submit",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    remove: "Remove",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
    continue: "Continue",
    goBack: "Go Back",
    viewAll: "View All",
    seeMore: "See More",
    seeLess: "See Less",
    showMore: "Show More",
    showLess: "Show Less",
    readMore: "Read More",
    readLess: "Read Less",
    learnMore: "Learn More",
    getStarted: "Get Started",
    signIn: "Sign In",
    signOut: "Sign Out",
    signUp: "Sign Up",
    register: "Register",
    login: "Login",
    logout: "Logout",
    myAccount: "My Account",
    myProfile: "My Profile",
    myOrders: "My Orders",
    myFavorites: "My Favorites",
    cart: "Cart",
    checkout: "Checkout",
    orderNow: "Order Now",
    orderAgain: "Order Again",
    orderHistory: "Order History",
    orderDetails: "Order Details",
    orderConfirmation: "Order Confirmation",
    orderSummary: "Order Summary",
    orderTotal: "Order Total",
    orderStatus: "Order Status",
    orderDate: "Order Date",
    orderNumber: "Order Number",
    orderItems: "Order Items",
    deliveryAddress: "Delivery Address",
    deliveryTime: "Delivery Time",
    deliveryFee: "Delivery Fee",
    deliveryInstructions: "Delivery Instructions",
    deliveryDetails: "Delivery Details",
    pickupDetails: "Pickup Details",
    pickupTime: "Pickup Time",
    pickupLocation: "Pickup Location",
    pickupInstructions: "Pickup Instructions",
    subtotal: "Subtotal",
    tax: "Tax",
    total: "Total",
    tip: "Tip",
    fees: "Fees",
    discount: "Discount",
    promoCode: "Promo Code",
    applyPromoCode: "Apply Promo Code",
    addPromoCode: "Add Promo Code",
    removePromoCode: "Remove Promo Code",
    invalidPromoCode: "Invalid Promo Code",
    paymentMethod: "Payment Method",
    addPaymentMethod: "Add Payment Method",
    editPaymentMethod: "Edit Payment Method",
    removePaymentMethod: "Remove Payment Method",
    creditCard: "Credit Card",
    debitCard: "Debit Card",
    paypal: "PayPal",
    applePay: "Apple Pay",
    googlePay: "Google Pay",
    cash: "Cash",
    cardNumber: "Card Number",
    cardholderName: "Cardholder Name",
    expirationDate: "Expiration Date",
    cvv: "CVV",
    billingAddress: "Billing Address",
    billingAddressSameAsDelivery: "Billing address same as delivery",
    saveForFutureUse: "Save for future use",
    addAddress: "Add Address",
    editAddress: "Edit Address",
    removeAddress: "Remove Address",
    address: "Address",
    addressLine1: "Address Line 1",
    addressLine2: "Address Line 2",
    city: "City",
    state: "State",
    zipCode: "Zip Code",
    country: "Country",
    phoneNumber: "Phone Number",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    rememberMe: "Remember Me",
    stayLoggedIn: "Stay Logged In",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    createAccount: "Create Account",
    createPassword: "Create Password",
    firstName: "First Name",
    lastName: "Last Name",
    fullName: "Full Name",
    username: "Username",
    bio: "Bio",
    website: "Website",
    socialMedia: "Social Media",
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
    home: "Home",
    restaurants: "Restaurants",
    markets: "Markets",
    localShops: "Local Shops",
    partners: "For Partners",
    drivers: "For Drivers",
    about: "About",
    profile: "Profile",
    orders: "Orders",
    favorites: "Favorites",
    cart: "Cart",
    signIn: "Sign In",
    signOut: "Sign Out",
    backToOpenEats: "Back to OpenEats",
    searchPlaceholder: "Search for food, restaurants...",
    toggleMenu: "Toggle Menu",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    theme: "Theme",
  },

  // Home page
  home: {
    hero: {
      title: "Local food and goods, no hidden fees",
      subtitle:
        "Order from local restaurants, markets, and shops with free delivery and pickup. Open source and community-driven.",
      findFoodButton: "Find Food",
      deliveryAddressPlaceholder: "Enter delivery address",
    },
    categories: {
      title: "Categories",
      viewAll: "View All",
    },
    restaurantsNearYou: {
      title: "Restaurants Near You",
      delivery: "Delivery",
      pickup: "Pickup",
      noRestaurants: "No restaurants found",
      noPickup: "No pickup restaurants available in this area",
    },
    popularRestaurants: {
      title: "Popular Restaurants",
    },
    featuredRestaurants: {
      title: "Featured Restaurants",
    },
    ownRestaurant: {
      title: "Own a Restaurant?",
      subtitle:
        "Join our platform and reach more customers with our fair, transparent pricing.",
      getStarted: "Get Started",
    },
    footer: {
      about: "About",
      ourMission: "Our Mission",
      howItWorks: "How It Works",
      community: "Community",
      contribute: "Contribute",
      forPartners: "For Partners",
      joinAsRestaurant: "Join as Restaurant",
      partnerBenefits: "Partner Benefits",
      successStories: "Success Stories",
      partnerPortal: "Partner Portal",
      forDrivers: "For Drivers",
      becomeDriver: "Become a Driver",
      driverApp: "Driver App",
      earnings: "Earnings",
      driverSupport: "Driver Support",
      downloadApp: "Download Our App",
      appStore: "App Store",
      googlePlay: "Google Play",
      noHiddenFees: "No Hidden Fees",
      feeDescription:
        "OpenEats is free for users and partners. Only online payments incur a small processing fee.",
      copyright: "© {{year}} OpenEats. Open source under MIT License.",
    },
  },

  // Restaurant page
  restaurant: {
    promoted: "Promoted",
    addToFavorites: "Add to favorites",
    removeFromFavorites: "Remove from favorites",
    categories: "Categories:",
    reviews: "reviews",
    deliveryTime: "Delivery:",
    minutes: "min",
    hours: "Hours",
    orderTypeSelector: {
      delivery: "Delivery",
      pickup: "Pickup",
      dineIn: "Dine-In",
      deliveryTooltip: "Delivery to your address",
      pickupTooltip: "Pickup from restaurant",
      dineInTooltip: "Order while at restaurant",
    },
    menu: {
      viewFullMenu: "View Full Menu",
      readyToOrder: "Ready to Order?",
      exploreMenu:
        "Explore our full menu and place your order for delivery or pickup.",
    },
    about: {
      title: "About Us",
      defaultContent:
        "was founded with a simple mission: to serve delicious, high-quality food made with the freshest ingredients. Our team of experienced chefs is dedicated to creating memorable dining experiences for our customers, whether you're dining in, picking up, or ordering delivery. We take pride in being a part of the community and look forward to serving you soon!",
      values: "Our Values",
      freshIngredients: {
        title: "Fresh Ingredients",
        description:
          "We source the freshest ingredients from local suppliers to ensure quality in every dish.",
      },
      expertChefs: {
        title: "Expert Chefs",
        description:
          "Our team of experienced chefs brings passion and expertise to create exceptional flavors.",
      },
      communityFocus: {
        title: "Community Focus",
        description:
          "We're proud to be part of the community and strive to give back whenever possible.",
      },
      team: "Meet Our Team",
      headChef: "Head Chef",
      restaurantManager: "Restaurant Manager",
      owner: "Owner",
    },
    contact: {
      title: "Contact Us",
      restaurantInfo: "Restaurant Information",
      address: "Address",
      phone: "Phone",
      email: "Email",
      hours: "Hours",
      sendMessage: "Send Us a Message",
      namePlaceholder: "Name",
      emailPlaceholder: "Email",
      messagePlaceholder: "Message",
      sendButton: "Send Message",
      sending: "Sending...",
      messageSent: "Message sent",
      messageSentDescription: "We'll get back to you as soon as possible",
      missingInfo: "Missing information",
      missingInfoDescription: "Please fill in all fields",
    },
  },

  // Menu items
  menuItem: {
    add: "Add",
    quantity: "Quantity",
    specialInstructions: "Special Instructions",
    specialInstructionsPlaceholder: "Any special requests or allergies?",
    addToCart: "Add to Cart",
    cancel: "Cancel",
  },

  // Reviews
  reviews: {
    title: "Reviews",
    noReviews: "No reviews yet. Be the first to leave a review!",
    hideItemReviews: "Hide item reviews",
    showItemReviews: "Show {{count}} item {{reviewText}}",
    reviewSingular: "review",
    reviewPlural: "reviews",
    rateRestaurant: "Rate the Restaurant",
    selectRating: "Select rating",
    stars: "stars",
    experiencePlaceholder: "Share your experience with this restaurant...",
    rateItems: "Rate the Items You Ordered",
    rateItemsDescription: "Please rate at least one item",
    itemThoughtPlaceholder: "What did you think of the {{itemName}}?",
    submitReview: "Submit Review",
    submitting: "Submitting...",
    signInRequired: "Sign in required",
    signInRequiredDescription: "Please sign in to leave a review",
    ratingRequired: "Rating required",
    ratingRequiredDescription: "Please rate the restaurant",
    productRatingRequired: "Product rating required",
    productRatingRequiredDescription: "Please rate at least one product",
  },

  // Location selector
  location: {
    setLocation: "Set location",
    setLocationDescription:
      "Enter your address or allow us to detect your current location.",
    useCurrentLocation: "Use current location",
    detecting: "Detecting...",
    enterAddress: "Enter your address...",
    suggestions: "Suggestions",
    locationDetected: "Location detected",
    locationDetectedDescription:
      "Your location has been set to coordinates near {{location}}",
    locationAccessDenied: "Location access denied",
    locationAccessDeniedDescription:
      "We've set a default location. You can change it manually.",
    locationNotSupported: "Location not supported",
    locationNotSupportedDescription:
      "Geolocation is not supported by your browser. Please enter your location manually.",
  },

  // Search page
  search: {
    title: "Search Results",
    resultsFor: '{{count}} results for "{{query}}"',
    searchPlaceholder: "Search restaurants...",
    filters: "Filters",
    refineSearch: "Refine your search results",
    sortBy: "Sort By",
    relevance: "Relevance",
    rating: "Rating",
    deliveryTime: "Delivery Time",
    priceLowToHigh: "Price (Low to High)",
    priceHighToLow: "Price (High to Low)",
    priceRange: "Price Range",
    inexpensive: "$ (Inexpensive)",
    moderate: "$$ (Moderate)",
    expensive: "$$$ (Expensive)",
    dietary: "Dietary",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    glutenFree: "Gluten-Free",
    clearAll: "Clear All",
    applyFilters: "Apply Filters",
    restaurantsFound: "{{count}} {{restaurantText}} Found",
    restaurantSingular: "Restaurant",
    restaurantPlural: "Restaurants",
    noRestaurantsFound: "No restaurants found matching your search criteria",
    noPickupRestaurants:
      "No pickup restaurants available matching your search criteria",
  },

  // Cart
  cart: {
    title: "Your Cart",
    empty: "Your cart is empty",
    startShopping: "Start shopping",
    continueShopping: "Continue shopping",
    itemsInCart: "{{count}} items in cart",
    subtotal: "Subtotal",
    deliveryFee: "Delivery Fee",
    tax: "Tax",
    total: "Total",
    checkout: "Checkout",
    remove: "Remove",
    specialInstructions: "Special Instructions:",
    quantity: "Quantity:",
    from: "from",
  },

  // Checkout
  checkout: {
    title: "Checkout",
    deliveryDetails: "Delivery Details",
    deliveryAddress: "Delivery Address",
    changeAddress: "Change",
    deliveryInstructions: "Delivery Instructions",
    deliveryInstructionsPlaceholder: "Add instructions for the driver...",
    contactDetails: "Contact Details",
    name: "Name",
    phone: "Phone",
    email: "Email",
    paymentMethod: "Payment Method",
    creditCard: "Credit Card",
    paypal: "PayPal",
    applePay: "Apple Pay",
    googlePay: "Google Pay",
    cash: "Cash on Delivery",
    cardNumber: "Card Number",
    cardholderName: "Cardholder Name",
    expiryDate: "Expiry Date",
    cvv: "CVV",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    deliveryFee: "Delivery Fee",
    tax: "Tax",
    total: "Total",
    placeOrder: "Place Order",
    placingOrder: "Placing Order...",
    orderPlaced: "Order Placed",
    orderPlacedDescription: "Your order has been placed successfully",
    orderFailed: "Order Failed",
    orderFailedDescription:
      "There was an error placing your order. Please try again.",
  },

  // Profile
  profile: {
    title: "My Profile",
    personalInfo: "Personal Information",
    name: "Name",
    email: "Email",
    phone: "Phone",
    addresses: "Addresses",
    addAddress: "Add Address",
    editAddress: "Edit Address",
    deleteAddress: "Delete Address",
    defaultAddress: "Default Address",
    makeDefault: "Make Default",
    paymentMethods: "Payment Methods",
    addPaymentMethod: "Add Payment Method",
    editPaymentMethod: "Edit Payment Method",
    deletePaymentMethod: "Delete Payment Method",
    defaultPaymentMethod: "Default Payment Method",
    preferences: "Preferences",
    language: "Language",
    notifications: "Notifications",
    emailNotifications: "Email Notifications",
    pushNotifications: "Push Notifications",
    smsNotifications: "SMS Notifications",
    saveChanges: "Save Changes",
    saving: "Saving...",
    changesSaved: "Changes Saved",
    changesSavedDescription: "Your changes have been saved successfully",
    changesFailed: "Changes Failed",
    changesFailedDescription:
      "There was an error saving your changes. Please try again.",
  },

  // Language names (for language selector)
  languages: {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    zh: "中文",
  },

  auth: {
    login: {
      title: "Welcome Back",
      subtitle: "Log in to your account to continue",
      emailLabel: "Email",
      emailPlaceholder: "Enter your email",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      loginButton: "Log In",
      noAccount: "Don't have an account?",
      or: "Or",

      createAccount: "Create an account",
      loginError: "Invalid email or password",
    },
    signup: {
      title: "Create an Account",
      subtitle: "Sign up to get started with OpenEats",
      firstNameLabel: "First Name",
      firstNamePlaceholder: "Enter your first name",
      lastNameLabel: "Last Name",
      lastNamePlaceholder: "Enter your last name",
      emailLabel: "Email",
      emailPlaceholder: "Enter your email",
      passwordLabel: "Password",
      passwordPlaceholder: "Create a password",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "Confirm your password",
      termsAndConditions: "Terms and Conditions",
      privacyPolicy: "Privacy Policy",
      agreeToTerms: "I agree to the {0} and {1}",
      createAccountButton: "Create Account",
      alreadyHaveAccount: "Already have an account?",
      or: "Or",
      signIn: "Sign in",
      signupError: "There was an error creating your account",
      passwordRequirements: "Password must be at least 8 characters",
      passwordsMustMatch: "Passwords must match",
    },
    verifyEmail: {
      title: "Verify Your Email",
      subtitle: "Please verify your email address to continue",
      checkInbox: "We've sent a verification link to {email}",
      didNotReceiveEmail: "Didn't receive an email?",
      resendEmail: "Resend verification email",
      emailResent: "Email resent successfully",
    },
    resetPassword: {
      title: "Reset Password",
      subtitle: "Enter your email to receive a password reset link",
      emailLabel: "Email",
      emailPlaceholder: "Enter your email",
      submitButton: "Send Reset Link",
      backToLogin: "Back to login",
      emailSent: "Password reset email sent",
      checkInbox: "Please check your inbox for further instructions",
    },
  },
};

export default translations;
