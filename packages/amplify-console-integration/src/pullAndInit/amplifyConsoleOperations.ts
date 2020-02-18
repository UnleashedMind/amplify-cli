import * as aws from 'aws-sdk';
import * as moment from 'moment';
import * as dotenv from 'dotenv';

export function getConfiguredAmplifyClient() {
  dotenv.config();
  const config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.CLI_REGION,
  };
  return new aws.Amplify(config);
}

//delete all existing amplify console projects
export async function deleteAllAmplifyProjects(amplifyClient?: any) {
  if (!amplifyClient) {
    amplifyClient = getConfiguredAmplifyClient();
  }
  let token;
  do {
    token = await PaginatedDeleteProjects(amplifyClient, token);
  } while (token);
}

async function PaginatedDeleteProjects(amplifyClient: any, token?: any) {
  const sequential = require('promise-sequential');
  const maxResults = '25';
  const listAppsResult = await amplifyClient
    .listApps({
      maxResults,
      nextToken: token,
    })
    .promise();

  const deleteTasks = [];
  listAppsResult.apps.forEach(app => {
    deleteTasks.push(async () => {
      await amplifyClient.deleteApp({ appId: app.appId }).promise();
    });
  });
  await sequential(deleteTasks);

  return listAppsResult.nextToken;
}

export function generateBackendEnvParams(appId: string, projectName: string, envName: string) {
  const timeStamp = moment().format('YYMMDDHHmm');
  const stackName = `amplify-${projectName}-${envName}-${timeStamp}`;
  const deploymentBucketName = `${stackName}-deployment`;
  return { appId, envName, stackName, deploymentBucketName };
}

export async function createConsoleApp(projectName: string, amplifyClient?: any) {
  if (!amplifyClient) {
    amplifyClient = getConfiguredAmplifyClient();
  }
  const createAppParams = {
    name: projectName,
    environmentVariables: { _LIVE_PACKAGE_UPDATES: '[{"pkg":"@aws-amplify/cli","type":"npm","version":"latest"}]' },
  };

  const createAppResponse = await amplifyClient.createApp(createAppParams).promise();
  return createAppResponse.app.appId;
}

export async function createBackendEnvironment(backendParams: any, amplifyClient?: any) {
  if (!amplifyClient) {
    amplifyClient = getConfiguredAmplifyClient();
  }

  const { appId, envName, stackName, deploymentBucketName } = backendParams;

  const createEnvParams = {
    appId,
    environmentName: envName,
    stackName,
    deploymentArtifacts: deploymentBucketName,
  };

  await amplifyClient.createBackendEnvironment(createEnvParams).promise();
}
