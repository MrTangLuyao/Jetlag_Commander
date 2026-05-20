/* Tailwind runtime config — M3 tokens. Load AFTER tailwindcss.js. */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        m3: {
          surface: '#1f1f1e',
          surfaceContainer: '#2a2a29',
          surfaceContainerHigh: '#333332',
          primary: '#d97757',
          onPrimary: '#ffffff',
          primaryContainer: 'rgba(217, 119, 87, 0.15)',
          onPrimaryContainer: '#ffb49d',
          outline: '#4a4a49',
          outlineVariant: '#3a3a39',
          onSurface: '#e8e8e8',
          onSurfaceVariant: '#a1a1a0'
        }
      },
      fontFamily: {
        sans: ['JetBrains Mono', 'HarmonyOS Sans', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      borderRadius: {
        'm3-xs': '4px',
        'm3-sm': '8px',
        'm3-md': '12px',
        'm3-lg': '16px',
        'm3-xl': '24px',
        'm3-full': '9999px',
      }
    }
  }
};
