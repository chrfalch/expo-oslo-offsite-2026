import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const platform = process.argv[2];

if (platform !== 'ios' && platform !== 'android') {
  throw new Error('Pass ios or android to prepare-native.mjs.');
}

const nativeEntry = platform === 'ios' ? 'ios/Podfile' : 'android/build.gradle';
if (!existsSync(resolve(projectRoot, nativeEntry))) {
  const require = createRequire(import.meta.url);
  const expoPackagePath = require.resolve('expo/package.json');
  const { version } = JSON.parse(readFileSync(expoPackagePath, 'utf8'));

  // Canary SDKs do not have an sdk-58 native template tag. Use the exact release.
  const result = spawnSync(
    process.execPath,
    [
      resolve(dirname(expoPackagePath), 'bin/cli'),
      'prebuild',
      '--platform',
      platform,
      '--template',
      `expo-template-bare-minimum@${version}`,
      '--no-install',
    ],
    { cwd: projectRoot, stdio: 'inherit' },
  );

  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}
