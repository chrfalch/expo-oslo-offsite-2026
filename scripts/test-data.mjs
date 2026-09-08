import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const output = mkdtempSync(join(tmpdir(), 'oslo-offsite-tests-'));

function run(args) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

try {
  process.exitCode = run([
    require.resolve('typescript/bin/tsc'), '--project', 'tsconfig.test.json', '--outDir', output,
  ]);
  if (process.exitCode === 0) {
    const tests = readdirSync(join(output, 'tests'))
      .filter((name) => name.endsWith('.test.js'))
      .map((name) => join(output, 'tests', name));
    process.exitCode = run(['--test', ...tests]);
  }
} finally {
  rmSync(output, { recursive: true, force: true });
}
