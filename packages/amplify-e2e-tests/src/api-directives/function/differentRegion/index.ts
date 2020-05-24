//special handling needed becasue we need to set up the function in a differnt region
import path from 'path';
import fs from 'fs-extra';
import { deleteProject, deleteProjectDir } from 'amplify-e2e-core';

import {
  addApiWithAPIKeyAuthType,
  amplifyPushWithoutCodeGen,
  addSimpleFunction,
  initProjectWithAccessKeyAndRegion
} from '../../workflows';


import {
    getApiKey,
    configureAmplify,
    getConfiguredAppsyncClientAPIKeyAuth,
  } from '../../authHelper';

import {
    testQueries
} from '../../common';

import {
    randomizedFunctionName
} from '../../functionTester'

export async function runTest(projectDir: string) {
    const functionRegion = process.env.CLI_REGION === 'us-west-2' ?  'us-east-1' : 'us-west-2';
    const functionProjectDirPath = path.join(path.dirname(projectDir), path.basename(projectDir)+'-function');

    try{
        const functionName = await setupFunction(projectDir, functionRegion);

        const schemaFilePath = path.join(__dirname, 'input.graphql');
        await addApiWithAPIKeyAuthType(projectDir, schemaFilePath);
        updateFunctionNameAndRegionInSchema(projectDir, functionName, functionRegion);
        await amplifyPushWithoutCodeGen(projectDir);
    
        const awsconfig = configureAmplify(projectDir);
        const apiKey = getApiKey(projectDir);
        const appSyncClient = getConfiguredAppsyncClientAPIKeyAuth(
            awsconfig.aws_appsync_graphqlEndpoint,
            awsconfig.aws_appsync_region,
            apiKey
        );
    
        await testQueries(__dirname, appSyncClient);
    }catch(e){
        throw e;
    }finally{
        await deleteFunctionProject(functionProjectDirPath);
    }
}

async function setupFunction(functionProjectDirPath: string, functionRegion: string): Promise<string>{
    const functionFilePath = path.join(__dirname, 'function.js');
    const functionName = randomizedFunctionName('function');
    await initProjectWithAccessKeyAndRegion(
        functionProjectDirPath,
        process.env.AWS_ACCESS_KEY_ID,
        process.env.AWS_SECRET_ACCESS_KEY,
        functionRegion
    );
    await addSimpleFunction(functionProjectDirPath, functionName);
    await amplifyPushWithoutCodeGen(functionProjectDirPath);
  
    const backendApiDirPath = path.join(functionProjectDirPath, 'amplify', 'backend', 'api');
    const amplifyFunctionIndexFilePath = path.join(backendApiDirPath, 'function', functionName, 'src', 'index.js');
  
    fs.copySync(functionFilePath, amplifyFunctionIndexFilePath);
  
    return functionName;
}

async function deleteFunctionProject(functionProjectDirPath: string){
    await deleteProject(functionProjectDirPath);
    deleteProjectDir(functionProjectDirPath);
}

function updateFunctionNameAndRegionInSchema(projectDir: string, functionName: string, functionRegion: string){
  const backendApiDirPath = path.join(projectDir, 'amplify', 'backend', 'api');
  const apiResDirName = fs.readdirSync(backendApiDirPath)[0];
  const amplifySchemaFilePath = path.join(backendApiDirPath, apiResDirName, 'schema.graphql');

  const amplifySchemaFileContents = fs.readFileSync(amplifySchemaFilePath).toString();
  amplifySchemaFileContents.replace('<function-name>', functionName);
  amplifySchemaFileContents.replace('<function-region>', functionRegion);
  fs.writeFileSync(amplifySchemaFilePath, amplifySchemaFileContents);
}