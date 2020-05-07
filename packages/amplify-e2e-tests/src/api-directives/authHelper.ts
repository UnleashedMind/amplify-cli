import Amplify, { Auth, API } from 'aws-amplify';
import { getAWSExports } from '../aws-exports/awsExports';
import { addAuth, updateAuthAddUserGroup, updateAuthAddAdminQueries } from './workflows';

// https://aws.amazon.com/blogs/mobile/amplify-cli-enables-creating-amazon-cognito-user-pool-groups-configuring-fine-grained-permissions-on-groups-and-adding-user-management-capabilities-to-applications/

//https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js#accessing-aws-services


export async function signUpUser(projectDir: string, username: string, password: string){
}


export async function addUserToGroup(projectDir: string, userName: string, groupName){

}

export async function signInUser(projectDir: string, username: string, password: string){
}