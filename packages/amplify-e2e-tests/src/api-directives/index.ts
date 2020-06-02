import path from 'path';
import fs from 'fs-extra';
import { runTest, runAutTest } from './common';
import { runFunctionTest } from './functionTester';

//The contents in the test files might be modified from its original version int he Amplify CLI doc
//and mutations or queries, which do not exist in the document, might be added to test the input schema.
//Marks the type of the modification:
//#remove: if the error can not be corrected, the file is excluded from the test, file name will be appended with '-'
//#change: modified the original content such as adding the missing pieces in imcomplete schemas
//#error: corrected error in the original content
//#extra: the content does not exist in the Amplify CLI document, added in the directory for the completeness of the testing, such as the mutation needed to test subscriptions

// to deal with bug in cognito-identity-js
(global as any).fetch = require('node-fetch');
// to deal with subscriptions in node env
(global as any).WebSocket = require('ws');

export async function testSchema(projectDir: string, directive: string, section: string): Promise<boolean> {
  try {
    const testFilePath = path.join(__dirname, `/tests/${directive}-${section}.ts`);
    if (!fs.existsSync(testFilePath)) {
      throw new Error(`Missing test file ${directive}-${section}.ts`);
    }

    console.log('///directive', directive);
    console.log('///section', section);
    
    let testModule;
    try {
      testModule = await import(testFilePath);
    } catch {
      throw new Error(`Unable to load test file ${directive}-${section}.ts`);
    }

    if (testModule.runTest) {
      await testModule.runTest(projectDir, testModule);
    } else {
      switch (directive) {
        case 'auth':
          await runAutTest(projectDir, testModule);
          break;
        case 'function':
          await runFunctionTest(projectDir, testModule);
          break;
        default:
          await runTest(projectDir, testModule);
          break;
      }
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}
