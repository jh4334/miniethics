import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const packageJson: unknown = JSON.parse(readFileSync('package.json', 'utf8'));
const packageLock: unknown = JSON.parse(readFileSync('package-lock.json', 'utf8'));
const deployWorkflow = readFileSync('.github/workflows/deploy.yml', 'utf8');
const viteConfig = readFileSync('vite.config.ts', 'utf8');

describe('development toolchain security contract', () => {
  it('binds development and preview servers to loopback by default', () => {
    expect(viteConfig).toMatch(/server:\s*{[^}]*host:\s*'127\.0\.0\.1'[^}]*strictPort:\s*true/s);
    expect(viteConfig).toMatch(/preview:\s*{[^}]*host:\s*'127\.0\.0\.1'[^}]*strictPort:\s*true/s);
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
