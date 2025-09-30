import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mateusrnm.github.io.gamememories',
  appName: 'Game Memories',
  webDir: 'build',
  server: {
    hostname: 'localhost',
    androidScheme: 'https'
  }
  /*server: {
    url: 'http://192.168.1.14:5173', 
    cleartext: true
  }*/
};

export default config;
