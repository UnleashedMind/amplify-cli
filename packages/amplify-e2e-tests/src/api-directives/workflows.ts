import { nspawn as spawn, getCLIPath, KEY_UP_ARROW, KEY_DOWN_ARROW} from 'amplify-e2e-core';

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
