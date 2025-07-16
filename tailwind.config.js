/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './styles/**/*.css'
    ],
    theme: {
        extend: {
            colors: {
                'ind-red':   '#E2221C',
                'ind-blue':  '#00205B',
                'ind-black': '#1B1B1B',
            }
        }
    },
    plugins: [],
}
