/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./projects/**/src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js" 
  ],
  theme: {
    extend: {
      borderWidth: {
        '1': '1px'
      },
      spacing: {
        '57': '57.5px',
      }
  
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

