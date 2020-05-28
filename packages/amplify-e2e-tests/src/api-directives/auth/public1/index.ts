import path from 'path';
import {
  addApiWithAPIKeyAuthType,
  amplifyPushWithoutCodeGen,
} from '../../workflows';

import {
    getApiKey,
    configureAmplify,
    getConfiguredAppsyncClientAPIKeyAuth,
  } from '../../authHelper';

import {
    testMutations,
    testQueries
} from '../../common';

export async function runTest(projectDir: string) {
    const schemaFilePath = path.join(__dirname, 'input.graphql');
    await addApiWithAPIKeyAuthType(projectDir, schemaFilePath);
    await amplifyPushWithoutCodeGen(projectDir);

  const awsconfig = configureAmplify(projectDir);
  const apiKey = getApiKey(projectDir);
  const appSyncClient = getConfiguredAppsyncClientAPIKeyAuth(
    awsconfig.aws_appsync_graphqlEndpoint,
    awsconfig.aws_appsync_region,
    apiKey
  );

  await testMutations(__dirname, appSyncClient);
  await testQueries(__dirname, appSyncClient);
}