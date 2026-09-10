import os

vite_config = """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
})
"""

tsconfig = """{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
"""

tailwind_config = """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        oil: {
          900: '#070B14',
          850: '#0B1120',
          800: '#0F172A',
          750: '#15203B',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
          400: '#64748B',
          accent: '#0284C7',
          amber: '#F59E0B',
          red: '#EF4444',
          green: '#10B981',
          gold: '#FBBF24'
        }
      }
    },
  },
  plugins: [],
}
"""

postcss_config = """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"""

index_html = """<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OIL SIF SENTINEL | AI-Powered Safety Precursor Intelligence</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#070B14] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"""

files = {
    'frontend/vite.config.ts': vite_config,
    'frontend/tsconfig.json': tsconfig,
    'frontend/tailwind.config.js': tailwind_config,
    'frontend/postcss.config.js': postcss_config,
    'frontend/index.html': index_html
}

for path, content in files.items():
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
print('Created frontend configuration files.')
