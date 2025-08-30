module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: [
    'airbnb-base'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Game development specific rules
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    
    // Allow certain patterns common in game development
    'no-underscore-dangle': ['error', { 
      allowAfterThis: true,
      allowAfterSuper: true,
      allow: ['_id', '_data', '_cache']
    }],
    
    // Relaxed rules for better game code readability
    'max-len': ['warn', { 
      code: 120, 
      ignoreComments: true, 
      ignoreStrings: true,
      ignoreTemplateLiterals: true
    }],
    
    'prefer-destructuring': ['error', {
      array: false,
      object: true
    }],
    
    // Allow for...of loops (useful for game collections)
    'no-restricted-syntax': [
      'error',
      'ForInStatement',
      'LabeledStatement',
      'WithStatement'
    ],
    
    // Allow reassignment of function parameters (common in game state)
    'no-param-reassign': ['error', { 
      props: false 
    }],
    
    // Allow certain global patterns
    'no-plusplus': ['error', { 
      allowForLoopAfterthoughts: true 
    }],
    
    // Game development often uses complex expressions
    'no-mixed-operators': 'off',
    
    // Performance: allow direct property access
    'dot-notation': ['error', { 
      allowKeywords: true,
      allowPattern: '^[a-z]+(_[a-z]+)+$'
    }],

    // Import rules for game modules
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'off',
    'import/extensions': ['error', 'never', {
      json: 'always',
      css: 'always'
    }]
  },
  
  // Game-specific globals
  globals: {
    // IndexedDB and modern browser APIs
    IDBKeyRange: 'readonly',
    
    // Game-specific globals (if needed)
    BATTLETECH_CONFIG: 'readonly',
    
    // Development/testing globals
    __DEV__: 'readonly',
    __PROD__: 'readonly',
    __VERSION__: 'readonly'
  },

  // Override rules for different file types
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        'no-unused-expressions': 'off'
      }
    },
    {
      files: ['src/data/**/*.js'],
      rules: {
        'max-len': 'off', // Data files can have long lines
        'object-curly-newline': 'off'
      }
    },
    {
      files: ['config/**/*.js'],
      env: {
        node: true,
        browser: false
      },
      rules: {
        'import/no-extraneous-dependencies': ['error', {
          devDependencies: true
        }]
      }
    }
  ]
};