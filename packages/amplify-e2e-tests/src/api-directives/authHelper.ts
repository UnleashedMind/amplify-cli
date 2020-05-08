import { CognitoIdentityServiceProvider } from 'aws-sdk';
import Amplify, { Auth, API } from 'aws-amplify';
import { getProjectMeta } from 'amplify-e2e-core';
import { getAWSExports } from '../aws-exports/awsExports';
import { addAuth, updateAuthAddUserGroup, updateAuthAddAdminQueries } from './workflows';

//https://aws.amazon.com/blogs/mobile/amplify-cli-enables-creating-amazon-cognito-user-pool-groups-configuring-fine-grained-permissions-on-groups-and-adding-user-management-capabilities-to-applications/
//https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js#accessing-aws-services
//https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js#sign-in

//#error: idp:AdminAddUserToGroup is not added into the document for the policy:
//https://docs.amplify.aws/cli/usage/iam


// accessKeyId: process.env.AWS_ACCESS_KEY_ID,
// secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// region: process.env.CLI_REGION,

export async function signUpUser(projectDir: string, username: string, password: string){
    await configureAmplify(projectDir);
    await Auth.signUp({
        username,
        password
    });
}

export async function addUserToGroup(projectDir: string, userName: string, groupName){
    const amplifyMeta = getProjectMeta(projectDir);
    const authResourceName = Object.keys(amplifyMeta.auth)[0];
    const { UserPoolId } = amplifyMeta.auth[authResourceName].output;
    const cognitoIdentityServiceProvider  = new CognitoIdentityServiceProvider({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.CLI_REGION,
    })
    await cognitoIdentityServiceProvider.adminAddUserToGroup({
        UserPoolId,
        Username: userName,
        GroupName: groupName
    }).promise(); 
}

export async function signInUser(projectDir: string, username: string, password: string){
    await configureAmplify(projectDir);
    const user = await Auth.signIn(username, password);
}

async function configureAmplify(projectDir) {
    const awsconfig = getAWSExports(projectDir).default;
    Amplify.configure(awsconfig);
}