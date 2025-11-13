import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'complain-app',
  webDir: 'public',
  server: {
    url: "https://complain-app-iota.vercel.app/admin/login/", // 👈 Android emulator loads from your Next.js dev server
    cleartext: true
  }
};

export default config;
