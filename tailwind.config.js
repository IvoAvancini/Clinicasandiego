/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chatwoot: {
          sidebar: '#1f2937',
          active: '#111827',
          primary: '#1f69ff',
          bg: '#f8fafc',
        }
      }
    },
  },
  plugins: [],
}
