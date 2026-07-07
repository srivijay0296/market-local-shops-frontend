import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.nammamarket.app",
  appName: "Namma Market",
  webDir: "dist",
  server: {
    androidScheme: "https"
  }
};

export default config;
