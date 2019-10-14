import * as nexpect from 'nexpect';
import { getCLIPath, isCI } from '../utils';


export function configurePluginDirectories(
    cwd: string,
    verbose: Boolean = isCI() ? false : true
) {
    return new Promise((resolve, reject) => {
        nexpect
        .spawn(getCLIPath(), ['plugin', 'list'], { cwd, stripColors: true, verbose })
        .wait('Select the section to list')
        .send('j')
        .sendline('j')
        .run(function(err: Error) {
            if (!err) {
            resolve();
            } else {
            reject(err);
            }
        });
    });
}