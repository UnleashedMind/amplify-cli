import { initJSProjectWithProfile, deleteProject, createNewProjectDir, deleteProjectDir } from 'amplify-e2e-core';
import { testSchema } from '../api-directives';

describe('api data access patterns', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await createNewProjectDir('data-access-pattern');
    await initJSProjectWithProfile(projectDir, {});
  });

  afterEach(async () => {
    await deleteProject(projectDir);
    deleteProjectDir(projectDir);
  });

  it('data-access-patterns patterns', async () => {
    const testresult = await testSchema(projectDir, 'data-access-patterns', 'patterns');
    expect(testresult).toBeTruthy();
  });
});
