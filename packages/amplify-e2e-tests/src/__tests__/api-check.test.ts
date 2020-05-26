import { initJSProjectWithProfile, deleteProject, createNewProjectDir, deleteProjectDir } from 'amplify-e2e-core';
import { testSchema } from '../api-directives';
import sequential from 'promise-sequential';

describe('api directives @model @key @connection @versioned', () => {
  let projectDir: string;

  beforeEach(async () => {
    // projectDir = await createNewProjectDir('apidirective3');
    // await initJSProjectWithProfile(projectDir, {});
    projectDir = '/private/tmp/amplify-e2e-tests/apidirective3_3537b7c1_90715ada'
  });

  afterEach(async () => {
    // await deleteProject(projectDir);
    // deleteProjectDir(projectDir);
  });

  //function
//   it('function usage', async () => {
//     await checksequential();
//   })

  //data access patterns
  it('data-access-patterns patterns', async () => {
    const testresult = await testSchema(projectDir, 'data-access-patterns', 'patterns');
    expect(testresult).toBeTruthy();
  });

})


async function checksequential(){
    const tasks = [];
    for(let i=0; i<10; i++){
        tasks.push(async ()=>{
            await new Promise(res => setTimeout(() => res(), 2000));
            console.log(i);
            if(i===5){
                throw new Error('5!')
            }
        })
    }
    await sequential(tasks);
}

async function checkRejct(){
    return Promise.reject(new Error('Fail'));
}

async function mysequential(tasks: ((v: any) => Promise<any>)[]): Promise<any> {
    let result; 

    for(const task of tasks){
        result = await task(result);
    }

    return result; 
}