import { initJSProjectWithProfile, deleteProject, createNewProjectDir, deleteProjectDir } from 'amplify-e2e-core';
import { testSchema } from '../api-directives';

describe('api directives @auth batch 2', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await createNewProjectDir('auth2');
    await initJSProjectWithProfile(projectDir, {});
  });

  afterEach(async () => {
    await deleteProject(projectDir);
    deleteProjectDir(projectDir);
  });
  it('auth public1', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'public1');
    expect(testresult).toBeTruthy();
  });

  it('auth public2', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'public2');
    expect(testresult).toBeTruthy();
  });

  it('auth private1', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'private1');
    expect(testresult).toBeTruthy();
  });

  it('auth private2', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'private2');
    expect(testresult).toBeTruthy();
  });

  it('auth authUsingOidc', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'authUsingOidc');
    expect(testresult).toBeTruthy();
  });

  it('auth combiningAuthRules1', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'combiningAuthRules1');
    expect(testresult).toBeTruthy();
  });

  it('auth combiningAuthRules2', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'combiningAuthRules2');
    expect(testresult).toBeTruthy();
  });

  it('auth combiningAuthRules3', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'combiningAuthRules3');
    expect(testresult).toBeTruthy();
  });

  it('auth customClaims', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'customClaims');
    expect(testresult).toBeTruthy();
  });

  it('auth authSubscriptions1', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'authSubscriptions1');
    expect(testresult).toBeTruthy();
  });

  it('auth authSubscriptions2', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'authSubscriptions2');
    expect(testresult).toBeTruthy();
  });

  it('auth authSubscriptions3', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'authSubscriptions3');
    expect(testresult).toBeTruthy();
  });
});
