import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';
import tar from 'tar';

const execAsync = promisify(exec);

interface PythonUrls {
  'darwin-x64': string;
  'darwin-arm64': string;
  'win32-x64': string;
  'linux-x64': string;
}

export class PythonRuntime {
  private pythonDir: string;
  private pythonExecutable: string;
  private isInitialized: boolean = false;

  // Python-build-standalone URLs (update these with latest versions)
  private readonly PYTHON_URLS: PythonUrls = {
    'darwin-x64': 'https://github.com/indygreg/python-build-standalone/releases/download/20240107/cpython-3.11.7+20240107-x86_64-apple-darwin-install_only.tar.gz',
    'darwin-arm64': 'https://github.com/indygreg/python-build-standalone/releases/download/20240107/cpython-3.11.7+20240107-aarch64-apple-darwin-install_only.tar.gz',
    'win32-x64': 'https://github.com/indygreg/python-build-standalone/releases/download/20240107/cpython-3.11.7+20240107-x86_64-pc-windows-msvc-shared-install_only.tar.gz',
    'linux-x64': 'https://github.com/indygreg/python-build-standalone/releases/download/20240107/cpython-3.11.7+20240107-x86_64-unknown-linux-gnu-install_only.tar.gz'
  };

  constructor() {
    this.pythonDir = path.join(app.getPath('userData'), 'python-runtime');
    this.pythonExecutable = this.getPythonExecutable();
  }

  private getPythonExecutable(): string {
    const platform = process.platform;
    const pythonBin = platform === 'win32' ? 'python.exe' : 'bin/python3';
    return path.join(this.pythonDir, 'python', pythonBin);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('Initializing Python runtime...');

    // Check if Python is already installed
    if (await this.isPythonInstalled()) {
      console.log('Python runtime already installed');
      this.isInitialized = true;
      return;
    }

    // Download and install Python
    await this.downloadAndInstallPython();
    
    // Install pip
    await this.ensurePip();
    
    // Install base dependencies
    await this.installBaseDependencies();

    this.isInitialized = true;
    console.log('Python runtime initialized successfully');
  }

  private async isPythonInstalled(): Promise<boolean> {
    try {
      await fs.access(this.pythonExecutable);
      // Test if it works
      const { stdout } = await execAsync(`"${this.pythonExecutable}" --version`);
      return stdout.includes('Python 3.');
    } catch {
      return false;
    }
  }

  private async downloadAndInstallPython(): Promise<void> {
    const platform = `${process.platform}-${process.arch}` as keyof PythonUrls;
    const url = this.PYTHON_URLS[platform];
    
    if (!url) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    console.log(`Downloading Python for ${platform}...`);
    
    // Create python directory
    await fs.mkdir(this.pythonDir, { recursive: true });
    
    // Download Python
    const tarPath = path.join(this.pythonDir, 'python.tar.gz');
    await this.downloadFile(url, tarPath);
    
    // Extract Python
    console.log('Extracting Python...');
    await tar.extract({
      file: tarPath,
      cwd: this.pythonDir,
      strip: 0 // python-build-standalone has 'python' as root dir
    });
    
    // Clean up tar file
    await fs.unlink(tarPath);
    
    // Make Python executable on Unix
    if (process.platform !== 'win32') {
      await execAsync(`chmod +x "${this.pythonExecutable}"`);
    }
  }

  private async downloadFile(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = createWriteStream(dest);
      
      https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect
          https.get(response.headers.location!, (redirectResponse) => {
            redirectResponse.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve();
            });
          });
        } else {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }
      }).on('error', (err) => {
        fs.unlink(dest).catch(() => {}); // Delete partial file
        reject(err);
      });
    });
  }

  private async ensurePip(): Promise<void> {
    console.log('Ensuring pip is installed...');
    
    try {
      // Check if pip already exists
      await execAsync(`"${this.pythonExecutable}" -m pip --version`);
      console.log('pip is already installed');
    } catch {
      // Install pip using ensurepip
      console.log('Installing pip...');
      await execAsync(`"${this.pythonExecutable}" -m ensurepip --upgrade`);
    }
  }

  private async installBaseDependencies(): Promise<void> {
    console.log('Installing base Python dependencies...');
    
    const deps = [
      'pip>=23.0',
      'setuptools>=65.0',
      'wheel>=0.38'
    ];
    
    for (const dep of deps) {
      await this.pipInstall([dep]);
    }
  }

  async pipInstall(packages: string[], extraArgs: string[] = []): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const args = ['-m', 'pip', 'install', ...packages, ...extraArgs];
    const { stdout, stderr } = await execAsync(
      `"${this.pythonExecutable}" ${args.join(' ')}`,
      {
        env: {
          ...process.env,
          PYTHONHOME: path.join(this.pythonDir, 'python'),
          // Ensure pip uses our Python's site-packages
          PYTHONUSERBASE: path.join(this.pythonDir, 'python')
        }
      }
    );

    if (stderr && !stderr.includes('WARNING')) {
      console.error('pip install stderr:', stderr);
    }
    console.log('pip install stdout:', stdout);
  }

  async runPython(args: string[], options: any = {}): Promise<{ stdout: string; stderr: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return execAsync(
      `"${this.pythonExecutable}" ${args.join(' ')}`,
      {
        ...options,
        env: {
          ...process.env,
          ...options.env,
          PYTHONHOME: path.join(this.pythonDir, 'python'),
          PYTHONPATH: options.cwd || process.cwd()
        }
      }
    );
  }

  getExecutablePath(): string {
    return this.pythonExecutable;
  }

  getPythonHome(): string {
    return path.join(this.pythonDir, 'python');
  }
}

// Export singleton
export const pythonRuntime = new PythonRuntime();