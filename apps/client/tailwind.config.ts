import type { Config } from 'tailwindcss';
import sharedPreset from '../../packages/config/tailwind/preset';

export default {
  presets: [sharedPreset],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
} satisfies Config;
