import { initJSProjectWithProfile, deleteProject, createNewProjectDir, deleteProjectDir } from 'amplify-e2e-core';
import { testSchema } from '../api-directives';

describe('api directives @model @key @connection @versioned', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await createNewProjectDir('apidirective1');
    await initJSProjectWithProfile(projectDir, {});
  });

  afterEach(async () => {
    // await deleteProject(projectDir);
    // deleteProjectDir(projectDir);
  });

  //model
  it('model usage1', async () => {
    const testresult = await testSchema(projectDir, 'model', 'usage1');
    expect(testresult).toBeTruthy();
  });

//   it('model usage2', async () => {
//     const testresult = await testSchema(projectDir, 'model', 'usage2');
//     expect(testresult).toBeTruthy();
//   });

  it('model generates', async () => {
    const testresult = await testSchema(projectDir, 'model', 'generates');
    expect(testresult).toBeTruthy();
  });

  //key
  it('key howTo1', async () => {
    const testresult = await testSchema(projectDir, 'key', 'howTo1');
    expect(testresult).toBeTruthy();
  });

  it('key howTo2', async () => {
    const testresult = await testSchema(projectDir, 'key', 'howTo2');
    expect(testresult).toBeTruthy();
  });

  it('key howTo3', async () => {
    const testresult = await testSchema(projectDir, 'key', 'howTo3');
    expect(testresult).toBeTruthy();
  });

  //connection
  it('connection belongsTo', async () => {
    const testresult = await testSchema(projectDir, 'connection', 'belongsTo');
    expect(testresult).toBeTruthy();
  });

  it('connection hasMany', async () => {
    const testresult = await testSchema(projectDir, 'connection', 'hasMany');
    expect(testresult).toBeTruthy();
  });

  it('connection hasOne1', async () => {
    const testresult = await testSchema(projectDir, 'connection', 'hasOne1');
    expect(testresult).toBeTruthy();
  });

  it('connection hasOne2', async () => {
    const testresult = await testSchema(projectDir, 'connection', 'hasOne2');
    expect(testresult).toBeTruthy();
  });

  it('connection manyToMany', async () => {
    const testresult = await testSchema(projectDir, 'connection', 'manyToMany');
    expect(testresult).toBeTruthy();
  });

  it('connection limit', async () => {
    const testresult = await testSchema(projectDir, 'connection', 'limit');
    expect(testresult).toBeTruthy();
  });

  //versioned
  it('versioned usage', async () => {
    const testresult = await testSchema(projectDir, 'versioned', 'usage');
    expect(testresult).toBeTruthy();
  });
});
