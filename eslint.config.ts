import prettier from 'eslint-plugin-prettier/recommended'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'
import { fixupConfigRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import eslint from '@eslint/js'

const compat = new FlatCompat()

export default tseslint.config(
  prettier,
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  ...fixupConfigRules(compat.extends('plugin:@next/next/recommended')),
  ...fixupConfigRules(compat.extends('plugin:react/recommended')),
  ...fixupConfigRules(compat.extends('plugin:react-hooks/recommended')),
  ...fixupConfigRules(compat.extends('plugin:jsx-a11y/strict')),
  {
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 'latest'
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          semi: false,
          trailingComma: 'none'
        }
      ],
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            [
              '^\\u0000',
              '^\\w[^{}]*$',
              '^@\\w[^{}]*$',
              '^\\w.*\\{.*\\}',
              '^@\\w.*\\{.*\\}',
              '^\\.'
            ]
          ]
        }
      ],
      'simple-import-sort/exports': 'warn'
    }
  },
  { ignores: ['.next', 'prisma/build'] }
)
