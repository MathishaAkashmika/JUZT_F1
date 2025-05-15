/** @type {import('tailwindcss').Config} */
module.exports = {
    // ...existing config...
    theme: {
        extend: {
            // ...other extensions
            animation: {
                'fadeIn': 'fadeIn 0.5s ease-in-out',
                'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulse: {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.7 },
                },
            },
            scale: {
                '102': '1.02',
                '98': '0.98',
            },
        },
    },
    plugins: [
        // ...existing plugins
        require('tailwind-scrollbar'),
    ],
    // ...rest of config...
}
