import { initJSProjectWithProfile, deleteProject, createNewProjectDir, deleteProjectDir } from 'amplify-e2e-core';
import { testSchema } from '../api-directives';

describe('api directives @model @key @connection @versioned', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await createNewProjectDir('apidirective3');
    await initJSProjectWithProfile(projectDir, {});
  });

  afterEach(async () => {
    await deleteProject(projectDir);
    deleteProjectDir(projectDir);
  });

  //function
  it('function usage', async () => {
    const testresult = await testSchema(projectDir, 'function', 'usage');
    expect(testresult).toBeTruthy();
  });
})