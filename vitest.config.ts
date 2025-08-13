import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/**/*.test.ts'],
        testTimeout: 30000,
        hookTimeout: 30000,
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: true
            }
        }
    },
    // Optional: only if your tsconfig isn’t picked up or you don’t use the plugin
    resolve: {
        alias: { '@': '/src' } // <-- change to match your actual root
    },
});
