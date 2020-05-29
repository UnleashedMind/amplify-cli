import { runMultiAutTest } from '../../common';

export async function runTest(projectDir: string) {
  await runMultiAutTest(projectDir, __dirname);
}
