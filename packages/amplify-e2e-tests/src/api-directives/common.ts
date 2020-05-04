import path from 'path';
import fs from 'fs-extra';
import sequential from 'promise-sequential';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { getAWSExports } from '../aws-exports/awsExports';

import { addApi, amplifyPushAdd } from './workflows';

export async function runTest(projectDir: string, schemaDocDirPath: string) {
  const schemaFilePath = path.join(schemaDocDirPath, 'input.graphql');
  await addApi(projectDir, schemaFilePath);
  await amplifyPushAdd(projectDir);

  await configureAmplify(projectDir);

  await testCompiledSchema(projectDir, schemaDocDirPath);
  await testMutations(schemaDocDirPath);
  await testQueries(schemaDocDirPath);
}

async function configureAmplify(projectDir) {
  const awsconfig = getAWSExports(projectDir).default;
  Amplify.configure(awsconfig);
}

export async function testCompiledSchema(projectDir: string, schemaDocDirPath: string) {
  const docCompiledSchemaFilePath = path.join(schemaDocDirPath, 'generated.graphql');
  if (fs.existsSync(docCompiledSchemaFilePath)) {
    const backendApiDirPath = path.join(projectDir, 'amplify', 'backend', 'api');
    const apiResDirName = fs.readdirSync(backendApiDirPath)[0];
    const actualCompiledSchemaFilePath = path.join(backendApiDirPath, apiResDirName, 'build', 'schema.graphql');

    const docCompiledSchema = fs
      .readFileSync(docCompiledSchemaFilePath)
      .toString()
      .trim();
    const actualCompileSchema = fs
      .readFileSync(actualCompiledSchemaFilePath)
      .toString()
      .trim();

    if (docCompiledSchema !== actualCompileSchema) {
      throw new Error('Mismatching compiled schema.');
    }
  }
}

export async function testMutations(schemaDocDirPath: string) {
  let mutationFileNames = fs.readdirSync(schemaDocDirPath).filter(fileName => /^mutation*/.test(fileName));

  if (mutationFileNames.length > 1) {
    mutationFileNames = mutationFileNames.sort((fn1, fn2) => {
      const n1 = parseInt(fn1.replace('mutation', ''));
      const n2 = parseInt(fn2.replace('mutation', ''));
      return n1 - n2;
    });
  }

  const mutationTasks = [];
  mutationFileNames.forEach(mutationFileName => {
    const mutationFilePath = path.join(schemaDocDirPath, mutationFileName);
    const mutation = fs.readFileSync(mutationFilePath).toString();
    mutationTasks.push(async () => {
      await API.graphql(graphqlOperation(mutation));
    });
  });

  await sequential(mutationTasks);
}

export async function testQueries(schemaDocDirPath: string) {
  let queryFileNames = fs.readdirSync(schemaDocDirPath);

  queryFileNames = queryFileNames.filter(fileName => /^query*/.test(fileName));

  if (queryFileNames.length > 1) {
    queryFileNames = queryFileNames.sort((fn1, fn2) => {
      const n1 = parseInt(fn1.replace('query', ''));
      const n2 = parseInt(fn2.replace('query', ''));
      return n1 - n2;
    });
  }

  const queryTasks = [];
  queryFileNames.forEach(queryFileName => {
    const queryFilePath = path.join(schemaDocDirPath, queryFileName);
    const query = fs.readFileSync(queryFilePath).toString();

    queryTasks.push(async () => {
      await API.graphql(graphqlOperation(query));
    });
  });

  await sequential(queryTasks);
}
