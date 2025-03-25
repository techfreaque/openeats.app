import 'dotenv/config';

export default {
  expo: {
    name: "Open Delivery",
    slug: "openeats",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./src/assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      favicon: "./src/assets/images/favicon.png"
    },
    plugins: [
      "expo-router"
    ],
    extra: {
      BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3000",
      eas: {
        projectId: "b742decb-5007-48d3-94e3-d9f24572ddf2"
      }
    }
  }
};
