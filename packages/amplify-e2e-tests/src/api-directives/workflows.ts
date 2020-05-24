import { nspawn as spawn, getCLIPath, KEY_UP_ARROW, KEY_DOWN_ARROW} from 'amplify-e2e-core';


export function initProjectWithAccessKeyAndRegion(
  cwd: string, 
  accessKeyId: string, 
  secretAccessKey: string, 
  region: string
) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['init'], { cwd, stripColors: true })
      .wait('Enter a name for the project')
      .sendCarriageReturn()
      .wait('Enter a name for the environment')
      .sendCarriageReturn()//dev
      .wait('Choose your default editor:')
      .sendCarriageReturn()
      .wait("Choose the type of app that you're building")
      .sendCarriageReturn()
      .wait('What javascript framework are you using')
      .sendCarriageReturn()
      .wait('Source Directory Path:')
      .sendCarriageReturn()
      .wait('Distribution Directory Path:')
      .sendCarriageReturn()
      .wait('Build Command:')
      .sendCarriageReturn()
      .wait('Start Command:')
      .sendCarriageReturn()
      .wait('Using default provider  awscloudformation')
      .wait('Do you want to use an AWS profile?')
      .sendLine('n')
      .pauseRecording()
      .wait('accessKeyId')
      .sendLine(accessKeyId)
      .wait('secretAccessKey')
      .sendLine(secretAccessKey)
      .wait('region')
      .sendLine(region)
      .resumeRecording()
      .wait('Try "amplify add api" to create a backend API and then "amplify publish" to deploy everything')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

//add default auth
export function addAuth(projectDir: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['add', 'auth'], { cwd: projectDir, stripColors: true })
      .wait('Do you want to use the default authentication and security configuration')
      .sendCarriageReturn()
      .wait('How do you want users to be able to sign in')
      .sendCarriageReturn()
      .wait('Do you want to configure advanced settings')
      .sendCarriageReturn()
      .wait('"amplify publish" will build all your local backend and frontend resources')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}


//add default auth
export function addS3Storage(projectDir: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['add', 'storage'], { cwd: projectDir, stripColors: true })
      .wait('Please select from one of the below mentioned services:')
      .sendCarriageReturn()
      .wait('Please provide a friendly name for your resource that will be used to label this category in the project:')
      .sendCarriageReturn()
      .wait('Please provide bucket name:')
      .sendCarriageReturn()
      .wait('Who should have access:')
      .send(KEY_DOWN_ARROW)//'Auth and guest users'
      .sendCarriageReturn()
      .wait('What kind of access do you want for Authenticated users?')
      .send(' ') //create/update
      .send(KEY_DOWN_ARROW)
      .send(' ') //red
      .send(KEY_DOWN_ARROW)
      .send(' ') //read
      .sendCarriageReturn()
      .wait('What kind of access do you want for Guest users?')
      .send(' ') //create/update
      .send(KEY_DOWN_ARROW)
      .send(' ') //read
      .send(KEY_DOWN_ARROW)
      .send(' ') //red
      .sendCarriageReturn()
      .wait('Do you want to add a Lambda Trigger for your S3 Bucket?')
      .sendCarriageReturn() //"No"
      // .wait('"amplify push" builds all of your local backend resources and provisions them in the cloud')
      // .wait('"amplify publish" builds all of your local backend and front-end resources (if you added hosting category) and provisions them in the cloud')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

//update auth to add user group
export function updateAuthAddFirstUserGroup(projectDir: string, groupName: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['update', 'auth'], { cwd: projectDir, stripColors: true })
      .wait('What do you want to do?')
      .send(KEY_DOWN_ARROW)
      .send(KEY_DOWN_ARROW)
      .sendCarriageReturn()
      .wait('Provide a name for your user pool group')
      .send(groupName)
      .sendCarriageReturn()
      .wait('Do you want to add another User Pool Group')
      .sendCarriageReturn()
      .wait('Sort the user pool groups in order of preference')
      .sendCarriageReturn()
      .wait('"amplify publish" will build all your local backend and frontend resources')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

//update auth to add user group
export function updateAuthAddAdditionalUserGroup(projectDir: string, groupName: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['update', 'auth'], { cwd: projectDir, stripColors: true })
      .wait('What do you want to do?')
      .send(KEY_DOWN_ARROW)
      .send(KEY_DOWN_ARROW)
      .sendCarriageReturn()
      .wait('Select any user pool groups you want to delete')
      .sendCarriageReturn()
      .wait('Do you want to add another User Pool Group')
      .send('y')
      .sendCarriageReturn()
      .wait('Provide a name for your user pool group')
      .send(groupName)
      .sendCarriageReturn()
      .wait('Do you want to add another User Pool Group')
      .sendCarriageReturn()
      .wait('Sort the user pool groups in order of preference')
      .sendCarriageReturn()
      .wait('"amplify publish" will build all your local backend and frontend resources')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

//update auth to add admin queries
export function updateAuthAddAdminQueries(projectDir: string, adminGroupName: string){
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['update', 'auth'], { cwd: projectDir, stripColors: true })
      .wait('What do you want to do?')
      .send(KEY_DOWN_ARROW)
      .send(KEY_DOWN_ARROW)
      .send(KEY_DOWN_ARROW)
      .sendCarriageReturn()
      .wait('Do you want to restrict access to the admin queries API to a specific Group')
      .sendCarriageReturn()
      .wait('Select the group to restrict access with:')
      .send(KEY_UP_ARROW)
      .sendCarriageReturn()
      .wait('Provide a group name')
      .send(adminGroupName)
      .sendCarriageReturn()
      .wait('"amplify publish" will build all your local backend and frontend resources')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

//add function
export function addSimpleFunction(projectDir: string, functionName: string){
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['add', 'function'], { cwd: projectDir, stripColors: true })
      .wait('Provide a friendly name for your resource to be used as a label for this category in the project:')
      .sendLine(functionName)
      .wait('Provide the AWS Lambda function name:')
      .sendLine(functionName)
      .wait('Choose the function runtime that you want to use:')
      .sendCarriageReturn()
      .wait('Choose the function template that you want to use:')
      .send(KEY_DOWN_ARROW) //Hellow world
      .sendCarriageReturn()
      .wait('Do you want to access other resources created in this project from your Lambda function?')
      .sendLine('n')
      .wait('Do you want to invoke this function on a recurring schedule?')
      .sendLine('N')
      .wait('Do you want to edit the local lambda function now?')
      .sendLine('n')
      .wait('"amplify publish" builds all of your local backend and front-end resources')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

//add default api
export function addApiWithAPIKeyAuthType(projectDir: string, schemaFilePath: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['add', 'api'], { cwd: projectDir, stripColors: true })
      .wait('Please select from one of the below mentioned services:')
      .sendCarriageReturn()
      .wait('Provide API name:')
      .sendCarriageReturn()
      .wait(/.*Choose the default authorization type for the API.*/)
      .sendCarriageReturn()
      .wait(/.*Enter a description for the API key.*/)
      .sendCarriageReturn()
      .wait(/.*After how many days from now the API key should expire.*/)
      .sendCarriageReturn()
      .wait(/.*Do you want to configure advanced settings for the GraphQL API.*/)
      .sendCarriageReturn()
      .wait('Do you have an annotated GraphQL schema?')
      .sendLine('y')
      .wait('Provide your schema file path:')
      .sendLine(schemaFilePath)
      .wait('"amplify publish" will build all your local backend and frontend resources')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

//checked
export function addApiWithCognitoUserPoolAuthType(projectDir: string, schemaFilePath: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['add', 'api'], { cwd: projectDir, stripColors: true })
      .wait('Please select from one of the below mentioned services:')
      .sendCarriageReturn()
      .wait('Provide API name:')
      .sendCarriageReturn()
      .wait('Choose the default authorization type for the API')
      .send(KEY_DOWN_ARROW)
      .sendCarriageReturn()
      .wait('Do you want to use the default authentication and security configuration')
      .sendCarriageReturn()
      .wait('How do you want users to be able to sign in')
      .sendCarriageReturn()
      .wait('Do you want to configure advanced settings?')
      .sendCarriageReturn()
      .wait('Do you want to configure advanced settings for the GraphQL AP')
      .sendCarriageReturn()
      .wait('Do you have an annotated GraphQL schema?')
      .sendLine('y')
      .wait('Provide your schema file path:')
      .sendLine(schemaFilePath)
      .wait('"amplify publish" will build all your local backend and frontend resources')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

//need edit:
export function addApiWithIAMAuthType(projectDir: string, schemaFilePath: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['add', 'api'], { cwd: projectDir, stripColors: true })
      .wait('Please select from one of the below mentioned services:')
      .sendCarriageReturn()
      .wait('Provide API name:')
      .sendCarriageReturn()
      .wait(/.*Choose the default authorization type for the API.*/)
      .send(KEY_UP_ARROW)
      .send(KEY_UP_ARROW)
      .sendCarriageReturn()
      .wait(/.*Do you want to configure advanced settings for the GraphQL API.*/)
      .sendCarriageReturn()
      .wait('Do you have an annotated GraphQL schema?')
      .sendLine('y')
      .wait('Provide your schema file path:')
      .sendLine(schemaFilePath)
      .wait('"amplify publish" will build all your local backend and frontend resources')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

//need edit:
export function addApiWithOIDCAuthType(
  projectDir: string, 
  oidcProviderName: string, 
  oidcProviderDomain: string, 
  oidcClientId: string, 
  ttlaIssueInMillisecond: string,
  ttlaAuthInMillisecond: string,
  schemaFilePath: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['add', 'api'], { cwd: projectDir, stripColors: true })
      .wait('Please select from one of the below mentioned services:')
      .sendCarriageReturn()
      .wait('Provide API name:')
      .sendCarriageReturn()
      .wait(/.*Choose the default authorization type for the API.*/)
      .send(KEY_DOWN_ARROW)
      .send(KEY_DOWN_ARROW)
      .send(KEY_DOWN_ARROW)
      .sendCarriageReturn()
      .wait('Enter a name for the OpenID Connect provider')
      .send(oidcProviderName)
      .sendCarriageReturn()
      .wait('Enter the OpenID Connect provider domain (Issuer URL)')
      .send(oidcProviderDomain)
      .sendCarriageReturn()
      .wait('Enter the Client Id from your OpenID Client Connect application (optional)')
      .send(oidcClientId)
      .sendCarriageReturn()
      .wait('Enter the number of milliseconds a token is valid after being issued to a user')
      .send(ttlaIssueInMillisecond)
      .sendCarriageReturn()
      .wait('Enter the number of milliseconds a token is valid after being authenticated')
      .send(ttlaAuthInMillisecond)
      .sendCarriageReturn()
      .wait(/.*Do you want to configure advanced settings for the GraphQL API.*/)
      .sendCarriageReturn()
      .wait('Do you have an annotated GraphQL schema?')
      .sendLine('y')
      .wait('Provide your schema file path:')
      .sendLine(schemaFilePath)
      .wait('"amplify publish" will build all your local backend and frontend resources')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

export function removeApi(projectDir: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['remove', 'api'], { cwd: projectDir, stripColors: true })
      .wait('Choose the resource you would want to remove')
      .sendCarriageReturn()
      .wait('Are you sure you want to delete the resource?')
      .sendCarriageReturn()
      .wait('Successfully removed resource')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

export function gqlCompile(projectDir: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['api', 'gql-compile'], { cwd: projectDir, stripColors: true })
      .wait('GraphQL schema compiled successfully.')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

export function amplifyPushWithoutCodeGen(projectDir: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['push'], { cwd: projectDir, stripColors: true })
      .wait('Are you sure you want to continue?')
      .sendLine('y')
      .wait('Do you want to generate code for your newly created GraphQL API')
      .sendLine('n')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}


export function amplifyPushWithJavascriptCodeGen(projectDir: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['push'], { cwd: projectDir, stripColors: true })
      .wait('Are you sure you want to continue?')
      .sendLine('y')
      .wait('Do you want to generate code for your newly created GraphQL API')
      .sendLine('y')
      .wait('Choose the code generation language target')
      .sendCarriageReturn()
      .wait('Enter the file name pattern of graphql queries, mutations and subscriptions')
      .sendCarriageReturn()
      .wait('Do you want to generate/update all possible GraphQL operations')
      .sendCarriageReturn()
      .wait('Enter maximum statement depth')
      .sendCarriageReturn()
      .wait('GraphQL API KEY:')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

export function amplifyPushWithTypescriptCodeGen(projectDir: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['push'], { cwd: projectDir, stripColors: true })
      .wait('Are you sure you want to continue?')
      .sendLine('y')
      .wait('Do you want to generate code for your newly created GraphQL API')
      .sendLine('y')
      .wait('Choose the code generation language target')
      .send(KEY_UP_ARROW)
      .sendCarriageReturn()
      .wait('Enter the file name pattern of graphql queries, mutations and subscriptions')
      .sendCarriageReturn()
      .wait('Do you want to generate/update all possible GraphQL operations')
      .sendCarriageReturn()
      .wait('Enter maximum statement depth')
      .sendCarriageReturn()
      .wait('Enter the file name for the generated code (src/API.ts)')
      .sendCarriageReturn()
      .wait('GraphQL API KEY:')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

export function amplifyPush(projectDir: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['push'], { cwd: projectDir, stripColors: true })
      .wait('Are you sure you want to continue?')
      .sendLine('y')
      .wait('All resources are updated in the cloud')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

//codegen:
export function addCodeGen(projectDir: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['codegen', 'add'], { cwd: projectDir, stripColors: true })
      .wait('Choose the code generation language target')
      .sendCarriageReturn()
      .wait('Enter the file name pattern of graphql queries, mutations and subscriptions')
      .sendCarriageReturn()
      .wait('Do you want to generate/update all possible GraphQL operations')
      .sendCarriageReturn()
      .wait('Enter maximum statement depth')
      .sendCarriageReturn()
      .wait('Generated GraphQL operations successfully and saved at src/graphql')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}


export function runCodeGen(projectDir: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['codegen'], { cwd: projectDir, stripColors: true })
      .wait('Generated GraphQL operations successfully and saved at src/graphql')
      .run((err: Error) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
  });
}

