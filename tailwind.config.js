/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './src/screens/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#120C1E',
        banner: '#312743', //'#1E172C'
        button: '#2b7bbb',
        blue: '#0076BD',
        text: '#A2B9DF',
        gray: '#1D1F24',
      },
    },
  },
  plugins: [],
};
