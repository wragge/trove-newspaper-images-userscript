import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.js',
      userscript: {
        namespace: 'glam-workbench.net/trove-newspaper-images',
        match: ['https://trove.nla.gov.au/newspaper/article/*'],
      },
    }),
  ],
  build: {
    // if you want to minify xxx.user.js, set true
    minify: false
  }
});
