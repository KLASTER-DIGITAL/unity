import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './tests/setup.ts',
		// Exclude Playwright E2E specs from Vitest (run via npm run test:e2e instead)
		exclude: ['node_modules', 'dist', 'tests/e2e/**', '.{git,cache,output,temp}/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: ['node_modules/', 'tests/', '**/*.d.ts', '**/*.config.*', '**/mockData'],
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
