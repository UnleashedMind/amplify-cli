import { nspawn as spawn, getCLIPath } from 'amplify-e2e-core';

export function addApi(projectDir: string, schemaFilePath: string) {
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

export function amplifyPushAdd(projectDir: string) {
  return new Promise((resolve, reject) => {
    spawn(getCLIPath(), ['push'], { cwd: projectDir, stripColors: true })
      .wait('Are you sure you want to continue?')
      .sendLine('y')
      .wait('Do you want to generate code for your newly created GraphQL API')
      .sendLine('n')
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
