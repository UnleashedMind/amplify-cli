import path from 'path';
import fs from 'fs-extra';
import sequential from 'promise-sequential';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import { getAWSExports } from '../aws-exports/awsExports';
import Observable from 'zen-observable';
import { addApi, amplifyPushAdd } from './workflows';
import gql from 'graphql-tag';


export async function runTest(projectDir: string, schemaDocDirPath: string) {
  const schemaFilePath = path.join(schemaDocDirPath, 'input.graphql');
  await addApi(projectDir, schemaFilePath);
  await amplifyPushAdd(projectDir);

  await configureAmplify(projectDir);

  await testCompiledSchema(projectDir, schemaDocDirPath);
  await testMutations(schemaDocDirPath);
  await testQueries(schemaDocDirPath);
}

async function configureAmplify(projectDir) {
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

export async function testSubscriptions(schemaDocDirPath: string) {
  const fileNames = fs.readdirSync(schemaDocDirPath);

  let subscriptionFileNames = fileNames.filter(fileName => /^subscription*/.test(fileName));

  if (subscriptionFileNames.length > 1) {
    subscriptionFileNames = subscriptionFileNames.sort((fn1, fn2) => {
      const n1 = parseInt(fn1.replace('subscription', ''));
      const n2 = parseInt(fn2.replace('subscription', ''));
      return n1 - n2;
    });
  }

  const subscriptionTasks = [];
  subscriptionFileNames.forEach(subscriptionFileName => {
    const subscriptionFilePath = path.join(schemaDocDirPath, subscriptionFileName);
    const subscription = fs.readFileSync(subscriptionFilePath).toString();

    //todo: read the mutations and the corresponding received 
    let mutations = ''; 
    let received: any[]; 

    subscriptionTasks.push(async () => {
      await testSubscription(subscription, undefined, mutations, undefined, received);
    });
  });

  await sequential(subscriptionTasks);
}

export async function testSubscription(
    subscription: string,
    subInput: any,
    mutation: string,
    mutInput: any,
    received: any[]
){
  const actualReceived: any[] = [];
  const actualError: any[] = [];
  let completed = false;
  const sub = (API.graphql(graphqlOperation(subscription, subInput)) as unknown as Observable<any>).subscribe({
    next: (event: any) => {
      actualReceived.push(event);
      console.log(event);
    },
    error: (err: any) => {
      actualError.push(err);
      console.log(err);
    },
    complete: () => {
      completed = true;
    }
  });

  await new Promise(res => setTimeout(() => res(), 2000));

  const mutationRes = await API.graphql(graphqlOperation(mutation, mutInput));

  await new Promise(res => setTimeout(() => res(), 5000));

  sub.unsubscribe();
  return actualReceived;
}


export async function subscribeUseAppSyncClient(
  projectDir: string,
  graphqlApiEndpoint: string,
  region: string,
  jwtToken: string,
  subscription: string,
  mutation: string,
  mutInput: any
){
  let appSyncClient = new AWSAppSyncClient({
      url: graphqlApiEndpoint,
      region,
      disableOffline: true,
      offlineConfig: {
        keyPrefix: 'userPools',
      },
      auth: {
        type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
        jwtToken: jwtToken
      },
    });

   const observer = appSyncClient.subscribe({
    query: gql(subscription)
  });

  const received: any[] = [];
  const sub = observer.subscribe((event: any) => {
    const post = event.data.onCreatePost;
    received.push(event);
    sub.unsubscribe();
    console.log(post);
  });

  await new Promise(res => setTimeout(() => res(), 2000));

  configureAmplify(projectDir);
  const mutationRes = await API.graphql(graphqlOperation(mutation, mutInput));

  await new Promise(res => setTimeout(() => res(), 2000));
}
  
  