// Adding a sample bootstrap action
import { Blueprint } from '@caws-blueprint/blueprints.blueprint';
import { addGenericCdkBootstrapAction, CdkBootstrapActionConfiguration } from '../actions/action-cdk-bootstrap';
import { WorkflowEnvironment } from '../environment/workflow-environment';

export const makeCDKBootstrapWorkflow = (
  blueprint: Blueprint,
  environment: WorkflowEnvironment,
  options?: {
    CdkBootstrapActionConfiguration?: CdkBootstrapActionConfiguration;
    workflowName?: string;
  },
) => {
  const startingWorkflowDefinition = {
    SchemaVersion: '1.0',
    Name: options?.workflowName || 'sample-cdk-bootstrap',
    Triggers: [],
  };

  return addGenericCdkBootstrapAction({
    blueprint,
    workflow: startingWorkflowDefinition,
    actionName: 'BootstrapAction',
    environment,
    inputs: {
      Sources: ['WorkflowSource'],
    },
    outputs: {
      AutoDiscoverReports: {
        Enabled: true,
        ReportNamePrefix: 'rpt',
      },
      Artifacts: [
        {
          Name: 'cdkBootstrap.ouy',
          Files: ['**/*'],
        },
      ],
    },
    configuration: options?.cdkBootstrapActionConfiguration || {
      Region: 'us-west-2',
    },
  });
};
