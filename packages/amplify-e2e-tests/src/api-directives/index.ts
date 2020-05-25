import path from 'path';
import fs from 'fs-extra';
import { runTest } from './common';
import { runAutTest } from './authTester';
import { runFunctionTest } from './functionTester';

//The contents of files in the schema doc testing directories might be modified,
//and extra files might be added to test the input schema.
//The beginning part of a file marks the type of the modification it might have
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
    const schemaDocDirPath = path.join(__dirname, directive, section);
    if (!fs.existsSync(schemaDocDirPath)) {
      throw new Error(`Missing testing schema documents directory ${directive}/${section}`);
    }

    //If certain test does not fall in the common testing pattern or the @auth common testing pattern,
    //e.g. test for subscription, the index file inside schemaDocDirPath
    //can define its own runTest method, which will override the common testing pattern
    let schemaDocTestingModule;
    try {
      schemaDocTestingModule = await import(schemaDocDirPath);
    } catch {
      //do nothing
    }

    if (schemaDocTestingModule && schemaDocTestingModule.runTest) {
      await schemaDocTestingModule.runTest(projectDir);
    } else {
      switch(directive){
        case 'auth':
          await runAutTest(projectDir, schemaDocDirPath);
        break;
        case 'function': 
          await runFunctionTest(projectDir, schemaDocDirPath);
        break;
        default:
          await runTest(projectDir, schemaDocDirPath);
        break;
      }
    }
    
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}
