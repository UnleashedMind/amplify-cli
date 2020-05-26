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

  it('function example1', async () => {
    const testresult = await testSchema(projectDir, 'function', 'example1');
    expect(testresult).toBeTruthy();
  });

  it('function example2', async () => {
    const testresult = await testSchema(projectDir, 'function', 'example2');
    expect(testresult).toBeTruthy();
  });

  it('function differentRegion', async () => {
    const testresult = await testSchema(projectDir, 'function', 'differentRegion');
    expect(testresult).toBeTruthy();
  });

  it('function chaining', async () => {
    const testresult = await testSchema(projectDir, 'function', 'chaining');
    expect(testresult).toBeTruthy();
  });

  //searchable
  it('searchable usage', async () => {
    const testresult = await testSchema(projectDir, 'function', 'usage');
    expect(testresult).toBeTruthy();
  });

  //predictions
  it('predictions usage', async () => {
    const testresult = await testSchema(projectDir, 'predictions', 'usage');
    expect(testresult).toBeTruthy();
  });

  //data access patterns
  it('data-access-patterns patterns', async () => {
    const testresult = await testSchema(projectDir, 'data-access-patterns', 'patterns');
    expect(testresult).toBeTruthy();
  });
});