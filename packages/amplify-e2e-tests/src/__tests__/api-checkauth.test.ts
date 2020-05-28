import { initJSProjectWithProfile, deleteProject, createNewProjectDir, deleteProjectDir } from 'amplify-e2e-core';
import { testSchema } from '../api-directives';
import sequential from 'promise-sequential';

describe('api-check', () => {
  let projectDir: string;

  const authowner5ProjectDir = '/private/tmp/amplify-e2e-tests/apidirective3_610fc1bf_5cc74b7e'
  const authSubscriptions1ProjectDir = '/private/tmp/amplify-e2e-tests/apidirective3_610fc1bf_dae815e5'
  beforeEach(async () => {
    // projectDir = await createNewProjectDir('authowner5');
    // await initJSProjectWithProfile(projectDir, {});
    projectDir = '/private/tmp/amplify-e2e-tests/authowner5'
  });

  afterEach(async () => {
    // await deleteProject(projectDir);
    // deleteProjectDir(projectDir);
  });
  
  //auth tests count: 

//   it('auth owner1', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'owner1');
//     expect(testresult).toBeTruthy();
//   });

  it('auth owner5', async () => {
    const testresult = await testSchema(projectDir, 'auth', 'owner5');
    expect(testresult).toBeTruthy();
  });

//   it('auth owner3', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'owner3');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth owner4', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'owner4');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth owner5', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'owner5');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth staticGroup1', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'staticGroup1');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth staticGroup2', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'staticGroup2');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth dynamicGroup1', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'dynamicGroup1');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth dynamicGroup2', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'dynamicGroup2');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth dynamicGroup3', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'dynamicGroup3');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth public1', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'public1');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth public2', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'public2');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth private1', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'private1');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth authUsingOide', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'authUsingOide');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth combiningAuthRules1', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'combiningAuthRules1');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth combiningAuthRules2', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'combiningAuthRules2');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth customClaims', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'customClaims');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth authSubscriptions1', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'authSubscriptions1');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth authSubscriptions2', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'authSubscriptions2');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth authSubscriptions3', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'authSubscriptions3');
//     expect(testresult).toBeTruthy();
//   });
  
  // it('auth fieldLevelAuth1', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'fieldLevelAuth1');
  //   expect(testresult).toBeTruthy();
  // });
  
  // it('auth fieldLevelAuth2', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'fieldLevelAuth2');
  //   expect(testresult).toBeTruthy();
  // });
  
//   it('auth fieldLevelAuth3', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'fieldLevelAuth3');
//     expect(testresult).toBeTruthy();
//   });
  
//   it('auth fieldLevelAuth4', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'fieldLevelAuth4');
//     expect(testresult).toBeTruthy();
//   });
  
  // it('auth fieldLevelAuth5', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'fieldLevelAuth5');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth fieldLevelAuth6', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'fieldLevelAuth6');
  //   expect(testresult).toBeTruthy();
  // });

  // it('auth fieldLevelAuth7', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'fieldLevelAuth7');
  //   expect(testresult).toBeTruthy();
  // });
  
  // it('auth fieldLevelAuth8', async () => {
  //   const testresult = await testSchema(projectDir, 'auth', 'fieldLevelAuth8');
  //   expect(testresult).toBeTruthy();
  // });

//   it('auth generatesOwner', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'generatesOwner');
//     expect(testresult).toBeTruthy();
//   });

//   it('auth generatesStaticGroup', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'generatesStaticGroup');
//     expect(testresult).toBeTruthy();
//   });
  
//   it('auth generatesDynamicGroup', async () => {
//     const testresult = await testSchema(projectDir, 'auth', 'generatesDynamicGroup');
//     expect(testresult).toBeTruthy();
//   });

})


async function checkTest(){
    const s = 'a string';
    const o = {
        a: 'asdfas',
        b: 2,
        c: [
            'asdfasfd',
            'asfasdfas'
        ],
        d: true
    };
    const a = [
        'asdfasfd',
        'asfasdfas',
        'asasdfas',
        'asdfasfdasdf'
    ]

    console.log('type of s: ', typeof s);
    console.log('type of o: ', typeof o);
    console.log('type of a: ', typeof a);
    console.log('type of null: ', typeof null);
    console.log('type of undefined: ', typeof undefined);

    console.log('Object.keys(a)', Object.keys(a))

    Object.keys(a).forEach((k)=>{
        console.log(`a[${k}] = ${a[k]}`);
    })

    console.log("a['0']", a['0']);
    console.log("a[0]", a[0]);
}

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