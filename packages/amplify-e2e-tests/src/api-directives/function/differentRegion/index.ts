//special handling needed becasue we need to set up the function in a differnt region
import path from 'path';
import fs from 'fs-extra';
import { getProjectMeta, deleteProject, deleteProjectDir } from 'amplify-e2e-core';

import {
  addApiWithAPIKeyAuthType,
  amplifyPushWithoutCodeGen,
  amplifyPush,
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
        const functionName = await setupFunction(functionProjectDirPath, functionRegion);

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
    fs.ensureDirSync(functionProjectDirPath);
    await initProjectWithAccessKeyAndRegion(
        functionProjectDirPath,
        process.env.AWS_ACCESS_KEY_ID,
        process.env.AWS_SECRET_ACCESS_KEY,
        functionRegion
    );

    const functionFilePath = path.join(__dirname, 'function.js');
    const functionName = randomizedFunctionName('function');
    await addSimpleFunction(functionProjectDirPath, functionName);
  
    const amplifyBackendDirPath = path.join(functionProjectDirPath, 'amplify', 'backend');
    const amplifyFunctionIndexFilePath = path.join(amplifyBackendDirPath, 'function', functionName, 'src', 'index.js');
  
    fs.copySync(functionFilePath, amplifyFunctionIndexFilePath);

    await amplifyPush(functionProjectDirPath);

    const amplifyMeta = getProjectMeta(functionProjectDirPath);
  
    //return the actual function name in the other region
    return amplifyMeta.function[functionName].output.Name;
}

async function deleteFunctionProject(functionProjectDirPath: string){
    await deleteProject(functionProjectDirPath);
    deleteProjectDir(functionProjectDirPath);
}

function updateFunctionNameAndRegionInSchema(projectDir: string, functionName: string, functionRegion: string){
  const backendApiDirPath = path.join(projectDir, 'amplify', 'backend', 'api');
  const apiResDirName = fs.readdirSync(backendApiDirPath)[0];
  const amplifySchemaFilePath = path.join(backendApiDirPath, apiResDirName, 'schema.graphql');

  let amplifySchemaFileContents = fs.readFileSync(amplifySchemaFilePath).toString();

  amplifySchemaFileContents = amplifySchemaFileContents.replace(/<function-name>/g, functionName);
  amplifySchemaFileContents = amplifySchemaFileContents.replace(/<function-region>/g, functionRegion);

  fs.writeFileSync(amplifySchemaFilePath, amplifySchemaFileContents);
}