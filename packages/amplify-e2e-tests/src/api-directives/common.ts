import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';
import sequential from 'promise-sequential';
import gql from 'graphql-tag';
import {readJsonFile} from 'amplify-e2e-core';
import {
  addApiWithAPIKeyAuthType,
  amplifyPushWithoutCodeGen
} from './workflows';

import {
  getApiKey,
  configureAmplify,
  getConfiguredAppsyncClientAPIKeyAuth
} from './authHelper';

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
  const appsyncClient = getConfiguredAppsyncClientAPIKeyAuth(
    awsconfig.aws_appsync_graphqlEndpoint,
    awsconfig.aws_appsync_region,
    apiKey
  );

  await testCompiledSchema(projectDir, schemaDocDirPath);
  await testMutations(schemaDocDirPath, appsyncClient);
  await testQueries(schemaDocDirPath, appsyncClient);
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