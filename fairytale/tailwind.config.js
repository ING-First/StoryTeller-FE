/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pinkfong: ['Pinkfong', 'sans-serif'],
        child: ['Child', 'sans-serif']
      }
    }
  },
  safelist: [{pattern: /^line-clamp-(\d+)$/}],
  plugins: [require('@tailwindcss/line-clamp'), require('daisyui')]
}
