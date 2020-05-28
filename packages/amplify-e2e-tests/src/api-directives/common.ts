import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';
import util from 'util';
import sequential from 'promise-sequential';
import gql from 'graphql-tag';
import { readJsonFile } from 'amplify-e2e-core';
import {
  addApiWithAPIKeyAuthType,
  addApiWithCognitoUserPoolAuthType,
  addApiWithAPIKeyCognitoUserPoolIAMAuthTypes,
  amplifyPushWithoutCodeGen,
  updateAuthAddFirstUserGroup
} from './workflows';

import {
  setupUser,
  getUserPoolId,
  getApiKey,
  configureAmplify,
  signInUser,
  getConfiguredAppsyncClientAPIKeyAuth,
  getConfiguredAppsyncClientCognitoAuth,
} from './authHelper';

const GROUPNAME = 'admin';
const USERNAME = 'user1';
const PASSWORD = 'user1Password'

//The following runTest method runs the common test pattern schemas in the document.
//It sets up the GraphQL API with "API key" as the default authorization type.
//It does not test schemas in the @auth section.
//It does not test subscriptions.
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

  await testMutations(schemaDocDirPath, appSyncClient);
  await testQueries(schemaDocDirPath, appSyncClient);
}

//The following runTest method runs the common test pattern for schemas in the @auth section of the document.
//It does not test subscriptions. Subscription tests are handled individually in the schema doc directory.
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
  await testMutations(schemaDocDirPath, appSyncClient);
  await testQueries(schemaDocDirPath, appSyncClient);
  await testSubscriptions(schemaDocDirPath, appSyncClient);
}


export async function runMultiAutTest(projectDir: string, schemaDocDirPath: string) {
  const schemaFilePath = path.join(schemaDocDirPath, 'input.graphql');
  await addApiWithAPIKeyCognitoUserPoolIAMAuthTypes(projectDir, schemaFilePath);
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

  await testMutations(schemaDocDirPath, appSyncClient);
  await testQueries(schemaDocDirPath, appSyncClient);
  await testSubscriptions(schemaDocDirPath, appSyncClient);
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
    const mutationInputFileName = 'input-' + mutationFileName.replace('.graphql', '.json');
    const mutationResultFileName = 'result-' + mutationFileName.replace('.graphql', '.json');
    const mutationFilePath = path.join(schemaDocDirPath, mutationFileName);
    const mutationInputFilePath = path.join(schemaDocDirPath, mutationInputFileName);
    const mutationResultFilePath = path.join(schemaDocDirPath, mutationResultFileName);
    const mutation = fs.readFileSync(mutationFilePath).toString();
    let mutationInput: any; 
    let mutationResult: any; 
    if(fs.existsSync(mutationInputFilePath)){
      mutationInput = readJsonFile(mutationInputFilePath);
    }
    if(fs.existsSync(mutationResultFilePath)){
      mutationResult = readJsonFile(mutationResultFilePath);
    }
    mutations.push(mutation);
    results.push(mutationResult);

    mutationTasks.push(async () => {
      await testMutation(appsyncClient, mutation, mutationInput, mutationResult);
    });
  });

  await runInSequential(mutationTasks);
}

export async function testMutation(appSyncClient: any, mutation: any, mutationInput?: any, mutationResult?: any){
  let resultMatch = true;
  let errorMatch = true;
  console.log('///mutation', mutation);
  console.log('///expected mutationResult', util.inspect(mutationResult, true, 10))
  try{
    const result = await appSyncClient.mutate({
      mutation: gql(mutation),
      fetchPolicy: 'no-cache',
      variables: mutationInput
    });
    console.log('///actual mutation result', util.inspect(result, true, 10))
    if(!checkResult(result, mutationResult)){
      resultMatch = false;
    }
  }catch(err){
    console.log('///actual mutation err', util.inspect(err, true, 10));
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
    const querInputFileName = 'input-' + queryFileName.replace('.graphql', '.json');
    const queryResultFileName = 'result-' + queryFileName.replace('.graphql', '.json');
    const queryFilePath = path.join(schemaDocDirPath, queryFileName);
    const queryInputFilePath = path.join(schemaDocDirPath, querInputFileName);
    const queryResultFilePath = path.join(schemaDocDirPath, queryResultFileName);
    const query = fs.readFileSync(queryFilePath).toString();
    let queryInput: any;
    let queryResult: any; 
    if(fs.existsSync(queryInputFilePath)){
      queryInput = readJsonFile(queryInputFilePath);
    }
    if(fs.existsSync(queryResultFilePath)){
      queryResult = readJsonFile(queryResultFilePath);
    }
    queryTasks.push(async () => {
      await testQuery(appSyncClient, query, queryInput, queryResult);
    });
  });

  await runInSequential(queryTasks);
}

export async function testQuery(appSyncClient: any, query: any, queryInput?: any, queryResult?: any){
  let resultMatch = true;
  let errorMatch = true;
  console.log('///query', query);
  console.log('///expected queryResult', util.inspect(queryResult, true, 10))
  try{
    const result = await appSyncClient.query({
      query: gql(query),
      fetchPolicy: 'no-cache',
      variables: queryInput
    });
    console.log('///actual query result:', util.inspect(result, true, 10));
    if(!checkResult(result, queryResult)){
      resultMatch = false;
    }
  }catch(err){
    console.log('///actual query err:', util.inspect(err, true, 10));
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

  console.log('////subscriptionFileNames', subscriptionFileNames)
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

    let mutationFileNames = fileNames.filter(fileName => {
      const regex = new RegExp('^mutation[0-9]*-'+subscriptionFileName); 
      return regex.test(fileName);
    });

    console.log('1/////mutationFileNames', mutationFileNames)

    if(mutationFileNames.length>1){
      mutationFileNames = mutationFileNames.sort((fn1, fn2) => {
        const regex = new RegExp('mutation' + '|-' + subscriptionFileName, 'g'); 
        const n1 = parseInt(fn1.replace(regex, ''));
        const n2 = parseInt(fn2.replace(regex, ''));
        return n1 - n2;
      });
    }
    
    console.log('2/////mutationFileNames', mutationFileNames)

    const mutations = [];
    mutationFileNames.forEach((mutationFileName)=>{
      const mutationFilePath = path.join(schemaDocDirPath, mutationFileName);
      const mutation = fs.readFileSync(mutationFilePath).toString();
      mutations.push(mutation);
    })

    console.log('///mutations', mutations)
    subscriptionTasks.push(async () => {
      await testSubscription(appsyncClient, subscription, mutations, subscriptionResult);
    });
  });

  await runInSequential(subscriptionTasks);
}
  
export async function testSubscription(appSyncClient: any, subscription: string, mutations: any[], subscriptionResult: any, subscriptionInput?: any, mutationInputs?: any[]){
  
  console.log('///subscription', subscription);
  console.log('///expected subscriptionResult', util.inspect(subscriptionResult, true, 10))

  const observer = appSyncClient.subscribe({
    query: gql(subscription),
    variables: subscriptionInput
  });

  const received = [];
  const sub = observer.subscribe((event: any) => {
    received.push(event.data);
  });

  await new Promise(res => setTimeout(() => res(), 4000));

  const mutationTasks = [];
  for(let i=0; i<mutations.length; i++){
    const mutation = mutations[i];
    const mutationInput = mutationInputs? mutationInputs[i] : undefined;
    mutationTasks.push(async () => {
      await appSyncClient.mutate({
        mutation: gql(mutation),
        fetchPolicy: 'no-cache',
        variables: mutationInput
      });
      await new Promise(res => setTimeout(() => res(), 4000));//to ensure correct order in received data
    });
  }
  
  await runInSequential(mutationTasks);

  await new Promise(res => setTimeout(() => res(), 4000));

  sub.unsubscribe();

  console.log('///actual received subscription data', util.inspect(received, true, 10))

  if(!checkResult(received, subscriptionResult)){
    throw new Error('Subscription test failed.');
  }
}

/////
function checkResult(received: any, expected: any): boolean{
  if(!expected){//the test does not request result check, as long as the mutation/query goes through, it's good
    return true;
  }
  const queue = [{
    received,
    expected,
    depth: 0
  }];
  try{
    return runCompare(queue);
  }catch(e){
    console.log('////checkResult method error', e);
    return false;
  }
}

function checkError(received: any, expected: any): boolean{
  if(!expected){//the test does not request result check, assume mutation/query should go through, but received error
    return false;
  }
  const queue = [{
    received,
    expected,
    depth: 0
  }];
  return runCompare(queue);
}

const MAX_DEPTH = 50;
function runCompare(queue: {received: any, expected: any, depth: number}[]): boolean{
  let result = true;

  while(queue.length>0 && result){
    const itemToCompare = queue.shift();
    if(itemToCompare.depth > MAX_DEPTH){
      break;
    }
    if(typeof itemToCompare.expected === 'object'){
      if(itemToCompare.expected === null){
        result = itemToCompare.received === null;
      }else if(itemToCompare.received === null){
        result = false; 
      }else if(typeof itemToCompare.received === 'object'){
        Object.keys(itemToCompare.expected).forEach((key)=>{
          queue.push({
            received: itemToCompare.received[key],
            expected: itemToCompare.expected[key],
            depth: itemToCompare.depth + 1
          })
        })
      }else{
        result = false;
      }
    }else if(itemToCompare.expected === "<check-defined>"){
      result = itemToCompare.received !== null && itemToCompare.received !== undefined;
    }else{
      result = itemToCompare.received === itemToCompare.expected;
    }
  }

  return result;
}

export async function runInSequential(tasks: ((v: any) => Promise<any>)[]): Promise<any> {
    let result; 

    for(const task of tasks){
        result = await task(result);
    }

    return result; 
}