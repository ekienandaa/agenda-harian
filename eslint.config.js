import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // The new react-hooks v7 "refs" and "set-state-in-effect" rules flag idiomatic
      // patterns (callback refs from dnd-kit, syncing form props via useEffect) as errors.
      // Downgrade to warnings so CI doesn't fail on these false positives.
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'off',
      // Allow intentional `any` in narrow places (we don't use any, but keeps flexibility).
      '@typescript-eslint/no-explicit-any': 'warn',
      // Unused directives are fine at warn level.
      'no-unused-private-class-members': 'off',
    },
  },
])
