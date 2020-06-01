import { initJSProjectWithProfile, deleteProject, createNewProjectDir, deleteProjectDir } from 'amplify-e2e-core';
import { testSchema } from '../api-directives';
import gql from 'graphql-tag';
import path from 'path';
import fs from 'fs-extra';
import { readJsonFile } from 'amplify-e2e-core';
import os from 'os';

const newLine = os.EOL;

const apidirectivespath = '/Users/zhoweimi/workspace/amplify/amplify-cli/packages/amplify-e2e-tests/src/api-directives';
const testsDirPath = path.join(apidirectivespath, 'tests');

describe('api directives refactor', () => {
  beforeAll(async ()=>{
    fs.ensureDir(testsDirPath);
  })
  beforeEach(async () => {
  });

  afterEach(async () => {
  });

  it('test refactor', async () => {
    refactorDirective('auth');
    refactorDirective('connection');
    refactorDirective('data-access');
    refactorDirective('function');
    refactorDirective('key');
    refactorDirective('model');
    refactorDirective('predictions');
    refactorDirective('searchable');
    refactorDirective('versioned');
  });
});

function refactorDirective(directive: string){
  const directivePath = path.join(apidirectivespath, directive); 
  const sections = fs.readdirSync(directivePath);

  sections.forEach((section)=>{
    const sectionPath = path.join(directivePath, section);
    if(fs.statSync(sectionPath).isDirectory()){
      refactor(directive, section);
    }
  })
}

function refactor(directive: string, section: string){
    console.log(`///refactor: ${directive} - ${section}`);
    const directivePath = path.join(apidirectivespath, directive);
    const sectionPath = path.join(directivePath, section);

    const generatedFilePath = path.join(testsDirPath, directive + '-' + section+'.ts');

    let generatedFileContent = '';

    //the index.ts file
    const existingIndexFilePath = path.join(sectionPath, 'index.ts');
    if(fs.existsSync(existingIndexFilePath)){
      const indexFileContent = fs.readFileSync(existingIndexFilePath).toString();
      generatedFileContent = insertIndexFileContent(generatedFileContent, indexFileContent);
    }

    generatedFileContent = checkNewLine(generatedFileContent);

    //the input schema
    const schemaFilePath = path.join(sectionPath, 'input.graphql');
    const schemaFileContent = fs.readFileSync(schemaFilePath).toString(); 
    generatedFileContent = insertInputSchemaFileContent(generatedFileContent, schemaFileContent);


    generatedFileContent = checkNewLine(generatedFileContent);

    //the mutations
    const mutationsContent = getMutations(sectionPath);
    generatedFileContent = insertMutations(generatedFileContent, mutationsContent);

    generatedFileContent = checkNewLine(generatedFileContent);

    //the queries
    const queriesContent = getQueries(sectionPath);
    generatedFileContent = insertQueries(generatedFileContent, queriesContent);

    generatedFileContent = checkNewLine(generatedFileContent);

    //the subscriptions
    const subscriptionsContent = getSubscriptions(sectionPath);
    generatedFileContent = insertSubscriptions(generatedFileContent, subscriptionsContent);

    generatedFileContent = checkNewLine(generatedFileContent);

    fs.writeFileSync(generatedFilePath, generatedFileContent);
}


function insertIndexFileContent(content: string, fileContent: string): string{
  fileContent = fileContent.replace(/..\/..\//g, '../');
  return content + fileContent;
}

function insertInputSchemaFileContent(content: string, fileContent: string): string{
  let result = content; 

  result += '//schema' + newLine;
  result += `export const schema = \`` + newLine;
  result += `${fileContent}`;
  result += '\`';

  return result; 
}

function insertMutations(content: string, newContent: string): string{
  let result = content; 

  if(newContent.length > 0){
    result += '//mutations' + newLine;
    result += newContent;
  }

  return result; 
}

function insertQueries(content: string, newContent: string): string{
  let result = content; 

  if(newContent.length > 0){
    result += '//queries' + newLine;
    result += newContent; 
  }

  return result; 
}

function insertSubscriptions(content: string, newContent: string): string{
  let result = content; 

  if(newContent.length > 0){
    result += '//subscriptions' + newLine;
    result += newContent; 
  }

  return result; 
}

function checkNewLine(content: string): string{
  if(content.length>0){
    content = content + newLine;
  }
  return content; 
}

export function getMutations(schemaDocDirPath: string): string {
  let result = ''; 

  const fileNames = fs.readdirSync(schemaDocDirPath);
  let mutationFileNames = fileNames.filter(fileName => /^mutation[0-9]*\.graphql$/.test(fileName));

  if (mutationFileNames.length > 1) {
    mutationFileNames = mutationFileNames.sort((fn1, fn2) => {
      const n1 = parseInt(fn1.replace(/mutation|\.graphq/g, ''));
      const n2 = parseInt(fn2.replace(/mutation|\.graphq/g, ''));
      return n1 - n2;
    });
  }

  mutationFileNames.forEach(mutationFileName => {
    // console.log('///mutationFileName: ', mutationFileName)
    const mutationInputFileName = 'input-' + mutationFileName.replace('.graphql', '.json');
    const mutationResultFileName = 'result-' + mutationFileName.replace('.graphql', '.json');
    const mutationFilePath = path.join(schemaDocDirPath, mutationFileName);
    const mutationInputFilePath = path.join(schemaDocDirPath, mutationInputFileName);
    const mutationResultFilePath = path.join(schemaDocDirPath, mutationResultFileName);
    const mutation = fs.readFileSync(mutationFilePath).toString();
    let mutationInput: any;
    let mutationResult: any;
    if (fs.existsSync(mutationInputFilePath)) {
      mutationInput = readJsonFile(mutationInputFilePath);
    }
    if (fs.existsSync(mutationResultFilePath)) {
      mutationResult = readJsonFile(mutationResultFilePath);
    }

    const mutationName = mutationFileName.replace('.graphql', '');

    result += `export const ${mutationName} = \`` + newLine;
    result += `${mutation}`;
    result += '\`' + newLine;

    if(mutationInput){
      result += `export const input_${mutationName} = ` + JSON.stringify(mutationInput, null, 4) + newLine;
    }

    if(mutationResult){
      result += `export const expected_result_${mutationName} = ` + JSON.stringify(mutationResult, null, 4) + newLine;
    }

    result += newLine; 
  });

  return result;
}

export function getQueries(schemaDocDirPath: string): string {
  let result = '';

  const fileNames = fs.readdirSync(schemaDocDirPath);
  let queryFileNames = fileNames.filter(fileName => /^query[0-9]*\.graphql$/.test(fileName));

  if (queryFileNames.length > 1) {
    queryFileNames = queryFileNames.sort((fn1, fn2) => {
      const n1 = parseInt(fn1.replace(/query|\.graphq/g, ''));
      const n2 = parseInt(fn2.replace(/query|\.graphq/g, ''));
      return n1 - n2;
    });
  }

  // const queryTasks = [];
  queryFileNames.forEach(queryFileName => {
    const querInputFileName = 'input-' + queryFileName.replace('.graphql', '.json');
    const queryResultFileName = 'result-' + queryFileName.replace('.graphql', '.json');
    const queryFilePath = path.join(schemaDocDirPath, queryFileName);
    const queryInputFilePath = path.join(schemaDocDirPath, querInputFileName);
    const queryResultFilePath = path.join(schemaDocDirPath, queryResultFileName);
    const query = fs.readFileSync(queryFilePath).toString();
    let queryInput: any;
    let queryResult: any;
    if (fs.existsSync(queryInputFilePath)) {
      queryInput = readJsonFile(queryInputFilePath);
    }
    if (fs.existsSync(queryResultFilePath)) {
      queryResult = readJsonFile(queryResultFilePath);
    }

    const queryName = queryFileName.replace('.graphql', '');

    result += `export const ${queryName} = \`` + newLine;
    result += `${query}`;
    result += '\`' + newLine;

    if(queryInput){
      result += `export const input_${queryName} = ` + JSON.stringify(queryInput, null, 4) + newLine;
    }

    if(queryResult){
      result += `export const expected_result_${queryName} = ` + JSON.stringify(queryResult, null, 4) + newLine;
    }

    result += newLine; 
  });

  return result;
}

export function getSubscriptions(schemaDocDirPath: string): string {
  let result = '';
  const fileNames = fs.readdirSync(schemaDocDirPath);
  let subscriptionFileNames = fileNames.filter(fileName => /^subscription[0-9]*\.graphql$/.test(fileName));

  if (subscriptionFileNames.length > 1) {
    subscriptionFileNames = subscriptionFileNames.sort((fn1, fn2) => {
      const n1 = parseInt(fn1.replace(/subscription|\.graphq/g, ''));
      const n2 = parseInt(fn2.replace(/subscription|\.graphq/g, ''));
      return n1 - n2;
    });
  }

  // const subscriptionTasks = [];
  subscriptionFileNames.forEach(subscriptionFileName => {
    const subscriptionResultFileName = 'result-' + subscriptionFileName.replace('.graphql', '.json');
    const subscriptionFilePath = path.join(schemaDocDirPath, subscriptionFileName);
    const subscriptionResultFilePath = path.join(schemaDocDirPath, subscriptionResultFileName);

    const subscription = fs.readFileSync(subscriptionFilePath).toString();
    let subscriptionResult: any;
    if (fs.existsSync(subscriptionResultFilePath)) {
      subscriptionResult = readJsonFile(subscriptionResultFilePath);
    }

    let mutationFileNames = fileNames.filter(fileName => {
      const regex = new RegExp('^mutation[0-9]*-' + subscriptionFileName);
      return regex.test(fileName);
    });

    if (mutationFileNames.length > 1) {
      mutationFileNames = mutationFileNames.sort((fn1, fn2) => {
        const regex = new RegExp('mutation' + '|-' + subscriptionFileName, 'g');
        const n1 = parseInt(fn1.replace(regex, ''));
        const n2 = parseInt(fn2.replace(regex, ''));
        return n1 - n2;
      });
    }

    const mutations = [];
    mutationFileNames.forEach(mutationFileName => {
      const mutationFilePath = path.join(schemaDocDirPath, mutationFileName);
      const mutation = fs.readFileSync(mutationFilePath).toString();
      mutations.push(mutation);
    });

    const subscriptionName = subscriptionFileName.replace('.graphql', '');

    result += `export const ${subscriptionName} = \`` + newLine;
    result += `${subscription}`;
    result += '\`' + newLine;

    if(mutations.length > 0){
      result += `export const mutations_${subscriptionName} = [` + newLine;
      mutations.forEach((mutation)=>{
        result += `\`${mutation}\`,` + newLine;
      })
      result += ']' + newLine;
    }

    if(subscriptionResult){
      result += `export const expected_result_${subscriptionName} = ` + JSON.stringify(subscriptionResult, null, 4) + newLine;
    }

    result += newLine; 
  });

  return result;
}