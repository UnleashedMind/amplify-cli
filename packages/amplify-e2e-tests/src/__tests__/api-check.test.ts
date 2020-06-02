import { initJSProjectWithProfile, deleteProject, createNewProjectDir, deleteProjectDir } from 'amplify-e2e-core';
import { testSchema } from '../api-directives';

describe('api data access patterns', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await createNewProjectDir('function-example2');
    await initJSProjectWithProfile(projectDir, {});
    // projectDir = '/tmp/amplify-e2e-tests/data-access-pattern_12c51d8e_912f3d48'
    // // projectDir = '////mock project dir';
    console.log('////projectDir', projectDir)
  });

  afterEach(async () => {
    // await deleteProject(projectDir);
    // deleteProjectDir(projectDir);
  });

  it('function example2', async () => {
    const testresult = await testSchema(projectDir, 'function', 'example2');
    expect(testresult).toBeTruthy();
  });
});
