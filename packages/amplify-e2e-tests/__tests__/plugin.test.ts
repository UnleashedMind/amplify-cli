import {
    help,
    scan,
    listActive,
    listExcluded,
    listGeneralInfo
} from '../src/plugin';


describe('amplify plugin', () => {
    beforeEach(() => {
        jest.setTimeout(1000 * 60 * 60); // 1 hour
    });
  
    afterEach(async () => {
    });
  
    // it('plugin help', async () => {
    //     await pluginHelp(process.cwd()); 
    // }); 
  
    // it('plugin scan', async () => {
    //     await pluginScan(process.cwd()); 
    // }); 

    // it('plugin list active', async () => {
    //     await pluginListActive(process.cwd()); 
    // }); 

    // it('plugin list excluded', async () => {
    //     await pluginListExcluded(process.cwd()); 
    // }); 

    it('plugin list general info', async () => {
        await listGeneralInfo(process.cwd()); 
    }); 
})