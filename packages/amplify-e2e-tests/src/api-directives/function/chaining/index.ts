import path from 'path';
import { addApiWithAPIKeyAuthType, amplifyPushWithoutCodeGen } from '../../workflows';

import { getApiKey, configureAmplify, getConfiguredAppsyncClientAPIKeyAuth } from '../../authHelper';

import { testQueries } from '../../common';

import { addFunction, updateFunctionNameInSchema } from '../../functionTester';

export async function runTest(projectDir: string) {
  const schemaFilePath = path.join(__dirname, 'input.graphql');
  const function1Name = await addFunction(projectDir, __dirname, 'function1.js');
  const function2Name = await addFunction(projectDir, __dirname, 'function2.js');
  await addApiWithAPIKeyAuthType(projectDir, schemaFilePath);
  updateFunctionNameInSchema(projectDir, '<function1-name>', function1Name);
  updateFunctionNameInSchema(projectDir, '<function2-name>', function2Name);
  await amplifyPushWithoutCodeGen(projectDir);

  const awsconfig = configureAmplify(projectDir);
  const apiKey = getApiKey(projectDir);
  const appSyncClient = getConfiguredAppsyncClientAPIKeyAuth(awsconfig.aws_appsync_graphqlEndpoint, awsconfig.aws_appsync_region, apiKey);

  await testQueries(__dirname, appSyncClient);
}
