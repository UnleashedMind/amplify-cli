//special handling needed to test prediction
//This test will faile due to a possible AppSync bug, see details below the test code
import path from 'path';
import fs from 'fs-extra';
import gql from 'graphql-tag';
import { Storage } from 'aws-amplify';
import { addAuth, addS3Storage, addApiWithAPIKeyAuthType, amplifyPushWithoutCodeGen } from 'amplify-e2e-core';

import { getApiKey, configureAmplify, getConfiguredAppsyncClientAPIKeyAuth } from '../authHelper';
import { updateSchemaInTestProject } from '../common';

export async function runTest(projectDir: string, testModule: any) {
  const imageFilePath = path.join(__dirname, 'predictions-usage-image.jpg');
  
  await addAuth(projectDir);
  await addS3Storage(projectDir);
  await addApiWithAPIKeyAuthType(projectDir);
  updateSchemaInTestProject(projectDir, testModule.schema);

  await amplifyPushWithoutCodeGen(projectDir);

  const awsconfig = configureAmplify(projectDir);

  await Storage.put('myimage.jpg', fs.readFileSync(imageFilePath), {
    level: 'public',
    contentType: 'image/jpeg',
  });

  const apiKey = getApiKey(projectDir);
  const appSyncClient = getConfiguredAppsyncClientAPIKeyAuth(awsconfig.aws_appsync_graphqlEndpoint, awsconfig.aws_appsync_region, apiKey);

  const result = await appSyncClient.query({
    query: gql(query),
    fetchPolicy: 'no-cache',
  });

  expect(result).toBeDefined();
  const pollyURL = result.data.speakTranslatedImageText;
  // check that return format is a url
  expect(pollyURL).toMatch(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/);
}


/*
This test will fail:
There seems to be an AppSync bug, the error received:

    ../error ApolloError: GraphQL error: Unable to parse the JSON document: 'Unexpected character ('m' (code 109)): was expecting comma to separate Object entries
       at [Source: (String)"{
        "version": "2018-05-29",
        "method": "POST",
        "resourcePath": "/",
        "params": {
            "body": {
                "Image": {
                    "S3Object": {
                        "Bucket": "xxxxxxxx",
                        "Name": "public/"myimage.jpg""
              }
            }
          },
            "headers": {
                "Content-Type": "application/x-amz-json-1.1",
                "X-Amz-Target": "RekognitionService.DetectText"
          }
        }
      }"; line: 10, column: 37]'
          at new ApolloError (/Users/<username>/workspace/amplify/amplify-cli/node_modules/aws-appsync/node_modules/src/errors/ApolloError.ts:56:5)
          at /Users/<username>/workspace/amplify/amplify-cli/node_modules/aws-appsync/node_modules/src/core/QueryManager.ts:509:31
          at /Users/<username>/workspace/amplify/amplify-cli/node_modules/aws-appsync/node_modules/src/core/QueryManager.ts:1041:11
          at Array.forEach (<anonymous>)
          at /Users/<username>/workspace/amplify/amplify-cli/node_modules/aws-appsync/node_modules/src/core/QueryManager.ts:1040:10
          at Map.forEach (<anonymous>)
          at QueryManager.broadcastQueries (/Users/<username>/workspace/amplify/amplify-cli/node_modules/aws-appsync/node_modules/src/core/QueryManager.ts:1034:18)
          at Object.next (/Users/<username>/workspace/amplify/amplify-cli/node_modules/aws-appsync/node_modules/src/core/QueryManager.ts:1130:18)
          at notifySubscription (/Users/<username>/workspace/amplify/amplify-cli/node_modules/zen-observable/lib/Observable.js:135:18)
          at onNotify (/Users/<username>/workspace/amplify/amplify-cli/node_modules/zen-observable/lib/Observable.js:179:3) {
        graphQLErrors: [
          {
            path: [Array],
            data: null,
            errorType: 'MappingTemplate',
            errorInfo: null,
            locations: [Array],
            message: "Unable to parse the JSON document: 'Unexpected character ('m' (code 109)): was expecting comma to separate Object entries\n" +
              ' at [Source: (String)"{\n' +
              '  "version": "2018-05-29",\n' +
              '  "method": "POST",\n' +
              '  "resourcePath": "/",\n' +
              '  "params": {\n' +
              '      "body": {\n' +
              '          "Image": {\n' +
              '              "S3Object": {\n' +
              '                  "Bucket": "xxxxxxx",\n' +
              '                  "Name": "public/"myimage.jpg""\n' +
              '        }\n' +
              '      }\n' +
              '    },\n' +
              '      "headers": {\n' +
              '          "Content-Type": "application/x-amz-json-1.1",\n' +
              '          "X-Amz-Target": "RekognitionService.DetectText"\n' +
              '    }\n' +
              '  }\n' +
              `}"; line: 10, column: 37]'`
          }
        ],
        networkError: null,
        message: "GraphQL error: Unable to parse the JSON document: 'Unexpected character ('m' (code 109)): was expecting comma to separate Object entries\n" +
          ' at [Source: (String)"{\n' +
          '  "version": "2018-05-29",\n' +
          '  "method": "POST",\n' +
          '  "resourcePath": "/",\n' +
          '  "params": {\n' +
          '      "body": {\n' +
          '          "Image": {\n' +
          '              "S3Object": {\n' +
          '                  "Bucket": "xxxx",\n' +
          '                  "Name": "public/"myimage.jpg""\n' +
          '        }\n' +
          '      }\n' +
          '    },\n' +
          '      "headers": {\n' +
          '          "Content-Type": "application/x-amz-json-1.1",\n' +
          '          "X-Amz-Target": "RekognitionService.DetectText"\n' +
          '    }\n' +
          '  }\n' +
          `}"; line: 10, column: 37]'`,
        extraInfo: undefined
      }
*/

//schema
export const schema = `
type Query {
  speakTranslatedImageText: String @predictions(actions: [identifyText, translateText, convertTextToSpeech])
}
`

//queries
export const query = `
#change: remove redaudant ($input: SpeakTranslatedImageTextInput!)
query SpeakTranslatedImageText {
  speakTranslatedImageText(
    input: {
      identifyText: { key: "myimage.jpg" }
      translateText: { sourceLanguage: "en", targetLanguage: "es" }
      convertTextToSpeech: { voiceID: "Conchita" }
    }
  )
}
`



