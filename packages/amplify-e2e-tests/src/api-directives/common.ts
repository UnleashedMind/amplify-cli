import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';
import util from 'util';
import gql from 'graphql-tag';
import { readJsonFile } from 'amplify-e2e-core';
import {
  addApiWithAPIKeyAuthType,
  addApiWithCognitoUserPoolAuthType,
  addApiWithAPIKeyCognitoUserPoolIAMAuthTypes,
  amplifyPushWithoutCodeGen,
  updateAuthAddFirstUserGroup,
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
const PASSWORD = 'user1Password';

export async function runTest(projectDir: string, testModule: any) {
  await addApiWithAPIKeyAuthType(projectDir);
  updateSchemaInTestProject(projectDir, testModule.schema);
  await amplifyPushWithoutCodeGen(projectDir);

  const awsconfig = configureAmplify(projectDir);
  const apiKey = getApiKey(projectDir);
  const appSyncClient = getConfiguredAppsyncClientAPIKeyAuth(awsconfig.aws_appsync_graphqlEndpoint, awsconfig.aws_appsync_region, apiKey);

  await testMutations(testModule, appSyncClient);
  await testQueries(testModule, appSyncClient);
}

export async function runAutTest(projectDir: string, testModule: any) {
  await addApiWithCognitoUserPoolAuthType(projectDir);
  updateSchemaInTestProject(projectDir, testModule.schema);

  await updateAuthAddFirstUserGroup(projectDir, GROUPNAME);
  await amplifyPushWithoutCodeGen(projectDir);

  const userPoolId = getUserPoolId(projectDir);
  await setupUser(userPoolId, USERNAME, PASSWORD, GROUPNAME);

  const awsconfig = configureAmplify(projectDir);
  const user = await signInUser(USERNAME, PASSWORD);
  const appSyncClient = getConfiguredAppsyncClientCognitoAuth(awsconfig.aws_appsync_graphqlEndpoint, awsconfig.aws_appsync_region, user);
  
  await testMutations(testModule, appSyncClient);
  await testQueries(testModule, appSyncClient);
  await testSubscriptions(testModule, appSyncClient);
}

export async function runMultiAutTest(projectDir: string, testModule: any) {
  await addApiWithAPIKeyCognitoUserPoolIAMAuthTypes(projectDir);
  updateSchemaInTestProject(projectDir, testModule.schema);

  await updateAuthAddFirstUserGroup(projectDir, GROUPNAME);
  await amplifyPushWithoutCodeGen(projectDir);

  const userPoolId = getUserPoolId(projectDir);
  await setupUser(userPoolId, USERNAME, PASSWORD, GROUPNAME);

  const awsconfig = configureAmplify(projectDir);
  const user = await signInUser(USERNAME, PASSWORD);
  const appSyncClient = getConfiguredAppsyncClientCognitoAuth(awsconfig.aws_appsync_graphqlEndpoint, awsconfig.aws_appsync_region, user);

  await testMutations(testModule, appSyncClient);
  await testQueries(testModule, appSyncClient);
  await testSubscriptions(testModule, appSyncClient);
}

export function updateSchemaInTestProject(projectDir: string, schema: any){
  const backendApiDirPath = path.join(projectDir, 'amplify', 'backend', 'api');
  const apiResDirName = fs.readdirSync(backendApiDirPath)[0];
  const backendSchemaFilePath = path.join(backendApiDirPath, apiResDirName, 'schema.graphql');
  fs.writeFileSync(backendSchemaFilePath, schema);
}

export async function testMutations(testModule: any, appSyncClient: any) {
  let mutationNames = Object.keys(testModule).filter(key => /^mutation[0-9]*$/.test(key));

  if (mutationNames.length > 1) {
    mutationNames = mutationNames.sort((name1, name2) => {
      const n1 = parseInt(name1.replace(/mutation/, ''));
      const n2 = parseInt(name2.replace(/mutation/, ''));
      return n1 - n2;
    });
  }

  const mutationTasks = [];
  mutationNames.forEach(mutationName => {
    const mutation = testModule[mutationName];
    const mutationInput = testModule['input_' + mutationName];
    const mutationResult = testModule['expected_result_' + mutationName];

    mutationTasks.push(async () => {
      await testMutation(appSyncClient, mutation, mutationInput, mutationResult);
    });
  });

  await runInSequential(mutationTasks);
}

export async function testMutation(appSyncClient: any, mutation: any, mutationInput?: any, mutationResult?: any) {
  let resultMatch = true;
  let errorMatch = true;
  try {
    const result = await appSyncClient.mutate({
      mutation: gql(mutation),
      fetchPolicy: 'no-cache',
      variables: mutationInput,
    });
    if (!checkResult(result, mutationResult)) {
      resultMatch = false;
    }
  } catch (err) {
    if (!checkError(err, mutationResult)) {
      errorMatch = false;
    }
  }
  if (!resultMatch || !errorMatch) {
    console.log('resultMatch', resultMatch);
    console.log('errorMatch', errorMatch);
    throw new Error('Mutation test failed.');
  }
}

export async function testQueries(testModule: any, appSyncClient: any) {
  let queryNames = Object.keys(testModule).filter(key => /^mutation[0-9]*$/.test(key));

  if (queryNames.length > 1) {
    queryNames = queryNames.sort((name1, name2) => {
      const n1 = parseInt(name1.replace(/query/, ''));
      const n2 = parseInt(name2.replace(/query/, ''));
      return n1 - n2;
    });
  }

  const queryTasks = [];
  queryNames.forEach(queryName => {
    const query = testModule[queryName];
    const queryInput = testModule['input_' + queryName];
    const queryResult = testModule['expected_result_' + queryName];

    queryTasks.push(async () => {
      await testQuery(appSyncClient, query, queryInput, queryResult);
    });
  });

  await runInSequential(queryTasks);
}

export async function testQuery(appSyncClient: any, query: any, queryInput?: any, queryResult?: any) {
  let resultMatch = true;
  let errorMatch = true;
  try {
    const result = await appSyncClient.query({
      query: gql(query),
      fetchPolicy: 'no-cache',
      variables: queryInput,
    });
    if (!checkResult(result, queryResult)) {
      resultMatch = false;
    }
  } catch (err) {
    if (!checkError(err, queryResult)) {
      errorMatch = false;
    }
  }
  if (!resultMatch || !errorMatch) {
    throw new Error('Query test failed.');
  }
}

export async function testSubscriptions(testModule: any, appsyncClient: any) {
  let subscriptionNames = Object.keys(testModule).filter(key => /^subscription[0-9]*$/.test(key));

  if (subscriptionNames.length > 1) {
    subscriptionNames = subscriptionNames.sort((name1, name2) => {
      const n1 = parseInt(name1.replace(/subscription/, ''));
      const n2 = parseInt(name2.replace(/subscription/, ''));
      return n1 - n2;
    });
  }

  const subscriptionTasks = [];
  subscriptionNames.forEach(subscriptionName => {
    const subscription = testModule[subscriptionName];
    const subscriptionInput = testModule['input_' + subscriptionName];
    const subscriptionResult = testModule['expected_result_' + subscriptionName];
    const mutations = testModule['mutations_' + subscriptionName];
    const mutationsInput = testModule['input_mutations_' + subscriptionName];

    subscriptionTasks.push(async () => {
      await testSubscription(appsyncClient, subscription, mutations, subscriptionResult, subscriptionInput, mutationsInput);
    });
  });

  await runInSequential(subscriptionTasks);
}

export async function testSubscription(
  appSyncClient: any,
  subscription: string,
  mutations: any[],
  subscriptionResult: any,
  subscriptionInput?: any,
  mutationInputs?: any[],
) {
  const observer = appSyncClient.subscribe({
    query: gql(subscription),
    variables: subscriptionInput,
  });

  const received = [];
  const sub = observer.subscribe((event: any) => {
    received.push(event.data);
  });

  await new Promise(res => setTimeout(() => res(), 4000));

  const mutationTasks = [];
  for (let i = 0; i < mutations.length; i++) {
    const mutation = mutations[i];
    const mutationInput = mutationInputs ? mutationInputs[i] : undefined;
    mutationTasks.push(async () => {
      await appSyncClient.mutate({
        mutation: gql(mutation),
        fetchPolicy: 'no-cache',
        variables: mutationInput,
      });
      await new Promise(res => setTimeout(() => res(), 4000)); //to ensure correct order in received data
    });
  }

  await runInSequential(mutationTasks);

  await new Promise(res => setTimeout(() => res(), 4000));

  sub.unsubscribe();
  if (!checkResult(received, subscriptionResult)) {
    throw new Error('Subscription test failed.');
  }
}

/////
function checkResult(received: any, expected: any): boolean {
  if (!expected) {
    //the test does not request result check, as long as the mutation/query goes through, it's good
    return true;
  }
  const queue = [
    {
      received,
      expected,
      depth: 0,
    },
  ];
  try {
    return runCompare(queue);
  } catch (e) {
    return false;
  }
}

function checkError(received: any, expected: any): boolean {
  if (!expected) {
    //the test does not request result check, assume mutation/query should go through, but received error
    return false;
  }
  const queue = [
    {
      received,
      expected,
      depth: 0,
    },
  ];
  return runCompare(queue);
}

const MAX_DEPTH = 50;
function runCompare(queue: { received: any; expected: any; depth: number }[]): boolean {
  let result = true;

  while (queue.length > 0 && result) {
    const itemToCompare = queue.shift();
    if (itemToCompare.depth > MAX_DEPTH) {
      break;
    }
    if (typeof itemToCompare.expected === 'object') {
      if (itemToCompare.expected === null) {
        result = itemToCompare.received === null;
      } else if (itemToCompare.received === null) {
        result = false;
      } else if (typeof itemToCompare.received === 'object') {
        Object.keys(itemToCompare.expected).forEach(key => {
          queue.push({
            received: itemToCompare.received[key],
            expected: itemToCompare.expected[key],
            depth: itemToCompare.depth + 1,
          });
        });
      } else {
        result = false;
      }
    } else if (itemToCompare.expected === '<check-defined>') {
      result = itemToCompare.received !== null && itemToCompare.received !== undefined;
    } else {
      result = itemToCompare.received === itemToCompare.expected;
    }
  }

  return result;
}

export async function runInSequential(tasks: ((v: any) => Promise<any>)[]): Promise<any> {
  let result;

  for (const task of tasks) {
    result = await task(result);
  }

  return result;
}
