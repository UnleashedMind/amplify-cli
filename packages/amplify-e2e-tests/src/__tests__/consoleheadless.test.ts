import { executionType, executeHeadlessAmplifyCommand } from '../consoleheadless';

describe('amplify console related commands headless execution', () => {
  let projRoot: string;
  beforeEach(() => {
    // projRoot = createNewProjectDir();
  });

  afterEach(async () => {
    // await deleteProject(projRoot);
    // deleteProjectDir(projRoot);
  });

  it('plain init', async () => {
      const type = executionType.plainInit; 
      await executeHeadlessAmplifyCommand(type); 
  });

  it('pull then init', async () => {
    const type = executionType.pullThenInit; 
    await executeHeadlessAmplifyCommand(type); 
  });
});
