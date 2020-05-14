import path from 'path';
import fs from 'fs-extra';
import sequential from 'promise-sequential';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import { getAWSExports } from '../aws-exports/awsExports';
import Observable from 'zen-observable';
import { addApi, amplifyPushWithoutCodeGen } from './workflows';
import gql from 'graphql-tag';
import {configureAmplify} from './common';


export async function testSubscriptions(schemaDocDirPath: string) {
    const fileNames = fs.readdirSync(schemaDocDirPath);
  
    let subscriptionFileNames = fileNames.filter(fileName => /^subscription*/.test(fileName));
  
    if (subscriptionFileNames.length > 1) {
      subscriptionFileNames = subscriptionFileNames.sort((fn1, fn2) => {
        const n1 = parseInt(fn1.replace('subscription', ''));
        const n2 = parseInt(fn2.replace('subscription', ''));
        return n1 - n2;
      });
    }
  
    const subscriptionTasks = [];
    subscriptionFileNames.forEach(subscriptionFileName => {
      const subscriptionFilePath = path.join(schemaDocDirPath, subscriptionFileName);
      const subscription = fs.readFileSync(subscriptionFilePath).toString();
  
      //todo: read the mutations and the corresponding received 
      let mutations = ''; 
      let received: any[]; 
  
      subscriptionTasks.push(async () => {
        await testSubscription(subscription, undefined, mutations, undefined, received);
      });
    });
  
    await sequential(subscriptionTasks);
  }
  
  export async function testSubscription(
      subscription: string,
      subInput: any,
      mutation: string,
      mutInput: any,
      received: any[]
  ){
    const actualReceived: any[] = [];
    const actualError: any[] = [];
    let completed = false;
    const sub = (API.graphql(graphqlOperation(subscription, subInput)) as unknown as Observable<any>).subscribe({
      next: (event: any) => {
        actualReceived.push(event.value.data);
        console.log(event);
      },
      error: (err: any) => {
        actualError.push(err);
        console.log(err);
      },
      complete: () => {
        completed = true;
      }
    });
  
    await new Promise(res => setTimeout(() => res(), 2000));
  
    const mutationRes = await API.graphql(graphqlOperation(mutation, mutInput));
  
    await new Promise(res => setTimeout(() => res(), 5000));
  
    sub.unsubscribe();
    return actualReceived;
  }
  
  
  export async function subscribeUseAppSyncClient(
    projectDir: string,
    graphqlApiEndpoint: string,
    region: string,
    jwtToken: string,
    subscription: string,
    mutation: string,
    mutInput: any
  ){
    let appSyncClient = new AWSAppSyncClient({
        url: graphqlApiEndpoint,
        region,
        disableOffline: true,
        offlineConfig: {
          keyPrefix: 'userPools',
        },
        auth: {
          type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
          jwtToken: jwtToken
        },
      });
  
     const observer = appSyncClient.subscribe({
      query: gql(subscription)
    });
  
    const received: any[] = [];
    const sub = observer.subscribe((event: any) => {
      received.push(event.data);
      sub.unsubscribe();
    });
  
    await new Promise(res => setTimeout(() => res(), 2000));
  
    configureAmplify(projectDir);
    const mutationRes = await API.graphql(graphqlOperation(mutation, mutInput));
  
    await new Promise(res => setTimeout(() => res(), 2000));
    sub.unsubscribe();
  }
    
    