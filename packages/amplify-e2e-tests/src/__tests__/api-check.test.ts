import { initJSProjectWithProfile, deleteProject, createNewProjectDir, deleteProjectDir } from 'amplify-e2e-core';
import { testSchema } from '../api-directives';

describe('api data access patterns', () => {
  let projectDir: string;

  beforeEach(async () => {
    // projectDir = await createNewProjectDir('data-access-pattern');
    // await initJSProjectWithProfile(projectDir, {});
    console.log('////projectDir', projectDir)
    projectDir = '/tmp/amplify-e2e-tests/data-access-pattern_12c51d8e_912f3d48'
    // projectDir = '////mock project dir';
  });

  afterEach(async () => {
    // await deleteProject(projectDir);
    // deleteProjectDir(projectDir);
  });

  it('auth ownerMultiAuthRules', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'ownerMultiAuthRules');
    expect(testresult).toBeTruthy();
  });
});
