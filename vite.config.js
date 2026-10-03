import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// React Compiler only applies to the admin dashboard (src/Dashboard) —
// that's the codebase it was actually written against (see its standing
// rule about optional-chaining nullable values, since the compiler
// evaluates property accesses unconditionally before runtime guards run).
// The public site predates that rule, so auto-memoizing it too could
// surface latent issues it was never checked against.
const reactCompilerConfig = {
  target: '19',
  sources: (filename) => filename.includes('/src/Dashboard/'),
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', reactCompilerConfig]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@context': path.resolve(__dirname, './src/context'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },
})

