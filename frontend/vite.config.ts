import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['bus.png'],
      manifest: {
        name: 'Bus Tracker',
        short_name: 'BusTracker',
        description: 'Smart Bus Tracking System',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'bus.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    }),
    {
      name: 'startup-logger',
      configureServer(server) {
        server.httpServer?.once('listening', () => {
          const address = server.httpServer?.address();
          let host = 'localhost';
          let port = 5173;
          if (typeof address === 'object' && address && 'port' in address) {
            port = address.port;
            if (address.address && address.address !== '::') {
              host = address.address;
            }
          }
          console.log('\n🎨 Smart Bus Tracker Frontend Started!');
          console.log('=====================================');
          console.log(`🎨 Frontend running at http://localhost:${port}`);
          console.log(`🌍 LAN Access: http://${host}:${port}`);
          console.log('=====================================\n');
        });
      }
    }
  ],
  server: {
    host: true, // Enable LAN access
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});