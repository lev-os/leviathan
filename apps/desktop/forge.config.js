export default {
  packagerConfig: {
    asar: true,
    name: 'TraderStack',
    executableName: 'trader-stack',
    appBundleId: 'com.mpup.traderstack',
    icon: './buildResources/icon',
    extraResource: [
      './packages/tg/.env.devnet',
      './devnet-keypair.json',
      './packages/crypto-hedge-fund'
    ],
    osxSign: false, // Disable signing for development
    osxNotarize: false, // Disable notarization for development
    ignore: [
      /^\/\.git$/,
      /^\/\.vscode$/,
      /^\/\.memory$/,
      /^\/docs$/,
      /^\/out$/,
      /^\/dist$/,
      /^\/test-results$/,
      /^\/tests$/,
      /^\/scripts$/,
      /^\/ai-hedge-fund$/,
      /^\/research$/,
      /\.md$/,
      /\.map$/,
      /\.ts$/,
      /\.tsx$/,
      /^\/packages\/.*\/src$/,
      /^\/packages\/.*\/\.next$/,
      /^\/packages\/.*\/node_modules$/,
      /^\/packages\/.*\/tests$/,
      /^\/packages\/.*\/coverage$/,
      /^\/\.next$/,
      /^\/forge-.*\.js$/,
      /^\/start-dev\.js$/,
      /^\/electron-builder\.mjs$/,
      /^\/forge-migration-report\.json$/,
      'node_modules/.cache',
      'node_modules/.vite',
      /\.DS_Store$/
    ]
  },
  
  rebuildConfig: {
    force: true,
    onlyModules: ['better-sqlite3']
  },
  
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'trader_stack',
        setupIcon: './buildResources/icon.ico',
        authors: 'MPUP Labs',
        description: 'AI-powered Solana trading platform'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        icon: './buildResources/icon.icns',
        name: 'TraderStack',
        overwrite: true
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: './buildResources/icon.png',
          maintainer: 'MPUP Labs',
          homepage: 'https://mpup.ai',
          categories: ['Finance', 'Development'],
          description: 'AI-powered Solana trading platform'
        }
      }
    }
  ],
  
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    }
  ],
  
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'mpup-labs',
          name: 'trader-stack'
        },
        prerelease: false,
        draft: true,
        generateReleaseNotes: true
      }
    }
  ]
};