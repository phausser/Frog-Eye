export default {
  // VITE_BASE_URL is set in the CD workflow to /<repo-name>/ for GitHub Pages
  base:      process.env.VITE_BASE_URL || '/',
  root:      '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    target: 'es2022',
  },
  test: {
    environment: 'node',
    include:     ['tests/**/*.test.js'],
  },
};
