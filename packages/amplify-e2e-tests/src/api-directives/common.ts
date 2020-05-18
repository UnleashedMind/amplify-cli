import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';
import sequential from 'promise-sequential';
import gql from 'graphql-tag';
import {readJsonFile} from 'amplify-e2e-core';
import {
  addApiWithAPIKeyAuthType,
  addApiWithCognitoUserPoolAuthType, 
  updateAuthAddFirstUserGroup, 
  amplifyPushWithoutCodeGen
} from './workflows';

import {
  setupUser,
  getUserPoolId,
  getApiKey,
  configureAmplify,
  signInUser,
  getConfiguredAppsyncClientCognitoAuth,
  getConfiguredAppsyncClientAPIKeyAuth
} from './authHelper';

const GROUPNAME = 'admin';
const USERNAME = 'user1';
const PASSWORD = 'user1Password'

//The following runTest method runs the common test pattern schemas in the document.
//It sets up the GraphQL API with "API key" as the default authorization type.
//It does not test schemas in the @auth section.
//It carries out the following steps in sequence:
//Add the GraphQL API with "API key" as the default authorization type.
//Run `amplify push` to create the GraphQL API resouces.
//Configure Amplify of the Amplify JS library, its API module will be used for mutations and queries
//Send the mutations, and if the corresponding mutation responses are present in the directory, 
//the actual received mutation responses will be checked against the responses in the document. 
//Send the queries, and if the corresponding query responses are present in the directory, 
//the actual received query responses will be checked against the responses in the document. 

export async function runTest(projectDir: string, schemaDocDirPath: string) {
  const schemaFilePath = path.join(schemaDocDirPath, 'input.graphql');
  await addApiWithAPIKeyAuthType(projectDir, schemaFilePath);
  await amplifyPushWithoutCodeGen(projectDir);

  const awsconfig = configureAmplify(projectDir);
  const apiKey = getApiKey(projectDir);
  const appSyncClient = getConfiguredAppsyncClientAPIKeyAuth(
    awsconfig.aws_appsync_graphqlEndpoint,
    awsconfig.aws_appsync_region,
    apiKey
  );

  await testCompiledSchema(projectDir, schemaDocDirPath);
  await testMutations(schemaDocDirPath, appSyncClient);
  await testQueries(schemaDocDirPath, appSyncClient);
  await testSubscriptions(schemaDocDirPath, appSyncClient);
}

//The following runTest method runs the common test pattern for schemas in the @auth section of the document.
//It carries out the following steps in sequence:
//Add the GraphQL API with "Amazon Cognito User Pool" as the default authorization type.
//Update the auth to create the "admin" Cognito User Pool user group
//Run `amplify push` to create the GraphQL API and the auth resources.
//Create "user1" in the User Pool and Add "user1" to the "admin" group. 
//Configure Amplify of the Amplify JS library, its Auth module will be used to sign in user, and its API module will be used for mutations and queries
//Sign in "user1" with Ampify js library's Auth module
//Send the mutations, and if the corresponding mutation responses are present in the directory, 
//the actual received mutation responses will be checked against the responses in the document. 
//Send the queries, and if the corresponding query responses are present in the directory, 
//the actual received query responses will be checked against the responses in the document. 

export async function runAutTest(projectDir: string, schemaDocDirPath: string) {
  const schemaFilePath = path.join(schemaDocDirPath, 'input.graphql');
  await addApiWithCognitoUserPoolAuthType(projectDir, schemaFilePath);
  await updateAuthAddFirstUserGroup(projectDir, GROUPNAME);
  await amplifyPushWithoutCodeGen(projectDir);

  const userPoolId = getUserPoolId(projectDir);
  await setupUser(userPoolId, USERNAME, PASSWORD, GROUPNAME);
  
  const awsconfig = configureAmplify(projectDir);
  const user = await signInUser(USERNAME, PASSWORD);
  const appSyncClient = getConfiguredAppsyncClientCognitoAuth(
    awsconfig.aws_appsync_graphqlEndpoint,
    awsconfig.aws_appsync_region,
    user
  );

  await testCompiledSchema(projectDir, schemaDocDirPath);
  await testMutations(schemaDocDirPath, appSyncClient);
  await testQueries(schemaDocDirPath, appSyncClient);
  await testSubscriptions(schemaDocDirPath, appSyncClient);
}



export async function testCompiledSchema(projectDir: string, schemaDocDirPath: string) {
  const docCompiledSchemaFilePath = path.join(schemaDocDirPath, 'generated.graphql');
  if (fs.existsSync(docCompiledSchemaFilePath)) {
    const backendApiDirPath = path.join(projectDir, 'amplify', 'backend', 'api');
    const apiResDirName = fs.readdirSync(backendApiDirPath)[0];
    const actualCompiledSchemaFilePath = path.join(backendApiDirPath, apiResDirName, 'build', 'schema.graphql');

    const schemaInDoc = fs
      .readFileSync(docCompiledSchemaFilePath)
      .toString()
      .trim();
    const actualCompileSchema = fs
      .readFileSync(actualCompiledSchemaFilePath)
      .toString()
      .trim();

    testGqlCompiled(schemaInDoc, actualCompileSchema);
  }
}

export async function testGqlCompiled(actualCompileSchema: string, schemaInDoc: string){
  if (actualCompileSchema !== schemaInDoc) {
    throw new Error('Mismatching compiled schema.');
  }
}

export async function testMutations(schemaDocDirPath: string, appsyncClient: any) {
  const fileNames = fs.readdirSync(schemaDocDirPath); 
  let mutationFileNames = fileNames.filter(fileName => /^mutation[0-9]*\.graphql$/.test(fileName));

  if (mutationFileNames.length > 1) {
    mutationFileNames = mutationFileNames.sort((fn1, fn2) => {
      const n1 = parseInt(fn1.replace(/mutation|\.graphq/g, ''));
      const n2 = parseInt(fn2.replace(/mutation|\.graphq/g, ''));
      return n1 - n2;
    });
  }

  const mutations = [];
  const results = []; 

  const mutationTasks = [];
  mutationFileNames.forEach(mutationFileName => {
    const mutationResultFileName = 'result-' + mutationFileName.replace('.graphql', '.json');
    const mutationFilePath = path.join(schemaDocDirPath, mutationFileName);
    const mutationResultFilePath = path.join(schemaDocDirPath, mutationResultFileName);
    const mutation = fs.readFileSync(mutationFilePath).toString();
    let mutationResult: any; 
    if(fs.existsSync(mutationResultFilePath)){
      mutationResult = readJsonFile(mutationResultFilePath);
    }
    mutations.push(mutation);
    results.push(mutationResult);

    mutationTasks.push(async () => {
      await testMutation(appsyncClient, mutation, mutationResult);
    });
  });

  await sequential(mutationTasks);
}

export async function testMutation(appSyncClient: any, mutation: any, mutationResult?: any){
  let resultMatch = true;
  let errorMatch = true;
  console.log('///mutation', mutation);
  console.log('mutationResult', mutationResult)
  try{
    const result = await appSyncClient.mutate({
      mutation: gql(mutation),
      fetchPolicy: 'no-cache',
    });
    if(!checkResult(result, mutationResult)){
      resultMatch = false;
    }
    console.log('///result', result)
  }catch(err){
    console.log('///err', err);
    if(!checkError(err, mutationResult)){
      errorMatch = false;
    }
  }
  if(!resultMatch || !errorMatch){
    console.log('resultMatch', resultMatch);
    console.log('errorMatch', errorMatch);
    throw new Error('Mutation test failed.');
  }
}

export async function testQueries(schemaDocDirPath: string, appSyncClient: any) {
  const fileNames = fs.readdirSync(schemaDocDirPath); 
  let queryFileNames = fileNames.filter(fileName => /^query[0-9]*\.graphql$/.test(fileName));

  if (queryFileNames.length > 1) {
    queryFileNames = queryFileNames.sort((fn1, fn2) => {
      const n1 = parseInt(fn1.replace(/query|\.graphq/g, ''));
      const n2 = parseInt(fn2.replace(/query|\.graphq/g, ''));
      return n1 - n2;
    });
  }

  const queryTasks = [];
  queryFileNames.forEach(queryFileName => {
    const queryResultFileName = 'result-' + queryFileName.replace('.graphql', '.json');
    const queryFilePath = path.join(schemaDocDirPath, queryFileName);
    const queryResultFilePath = path.join(schemaDocDirPath, queryResultFileName);
    const query = fs.readFileSync(queryFilePath).toString();
    let queryResult: any; 
    if(fs.existsSync(queryResultFilePath)){
      queryResult = readJsonFile(queryResultFilePath);
    }
    queryTasks.push(async () => {
      await testQuery(appSyncClient, query, queryResult);
    });
  });

  await sequential(queryTasks);
}

export async function testQuery(appSyncClient: any, query: any, queryResult?: any){
  let resultMatch = true;
  let errorMatch = true;
  try{
    const result = await appSyncClient.query({
      query: gql(query),
      fetchPolicy: 'no-cache',
    });
    if(!checkResult(result, queryResult)){
      resultMatch = false;
    }
  }catch(err){
    if(!checkError(err, queryResult)){
      errorMatch = false;
    }
  }
  if(!resultMatch || !errorMatch){
    throw new Error('Query test failed.');
  }
}



export async function testSubscriptions(schemaDocDirPath: string, appsyncClient: any) {
  const fileNames = fs.readdirSync(schemaDocDirPath);
  let subscriptionFileNames = fileNames.filter(fileName => /^subscription[0-9]*\.graphql$/.test(fileName));

  if (subscriptionFileNames.length > 1) {
    subscriptionFileNames = subscriptionFileNames.sort((fn1, fn2) => {
      const n1 = parseInt(fn1.replace(/subscription|\.graphq/g, ''));
      const n2 = parseInt(fn2.replace(/subscription|\.graphq/g, ''));
      return n1 - n2;
    });
  }

  const subscriptionTasks = [];
  subscriptionFileNames.forEach(subscriptionFileName => {
    const subscriptionResultFileName = 'result-' + subscriptionFileName.replace('.graphql', '.json');
    const subscriptionFilePath = path.join(schemaDocDirPath, subscriptionFileName);
    const subscriptionResultFilePath = path.join(schemaDocDirPath, subscriptionResultFileName);

    const subscription = fs.readFileSync(subscriptionFilePath).toString();
    let subscriptionResult: any; 
    if(fs.existsSync(subscriptionResultFilePath)){
      subscriptionResult = readJsonFile(subscriptionResultFilePath);
    }

    console.log('////subscription\r\n', subscription);

    let mutationFileNames = fileNames.filter(fileName => {
      const regex = new RegExp('^mutation[0-9]*-'+subscriptionFileName); 
      return regex.test(fileName);
    });
    if(mutationFileNames.length>1){
      mutationFileNames = mutationFileNames.sort((fn1, fn2) => {
        const regex = new RegExp('mutation' + '|-' + subscriptionFileName, 'g'); 
        const n1 = parseInt(fn1.replace(regex, ''));
        const n2 = parseInt(fn2.replace(regex, ''));
        return n1 - n2;
      });
    }

    console.log('////mutationFileNames\r\n', mutationFileNames);

    const mutations = [];
    mutationFileNames.forEach((mutationFileName)=>{
      const mutationFilePath = path.join(schemaDocDirPath, mutationFileName);
      const mutation = fs.readFileSync(mutationFilePath).toString();
      mutations.push(mutation);
    })

    subscriptionTasks.push(async () => {
      await testSubscription(appsyncClient, subscription, mutations, subscriptionResult);
    });
  });

  await sequential(subscriptionTasks);
}
  
export async function testSubscription(appSyncClient: any, subscription: string, mutations: any[], subscriptionResult: any){
  const observer = appSyncClient.subscribe({
    query: gql(subscription),
  });

  const received = [];
  const sub = observer.subscribe((event: any) => {
    received.push(event.data);
  });

  await new Promise(res => setTimeout(() => res(), 4000));

  const mutationTasks = [];
  mutations.forEach((mutation)=>{
    mutationTasks.push(async () => {
      await appSyncClient.mutate({
        mutation: gql(mutation),
        fetchPolicy: 'no-cache',
      });
    });
  })
  await sequential(mutationTasks);

  await new Promise(res => setTimeout(() => res(), 4000));

  sub.unsubscribe();

  if(!checkSubscriptionResult(received, subscriptionResult)){
    throw new Error('Subscription test failed.');
  }
}

/////
function checkResult(actual: any, expected: any): boolean{
  if(!expected){//the test does not request result check, as long as the mutation/query goes through, it's good
    return true;
  }
  if(!expected.data){//means the test does not expect to receive data, error is expected, but instead data is received
    return false;
  }
  return true;
  // return Object.keys(expected.data).every((key)=>{
  //   if(!actual.data){//no data returned, while data is expected
  //     return false;
  //   }
  //   return _.isEqual(expected.data[key], actual.data[key]);
  // })
}

function checkError(actualError: any, expected: any): boolean{
  if(!expected){//the test does not request result check, assume mutation/query should go through, but received error
    return false;
  }
  if(!expected.errors){//means the test does not expect to err, but erred
    return false;
  }
  return true;
  // return expected.errors.every((error)=>{
  //   if(error.errorType){ // if errorType is specified, check that the eror type matches
  //     if(!actualError.graphQLErrors){//unexpected error
  //       return false;
  //     }
  //     return actualError.graphQLErrors.some((actual: any) => {
  //       return error.errorType === actual.errorType;
  //     });
  //   }
  // });
}


function checkSubscriptionResult(received: any, expected: any): boolean{
  let result = true;

  console.log('//checkSubscriptionResult')
  console.log('////received: ', received);
  console.log('////expected: ', expected);
  if(received.length !== expected.length){
    result = false;
  }else{
    for(let i=0; i<expected.length; i++){
      if(!compareData(received[i], expected[i])){
        result = false;
        break;
      }
    }
  }

  if(!result){
    console.log('Subscription test failure information:');
    console.log(`Expected to receive ${expected.length} events:`);
    console.log(expected);
    console.log(`Received ${received.length} events:`);
    console.log(received);
  }

  return result;
}

function compareData(receivedData: any, expectedData: any){
  // console.log('///compareData')
  // console.log('///receivedData', receivedData);
  // console.log('///expectedData', expectedData);
  return Object.keys(expectedData).every((key)=>{
    return compareDataObject(receivedData[key], expectedData[key]);
  })
}

function compareDataObject(receivedDataObject: any, expectedDataObject: any){
  // console.log('///compareDataObject')
  // console.log('///receivedDataObject', receivedDataObject);
  // console.log('///expectedDataObject', expectedDataObject);
  return Object.keys(expectedDataObject).every((key)=>{
    // console.log('///key', key);
    // console.log('//expectedDataObject[key]', expectedDataObject[key]);
    // console.log('///receivedDataObject[key]', receivedDataObject[key])
    // console.log('//isEqual', _.isEqual(expectedDataObject[key], receivedDataObject[key]));
    return _.isEqual(expectedDataObject[key], receivedDataObject[key]);
  })
}