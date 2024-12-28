import { execSync } from 'child_process';

try {
  execSync('bun start', { stdio: 'inherit' });
} catch (err) {
  console.error(err);
  process.exit(1);
}
process.exit(0);
