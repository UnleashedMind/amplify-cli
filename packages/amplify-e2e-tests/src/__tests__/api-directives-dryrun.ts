import { initJSProjectWithProfile, deleteProject, createNewProjectDir, deleteProjectDir } from 'amplify-e2e-core';
import { testSchema } from '../api-directives';

describe('api directives tryrun', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await createNewProjectDir('auth2');
    await initJSProjectWithProfile(projectDir, {});
  });

  afterEach(async () => {
    // await deleteProject(projectDir);
    // deleteProjectDir(projectDir);
  });

  // it('auth owner1', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'owner1');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth owner2', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'owner2');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth owner3', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'owner3');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth owner4', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'owner4');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth owner5', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'owner5');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth owner6', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'owner6');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth owner7', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'owner7');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth ownerMultiAuthRules', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'ownerMultiAuthRules');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth staticGroup1', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'staticGroup1');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth staticGroup2', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'staticGroup2');
  //   expect(testresult).toBeTruthy();
  // });

  it('auth dynamicGroup1', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'dynamicGroup1');
    expect(testresult).toBeTruthy();
  });

  // it('auth dynamicGroup2', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'dynamicGroup2');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth dynamicGroup3', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'dynamicGroup3');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth public1', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'public1');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth public2', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'public2');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth private1', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'private1');
  //   expect(testresult).toBeTruthy();
  // });

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

  // it('auth authSubscriptions1', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'authSubscriptions1');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth authSubscriptions2', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'authSubscriptions2');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth authSubscriptions3', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'authSubscriptions3');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth fieldLevelAuth1', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'fieldLevelAuth1');
  //   expect(testresult).toBeTruthy();
  // });

  it('auth fieldLevelAuth2', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'fieldLevelAuth2');
    expect(testresult).toBeTruthy();
  });

  // it('auth fieldLevelAuth3', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'fieldLevelAuth3');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth fieldLevelAuth4', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'fieldLevelAuth4');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth fieldLevelAuth5', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'fieldLevelAuth5');
  //   expect(testresult).toBeTruthy();
  // });

  it('auth fieldLevelAuth6', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'fieldLevelAuth6');
    expect(testresult).toBeTruthy();
  });

  it('auth fieldLevelAuth7', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'fieldLevelAuth7');
    expect(testresult).toBeTruthy();
  });

  it('auth fieldLevelAuth8', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'fieldLevelAuth8');
    expect(testresult).toBeTruthy();
  });

  it('auth generatesOwner', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'generatesOwner');
    expect(testresult).toBeTruthy();
  });

  it('auth generatesStaticGroup', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'generatesStaticGroup');
    expect(testresult).toBeTruthy();
  });

  it('auth generatesDynamicGroup', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'generatesDynamicGroup');
    expect(testresult).toBeTruthy();
  });
});
