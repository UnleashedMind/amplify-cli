import path from 'path';
import { addApiWithAPIKeyAuthType, amplifyPushWithoutCodeGen } from '../workflows';

import { getApiKey, configureAmplify, getConfiguredAppsyncClientAPIKeyAuth } from '../authHelper';

import { testMutations, testQueries } from '../common';

export async function runTest(projectDir: string) {
  const schemaFilePath = path.join(__dirname, 'input.graphql');
  await addApiWithAPIKeyAuthType(projectDir, schemaFilePath);
  await amplifyPushWithoutCodeGen(projectDir);

  const awsconfig = configureAmplify(projectDir);
  const apiKey = getApiKey(projectDir);
  const appSyncClient = getConfiguredAppsyncClientAPIKeyAuth(awsconfig.aws_appsync_graphqlEndpoint, awsconfig.aws_appsync_region, apiKey);

  await testMutations(__dirname, appSyncClient);
  await testQueries(__dirname, appSyncClient);
}

//schema
export const schema = `
type Post @model @auth(rules: [{ allow: public }]) {
  id: ID!
  title: String!
}

##public1
`
//mutations
export const mutation1 = `
mutation CreatePost($input: CreatePostInput!, $condition: ModelPostConditionInput) {
  createPost(input: $input, condition: $condition) {
    id
    title
    createdAt
    updatedAt
  }
}
`
export const input_mutation1 = {
    "input": {
        "id": "1",
        "title": "title1"
    }
}
export const expected_result_mutation1 = {
    "data": {
        "createPost": {
            "id": "1",
            "title": "title1",
            "createdAt": "<check-defined>",
            "updatedAt": "<check-defined>"
        }
    }
}

export const mutation2 = `
mutation UpdatePost($input: UpdatePostInput!, $condition: ModelPostConditionInput) {
  updatePost(input: $input, condition: $condition) {
    id
    title
    createdAt
    updatedAt
  }
}
`
export const input_mutation2 = {
    "input": {
        "id": "1",
        "title": "title1-updated"
    }
}
export const expected_result_mutation2 = {
    "data": {
        "updatePost": {
            "id": "1",
            "title": "title1-updated",
            "createdAt": "<check-defined>",
            "updatedAt": "<check-defined>"
        }
    }
}




