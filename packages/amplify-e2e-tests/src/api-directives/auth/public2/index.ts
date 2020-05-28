import path from 'path';
import {
  addApiWithIAMAuthType,
  amplifyPushWithoutCodeGen,
} from '../../workflows';

import {
    configureAmplify,
    getConfiguredAppsyncClientIAMAuth,
  } from '../../authHelper';

import {
    testMutations,
    testQueries
} from '../../common';

export async function runTest(projectDir: string) {
    const schemaFilePath = path.join(__dirname, 'input.graphql');
    await addApiWithIAMAuthType(projectDir, schemaFilePath);
    await amplifyPushWithoutCodeGen(projectDir);

  const awsconfig = configureAmplify(projectDir);
  const appSyncClient = getConfiguredAppsyncClientIAMAuth(
    awsconfig.aws_appsync_graphqlEndpoint,
    awsconfig.aws_appsync_region
  );

  await testMutations(__dirname, appSyncClient);
  await testQueries(__dirname, appSyncClient);
}