import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { labelFor } from '@wolffm/catalogue'

// THE APP'S ID — the one identifier this repo states about itself. The display
// NAME is looked up from it, so the two can never disagree. Must match the `id`
// in hadoku_site's spec/categories.json.
const APP_ID = 'aggregator'

// Read from the catalogue at CONFIG TIME (this file runs in node), so the name
// is never written down in this repo and the catalogue never ships in the bundle.
const APP_NAME = labelFor(APP_ID) ?? APP_ID

export default defineConfig({
  define: {
    // The standalone name. Mounted by the host, `appName` in the registry props
    // carries the live value and this is never read.
    __HADOKU_APP_NAME__: JSON.stringify(APP_NAME)
  },
  plugins: [
    {
      // index.html is static and cannot import the catalogue; this keeps the
      // standalone TAB and the standalone HEADER the one name.
      name: 'hadoku-app-name',
      transformIndexHtml: (html: string) => html.split('__HADOKU_APP_NAME__').join(APP_NAME)
    },
    react()
  ],
  build: {
    // The favicon in public/ is for the `vite dev` harness only. This bundle is
    // a library mounted into hadoku.me, which serves its own favicon from the
    // site root — so copying public/ into dist/ would ship a stray 14 kB asset
    // in the published package and nothing would ever read it.
    copyPublicDir: false,
    lib: {
      entry: 'src/entry.tsx',
      formats: ['es'],
      fileName: () => 'index.js'
    },
    rollupOptions: {
      // Externalize peer dependencies (parent provides them via its import
      // map). @wolffm/task-ui-components MUST be external: HadokuThemeRoot
      // (from the mapped @wolffm/themes) provides theme context through the
      // parent's shared ui-components module, and an inlined copy here reads
      // a different context instance — AppHeader then throws "No
      // <HadokuThemeRoot> above this component" (2026-08-05 outage).
      // logger/client and prefs-client are likewise parent-shared singletons.
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        '@wolffm/themes',
        '@wolffm/task-ui-components',
        '@wolffm/logger/client',
        '@wolffm/prefs-client',
        '@wolffm/prefs-client/react',
        // zod is in the parent's import map too, and reaches this bundle via
        // src/prefs/aggregatorPrefs.ts. Not a singleton — a second copy is
        // weight, not a broken context — but weight for nothing:
        // @wolffm/themes imports zod BARE from its themePrefs.js, so the page
        // fetches esm.sh/zod whether or not this bundle carries a copy.
        // Verified on the live site 2026-08-18. The rule is mechanical:
        // anything the import map provides that you import belongs here.
        'zod'
      ],
      output: {
        assetFileNames: 'style.css'
      }
    },
    target: 'es2022',
    minify: 'esbuild',
    cssCodeSplit: false
  }
})
