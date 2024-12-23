import { execSync } from 'child_process';

execSync('bun start', { stdio: 'inherit' });
process.exit(0);
