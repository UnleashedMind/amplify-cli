import path from 'path';
import fs from 'fs-extra';
import { runTest } from './common';

export async function testSchema(projectDir: string, directive: string, section: string): Promise<boolean> {
  try {
    const schemaDocDirPath = path.join(__dirname, directive, section);
    if (!fs.existsSync(schemaDocDirPath)) {
      throw new Error(`Missing testing schema documents directory ${directive}/${section}`);
    }

    //If certain schema needs special handling, the index file inside schemaDocDirPath
    //can define its own runTest method, which will override the common implementation
    let schemaDocTestingModule;
    try {
      schemaDocTestingModule = await import(schemaDocDirPath);
    } catch {
      //do nothing
    }

    if (schemaDocTestingModule && schemaDocTestingModule.runTest) {
      await schemaDocTestingModule.runTest(projectDir);
    } else {
      await runTest(projectDir, schemaDocDirPath);
    }

    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }
}
