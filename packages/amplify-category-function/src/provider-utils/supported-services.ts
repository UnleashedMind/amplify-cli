import { migrate, createWalkthrough, updateWalkthrough } from './awscloudformation/lambda-walkthroughs/lambda-walkthrough';
import * as lambdaController from './awscloudformation';
import { SupportedServices } from './supportedServicesType';
import { getIAMPolicies } from './awscloudformation/utils/cloudformationHelpers';
import { askExecRolePermissionsQuestions } from './awscloudformation/lambda-walkthroughs/execPermissionsWalkthrough';

export const supportedServices: SupportedServices = {
  Lambda: {
    walkthroughs: {
      createWalkthrough: createWalkthrough,
      updateWalkthrough: updateWalkthrough,
      migrate: migrate,
      getIAMPolicies: getIAMPolicies,
      askExecRolePermissionsQuestions: askExecRolePermissionsQuestions,
    },
    cfnFilename: `${__dirname}/../../resources/awscloudformation/cloudformation-templates/lambda-cloudformation-template.json.ejs`,
    provider: 'awscloudformation',
    providerController: lambdaController,
  },
  LambdaLayer: {
    walkthroughs: {
      createWalkthrough: createWalkthrough,
      updateWalkthrough: updateWalkthrough,
      migrate: migrate,
      getIAMPolicies: getIAMPolicies,
      askExecRolePermissionsQuestions: askExecRolePermissionsQuestions,
    },
    cfnFilename: `${__dirname}/../../resources/awscloudformation/cloudformation-templates/lambda-cloudformation-template.json.ejs`,
    provider: 'awscloudformation',
    providerController: lambdaController,
  },
};
