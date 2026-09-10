css_code = """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #070B14;
    color: #F1F5F9;
    overflow-x: hidden;
  }
}

/* Custom industrial scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #0B1120;
}
::-webkit-scrollbar-thumb {
  background: #1E293B;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #334155;
}

/* Safety glow utility classes */
.glow-critical {
  box-shadow: 0 0 20px -5px rgba(239, 68, 68, 0.4);
}
.glow-warning {
  box-shadow: 0 0 20px -5px rgba(245, 158, 11, 0.3);
}
.glow-cyan {
  box-shadow: 0 0 20px -5px rgba(14, 165, 233, 0.3);
}

.glass-card {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(51, 65, 85, 0.6);
}
"""

with open('frontend/src/index.css', 'w', encoding='utf-8') as f:
    f.write(css_code)
print('Created index.css')
