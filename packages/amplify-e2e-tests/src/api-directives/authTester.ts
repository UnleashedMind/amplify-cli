import path from 'path';
import _ from 'lodash';
import {
  addApiWithCognitoUserPoolAuthType, 
  updateAuthAddFirstUserGroup, 
  amplifyPushWithoutCodeGen
} from './workflows';

import {
  setupUser,
  getUserPoolId,
  configureAmplify,
  signInUser,
  getConfiguredAppsyncClientCognitoAuth,
} from './authHelper';

import {
    testCompiledSchema,
    testMutations,
    testQueries
} from './common';

const GROUPNAME = 'admin';
const USERNAME = 'user1';
const PASSWORD = 'user1Password'

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
    const appsyncClient = getConfiguredAppsyncClientCognitoAuth(
      awsconfig.aws_appsync_graphqlEndpoint,
      awsconfig.aws_appsync_region,
      user
    );
  
    await testCompiledSchema(projectDir, schemaDocDirPath);
    await testMutations(schemaDocDirPath, appsyncClient);
    await testQueries(schemaDocDirPath, appsyncClient);
}