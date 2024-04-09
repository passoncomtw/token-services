const packageJson = require("./package.json");

module.exports = {
  expo: {
    extra: {
      eas: {
        projectId: "f0d772ac-e731-4047-8f39-964ec91da89f",
      },
    },
    name: "豐盈錢包",
    slug: packageJson.name,
    version: packageJson.version,
    orientation: "portrait",
    icon: "./src/assets/icon-beta.png",
    userInterfaceStyle: "light",
    platforms: ["ios", "android"],
    splash: {
      image: "./src/assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      bundleIdentifier: "com.passontw.tokenwallet",
      supportsTablet: true,
      buildNumber: '2',
    },
    android: {
      package: "com.passontw.tokenwallet",
      versionCode: 2,
      adaptiveIcon: {
        foregroundImage: "./src/assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      favicon: "./src/assets/favicon.png",
    },
  },
};
