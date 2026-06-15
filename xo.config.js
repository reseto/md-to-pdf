module.exports = [
	{
		ignores: ['src/test/mathjax/**', 'xo.config.js'],
	},
	{
		prettier: true,
		rules: {
			// Project ships CommonJS (tsconfig `module: commonjs`) with extensionless TS imports.
			'unicorn/prefer-module': 'off',
			'unicorn/prefer-top-level-await': 'off',
			'import-x/extensions': 'off',
			'n/prefer-global/process': 'off',
			'n/prefer-global/buffer': 'off',

			// `snake_case` config keys are part of the public API (e.g. body_class, document_title).
			'@typescript-eslint/naming-convention': 'off',

			// The library accepts untyped JSON options (marked, puppeteer, gray-matter), so assertions are unavoidable.
			'@typescript-eslint/no-unsafe-type-assertion': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/strict-void-return': 'off',

			// `Buffer` is part of the public API surface (Puppeteer returns Buffers).
			'@typescript-eslint/no-restricted-types': 'off',

			// `utf-8` is intentional (matches HTML <meta charset> and HTTP Content-Type spellings).
			'unicorn/text-encoding-identifier-case': 'off',

			// The `v` regexp flag targets ES2024; keep the existing patterns as-is.
			'require-unicode-regexp': 'off',

			// Existing code uses `(await x).prop` and untyped catch callbacks deliberately.
			'unicorn/no-await-expression-member': 'off',
			'@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',

			// Import grouping/order is left to the author (comments interleave the import blocks).
			'import-x/order': 'off',

			// Allow the inline `typeof import('../cli')` annotation used to avoid a circular import.
			'@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],

			// One generated/parsing function legitimately exceeds the default complexity budget.
			complexity: 'off',

			// Carried over from the previous config.
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-confusing-void-expression': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/prefer-readonly-parameter-types': 'off',
			'@typescript-eslint/prefer-nullish-coalescing': 'off',
			camelcase: 'off',
			'capitalized-comments': 'off',
			'no-await-in-loop': 'off',
			'no-promise-executor-return': 'off',
			'no-redeclare': 'off',
			'unicorn/no-array-callback-reference': 'off',
			'unicorn/string-content': 'off',
		},
	},
	{
		files: ['**/*.spec.ts'],
		rules: {
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
		},
	},
];
