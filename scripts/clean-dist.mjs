#!/usr/bin/env node
import { rmSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
console.log('cleaned dist/');
