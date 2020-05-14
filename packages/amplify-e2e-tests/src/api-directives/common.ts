import path from 'path';
import fs from 'fs-extra';
import sequential from 'promise-sequential';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import { getAWSExports } from '../aws-exports/awsExports';
import Observable from 'zen-observable';
import { addApi, amplifyPushWithoutCodeGen } from './workflows';
import gql from 'graphql-tag';


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

export async function configureAmplify(projectDir) {
  const awsconfig = getAWSExports(projectDir).default;
  Amplify.configure(awsconfig);
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
  let mutationFileNames = fs.readdirSync(schemaDocDirPath).filter(fileName => /^mutation*/.test(fileName));

  if (mutationFileNames.length > 1) {
    mutationFileNames = mutationFileNames.sort((fn1, fn2) => {
      const n1 = parseInt(fn1.replace('mutation', ''));
      const n2 = parseInt(fn2.replace('mutation', ''));
      return n1 - n2;
    });
  }

  const mutationTasks = [];
  mutationFileNames.forEach(mutationFileName => {
    const mutationFilePath = path.join(schemaDocDirPath, mutationFileName);
    const mutation = fs.readFileSync(mutationFilePath).toString();
    mutationTasks.push(async () => {
      await API.graphql(graphqlOperation(mutation));
    });
  });

  await sequential(mutationTasks);
}

export async function testMutation(mutation: any, response: any){
  await API.graphql(graphqlOperation(mutation));
}

export async function testQueries(schemaDocDirPath: string) {
  let queryFileNames = fs.readdirSync(schemaDocDirPath);

  queryFileNames = queryFileNames.filter(fileName => /^query*/.test(fileName));

  if (queryFileNames.length > 1) {
    queryFileNames = queryFileNames.sort((fn1, fn2) => {
      const n1 = parseInt(fn1.replace('query', ''));
      const n2 = parseInt(fn2.replace('query', ''));
      return n1 - n2;
    });
  }

  const queryTasks = [];
  queryFileNames.forEach(queryFileName => {
    const queryFilePath = path.join(schemaDocDirPath, queryFileName);
    const query = fs.readFileSync(queryFilePath).toString();

    queryTasks.push(async () => {
      await API.graphql(graphqlOperation(query));
    });
  });

  await sequential(queryTasks);
}

export async function testQuery(query: any, response: any){
  await API.graphql(graphqlOperation(query));
}