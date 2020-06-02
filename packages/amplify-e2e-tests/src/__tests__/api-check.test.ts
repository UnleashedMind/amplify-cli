import { initJSProjectWithProfile, deleteProject, createNewProjectDir, deleteProjectDir } from 'amplify-e2e-core';
import { testSchema } from '../api-directives';

describe('api data access patterns', () => {
  let projectDir: string;

  beforeEach(async () => {
    // projectDir = await createNewProjectDir('data-access-pattern');
    // await initJSProjectWithProfile(projectDir, {});
    projectDir = '////mock project dir';
  });

  afterEach(async () => {
    // await deleteProject(projectDir);
    // deleteProjectDir(projectDir);
  });

  it('model usage1', async () => {
    const testresult = await testSchema(projectDir, 'model', 'usage1');
    expect(testresult).toBeTruthy();
  });
});
