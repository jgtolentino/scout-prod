#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Running post-install checks...');

// Check for critical dependencies
const criticalDeps = ['react', 'vite', 'rollup'];
const nodeModulesPath = path.join(process.cwd(), 'node_modules');

for (const dep of criticalDeps) {
    const depPath = path.join(nodeModulesPath, dep);
    if (!fs.existsSync(depPath)) {
        console.warn(`⚠️ Missing critical dependency: ${dep}`);
        process.exit(1);
    }
}

// Check for rollup native modules issue
const rollupPath = path.join(nodeModulesPath, 'rollup');
if (fs.existsSync(rollupPath)) {
    console.log('✅ Rollup dependency found');
}

// Create necessary directories
const dirs = ['test-results', 'coverage', 'dist'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
});

console.log('✅ Post-install checks completed');