export default {
  packagerConfig: {
    asar: true,
    name: 'Leviathan',
    executableName: 'leviathan-desktop',
    appBundleId: 'com.leviathan.desktop',
    icon: './buildResources/icon',
    extraResource: [],
    osxSign: false, // Disable signing for development
    osxNotarize: false, // Disable notarization for development
    ignore: [
      /^\/\.git$/,
      /^\/\.vscode$/,
      /^\/docs$/,
      /^\/agent$/,
      /^\/os$/,
      /^\/workshop$/,
      /^\/out$/,
      /^\/dist$/,
      /^\/test-results$/,
      /^\/tests$/,
      /^\/scripts$/,
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
        name: 'leviathan_desktop',
        setupIcon: './buildResources/icon.ico',
        authors: 'Leviathan Team',
        description: 'Leviathan AI-Native Desktop Service Manager'
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
        name: 'Leviathan',
        overwrite: true
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: './buildResources/icon.png',
          maintainer: 'Leviathan Team',
          homepage: 'https://github.com/leviathan',
          categories: ['Development', 'Utility'],
          description: 'Leviathan AI-Native Desktop Service Manager'
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
          owner: 'leviathan-os',
          name: 'leviathan'
        },
        prerelease: false,
        draft: true,
        generateReleaseNotes: true
      }
    }
  ]
};