import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { getProjectMeta } from 'amplify-e2e-core';
import Amplify, { Auth, API } from 'aws-amplify';
import { getAWSExports } from '../aws-exports/awsExports';
import { AuthenticationDetails } from 'amazon-cognito-identity-js';

//setupUser will add user to a cognito group and make its status to be "CONFIRMED",
//if groupName is specified, add the user to the group. 
export async function setupUser(
    userPoolId: string,
    username: string, 
    password: string,
    groupName?: string
){

    const cognitoClient = getConfiguredCognitoClient();
    await cognitoClient.adminCreateUser({
        UserPoolId: userPoolId,
        Username: username,
        MessageAction: 'SUPPRESS',
    }).promise();

    await cognitoClient.adminSetUserPassword({
        UserPoolId: userPoolId,
        Username: username,
        Password: password,
        Permanent: true
    }).promise();

    if(groupName){
        await cognitoClient.adminAddUserToGroup({
            UserPoolId: userPoolId,
            Username: username,
            GroupName: groupName
        }).promise();
    }
}

export async function addUserToGroup(
    cognitoClient: CognitoIdentityServiceProvider, 
    userPoolId: string,
    username: string, 
    groupName?: string
){
    await cognitoClient.adminAddUserToGroup({
        UserPoolId: userPoolId,
        Username: username,
        GroupName: groupName
    }).promise();
}

export function getConfiguredCognitoClient(): CognitoIdentityServiceProvider{
    const cognitoClient  = 
        new CognitoIdentityServiceProvider({apiVersion: '2016-04-19', region: process.env.CLI_REGION });

    const awsconfig = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.CLI_REGION,
    };

    cognitoClient.config.update(awsconfig);

    return cognitoClient;
}

export function getUserPoolId(projectDir: string){
    const amplifyMeta = getProjectMeta(projectDir);
    const authResourceName = Object.keys(amplifyMeta.auth)[0];
    return amplifyMeta.auth[authResourceName].output.UserPoolId;
}

export async function signInUser(projectDir: string, username: string, password: string){
    await configureAmplify(projectDir);
    const user = await Auth.signIn(username, password);
    return user;
}

export async function configureAmplify(projectDir) {
    const awsconfig = getAWSExports(projectDir).default;
    Amplify.configure(awsconfig);
}

export async function signInUser2(projectDir: string, username: string, realPw: string){
    configureAmplify(projectDir);
    const authDetails = new AuthenticationDetails({
        Username: username,
        Password: realPw,
    });
    const user = Amplify.Auth.createCognitoUser(username);
    const authRes: any = await authenticateUser(user, authDetails, realPw);
    console.log(`Logged in ${username} \n${authRes.getIdToken().getJwtToken()}`);
    return user;
}

export async function authenticateUser(user: any, details: any, realPw: string) {
    return new Promise((res, rej) => {
      user.authenticateUser(details, {
        onSuccess: function(result: any) {
          res(result);
        },
        onFailure: function(err: any) {
          rej(err);
        },
        newPasswordRequired: function(userAttributes: any, requiredAttributes: any) {
          user.completeNewPasswordChallenge(realPw, user.Attributes, this);
        },
      });
    });
}