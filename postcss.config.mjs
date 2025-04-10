/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    // You might need autoprefixer as well, common in Next.js setups
    // If you see styling issues later, uncomment or add this:
    // autoprefixer: {},
  },
};

export default config;
