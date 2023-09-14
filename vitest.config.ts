import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.tests.ts'],
    setupFiles: ['chai-plugins.ts'],
  },
})
