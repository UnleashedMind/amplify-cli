//handle subscription from another user

import {
    runAutTest
} from '../../common';

export async function runTest(projectDir: string) {
    //test owner
    await runAutTest(projectDir, __dirname);
    //test other user's ability to subscribe
}