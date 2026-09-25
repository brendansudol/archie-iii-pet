import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const kit = resolve(root, 'react-kit');
const destination = resolve(root, 'docs/react');
const archive = resolve(root, 'docs/assets/archie-react-kit.zip');

execFileSync('npm', ['test'], { cwd: kit, stdio: 'inherit' });
execFileSync('npm', ['run', 'build', '--', '--base=/archie-iii-pet/react/'], { cwd: kit, stdio: 'inherit' });

// This directory contains only generated output from the React example.
rmSync(destination, { recursive: true, force: true });
cpSync(resolve(kit, 'dist'), destination, { recursive: true });
mkdirSync(dirname(archive), { recursive: true });
rmSync(archive, { force: true });
execFileSync('zip', ['-rq', archive, '.', '-x', 'node_modules/*', 'dist/*', '.DS_Store', '*/.DS_Store'], { cwd: kit, stdio: 'inherit' });
console.log('Prepared docs/react and docs/assets/archie-react-kit.zip for GitHub Pages.');
