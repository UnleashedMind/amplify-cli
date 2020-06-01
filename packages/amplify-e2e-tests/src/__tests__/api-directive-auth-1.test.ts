import { initJSProjectWithProfile, deleteProject, createNewProjectDir, deleteProjectDir } from 'amplify-e2e-core';
import { testSchema } from '../api-directives';

describe('api directives @auth batch 1', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await createNewProjectDir('auth1');
    await initJSProjectWithProfile(projectDir, {});
  });

  afterEach(async () => {
    await deleteProject(projectDir);
    deleteProjectDir(projectDir);
  });

  it('auth owner1', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'owner1');
    expect(testresult).toBeTruthy();
  });

  it('auth owner2', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'owner2');
    expect(testresult).toBeTruthy();
  });

  it('auth owner3', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'owner3');
    expect(testresult).toBeTruthy();
  });

  it('auth owner4', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'owner4');
    expect(testresult).toBeTruthy();
  });

  it('auth owner5', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'owner5');
    expect(testresult).toBeTruthy();
  });

  it('auth owner6', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'owner6');
    expect(testresult).toBeTruthy();
  });

  it('auth owner7', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'owner7');
    expect(testresult).toBeTruthy();
  });

  it('auth ownerMultiAuthRules', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'ownerMultiAuthRules');
    expect(testresult).toBeTruthy();
  });
  it('auth staticGroup1', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'staticGroup1');
    expect(testresult).toBeTruthy();
  });

  it('auth staticGroup2', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'staticGroup2');
    expect(testresult).toBeTruthy();
  });

  it('auth dynamicGroup1', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'dynamicGroup1');
    expect(testresult).toBeTruthy();
  });

  it('auth dynamicGroup2', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'dynamicGroup2');
    expect(testresult).toBeTruthy();
  });

  it('auth dynamicGroup3', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'dynamicGroup3');
    expect(testresult).toBeTruthy();
  });
});
