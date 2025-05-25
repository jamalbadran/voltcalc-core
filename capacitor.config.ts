
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.05f76632f94048ca9038c3fc24137d80',
  appName: 'crypto-flip-exchange',
  webDir: 'dist',
  server: {
    url: 'https://05f76632-f940-48ca-9038-c3fc24137d80.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a1a',
      showSpinner: false
    }
  }
};

export default config;
