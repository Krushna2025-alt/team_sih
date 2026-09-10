/** @type {import('tailwindcss').Config} */
export default {
content: ['./index.html', './src/**/*.{ts,tsx}'],
theme: {
extend: {
colors: {
farmer: { DEFAULT: '#16a34a', dark: '#15803d', light: '#dcfce7' },
buyer: { DEFAULT: '#2563eb', dark: '#1d4ed8', light: '#dbeafe' },
accent: { DEFAULT: '#ea580c', light: '#ffedd5' },
surface: '#f3f4f6',
},
},
},
plugins: [],
};
