export async function runPullCommand(environmentName: string, appId: string) {
    // console.log('checking to run pull command');
    // const client = require('../service').getAmplifyClient();
    // let result;
    // try {
    //     result = await client.getBackendEnvironment({appId, environmentName}).promise();
    // } catch (err) {
    //     console.log('error determining to run pull command');
    //     console.log(err);
    // }
    // if (result) {
    //     try {
    //         await (new (require('aws-sdk').S3)()).headBucket({Bucket: result.backendEnvironment.deploymentArtifacts}).promise();
    //         console.log('running pull command');
    //         return true;
    //     } catch (err) {
    //         // bucket does not exist
    //     }
    // }
    // console.log('not running pull');
    // return false;
}