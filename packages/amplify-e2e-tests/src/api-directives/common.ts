import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';
import sequential from 'promise-sequential';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import { getAWSExports } from '../aws-exports/awsExports';
import Observable from 'zen-observable';
import { addApi, amplifyPushWithoutCodeGen } from './workflows';
import gql from 'graphql-tag';
import {readJsonFile} from 'amplify-e2e-core';
import {configureAmplify} from './authHelper';



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
  await addApi(projectDir, schemaFilePath);
  await amplifyPushWithoutCodeGen(projectDir);

  await configureAmplify(projectDir);

  await testCompiledSchema(projectDir, schemaDocDirPath);
  await testMutations(schemaDocDirPath);
  await testQueries(schemaDocDirPath);
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

export async function testMutations(schemaDocDirPath: string) {
  const fileNames = fs.readdirSync(schemaDocDirPath); 
  let mutationFileNames = fileNames.filter(fileName => /^mutation[0-9]*\.graphql$/.test(fileName));

  if (mutationFileNames.length > 1) {
    mutationFileNames = mutationFileNames.sort((fn1, fn2) => {
      const n1 = parseInt(fn1.replace(/mutation|\.graphq/g, ''));
      const n2 = parseInt(fn2.replace(/mutation|\.graphq/g, ''));
      return n1 - n2;
    });
  }

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
    mutationTasks.push(async () => {
      await testMutation(mutation, mutationResult);
    });
  });

  await sequential(mutationTasks);
}

export async function testMutation(mutation: any, mutationResult?: any){
  console.log('////test mutation: ', mutation);
  console.log('////expected mutation result: ', mutationResult);
  let resultMatch = true;
  let errorMatch = true;
  try{
    const result = await API.graphql(graphqlOperation(mutation)) as any;
    console.log('////mutation result ', result);
    if(mutationResult && (!mutationResult.data || !_.isEqual(result.data, mutationResult.data))){
      resultMatch = false;
    }
  }catch(err){
    console.log('///mutation error', err);
    if(mutationResult && mutationResult.errors){
      errorMatch = mutationResult.errors.every((expectedError: any)=>{
        return err.errors.some((error: any) => {
          return expectedError.errorType === error.errorType;
        });
      })
    }else{
      errorMatch = false;
    }
  }
  if(!resultMatch || !errorMatch){
    throw new Error('Mutation test failed.');
  }
}

export async function testQueries(schemaDocDirPath: string) {
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
      await testQuery(query, queryResult);
    });
  });

  await sequential(queryTasks);
}

export async function testQuery(query: any, queryResult?: any){
  let resultMatch = true;
  let errorMatch = true;
  try{
    const result = await API.graphql(graphqlOperation(query)) as any;
    if(queryResult && (!queryResult.data || !_.isEqual(result.data, queryResult.data))){
      resultMatch = false;
    }
  }catch(err){
    if(queryResult && queryResult.errors){
      errorMatch = queryResult.errors.every((expectedError: any)=>{
        return err.errors.some((error: any) => {
          return expectedError.errorType === error.errorType;
        });
      })
    }else{
      errorMatch = false;
    }
  }
  if(!resultMatch || !errorMatch){
    throw new Error('Query test failed.');
  }
}