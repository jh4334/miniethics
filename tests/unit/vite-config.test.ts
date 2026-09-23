import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import viteConfig from '../../vite.config';

const packageJson: unknown = JSON.parse(readFileSync('package.json', 'utf8'));
const packageLock: unknown = JSON.parse(readFileSync('package-lock.json', 'utf8'));
const deployWorkflow = readFileSync('.github/workflows/deploy.yml', 'utf8');

describe('development toolchain security contract', () => {
  it('binds development and preview servers to loopback by default', () => {
    expect(viteConfig.server).toMatchObject({ host: '127.0.0.1', strictPort: true });
    expect(viteConfig.preview).toMatchObject({ host: '127.0.0.1', strictPort: true });
  });

  it('provides an explicit trusted-network LAN command', () => {
    expect(packageJson).toMatchObject({
      scripts: { dev: 'vite', 'dev:lan': 'vite --host 0.0.0.0' }
    });
  });

  it('pins supported Vite, Vitest, and Node versions', () => {
    expect(packageJson).toMatchObject({
      engines: { node: '>=22.12.0' },
      devDependencies: { vite: '8.2.1', vitest: '4.1.10' }
    });
    expect(packageLock).toMatchObject({
      packages: {
        'node_modules/vite': { version: '8.2.1' },
        'node_modules/vitest': { version: '4.1.10' }
      }
    });
    expect(deployWorkflow).toContain('node-version: 22.12.0');
  });
});
