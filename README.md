![Build](https://github.com/aws/caws-blueprints/actions/workflows/build-action.yml/badge.svg)

[Documentation and wiki](https://github.com/aws/caws-blueprints/wiki)

[Other blueprint repos](https://github.com/orgs/aws/teams/amazon-blueprints-contributors/repositories)

## Set Up:

We highly recommend you use [vscode](https://code.visualstudio.com/). This repo is set up to link things properly when using VScode. Although plugins
also exist for vim. Many gitignored files will be invisible in vim and may cause annoying problems.

#### Prereq:

(1) Make sure you have `toolbox` and `ada` installed.

(2) Install these globally. These are requirements for various tooling to work properly and are available from public npm.

```
brew install nvm            # blueprints work only with Node 18.x
nvm use
npm install npm@9.7.2 -g  # we depend on npm v9.7.2
npm install yarn ts-node webpack webpack-cli -g
brew install jq
```

Add this to your `~/.bash_profile`:

```
set-blueprints-npm-repo() {
  # sign into the aws account that contains the proper codeartifact repository. Ask the blueprints team for access
  ada credentials update --once --account 721779663932 --role codeartifact-readonly --profile=codeartifact-readonly

  # Set NPM config to also be the same repository (needed for some synths to work properly)
  aws codeartifact login --region us-west-2 --tool npm --repository global-templates --domain template --domain-owner 721779663932 --profile=codeartifact-readonly

  #set the repositories in your workspace as an environment variable
  export NPM_REPO=`aws codeartifact get-repository-endpoint --region us-west-2 --domain template --domain-owner 721779663932 --repository global-templates --format npm --profile=codeartifact-readonly | jq -r '.repositoryEndpoint'`
  echo 'NPM_REPO set to: '$NPM_REPO
  export NPM_REPO_AUTH_TOKEN=`aws codeartifact get-authorization-token --region us-west-2 --domain template --domain-owner 721779663932 --query authorizationToken --profile=codeartifact-readonly --output text`
}

# setup the blueprints repo for use
blueprints-setup() {
  nvm use

  # The blueprints repo uses yarn2 which doesn't support projen's --check-post-synthesis flag
  # Disable projen post synthesis
  export PROJEN_DISABLE_POST=1

  # Blueprints are currently published to a private codeartifact repository until the public launch of code.aws.
  # You'll need to ask the blueprints team for access.
  set-blueprints-npm-repo
}
```

## Development

Run these commands to get started building blueprints. The first time set-up may take a minute or two.

```
git clone https://github.com/aws/caws-blueprints
cd caws-blueprints
nvm use
source ~/.bash_profile
blueprints-setup
yarn && yarn build
```

You're done!

Unless you have access to the blueprints organization in quokka, you will not be able to publsih preview versions of these blueprints.

## Testing Changes

Modify a component

```
cd packages/components/<component>
```

Rebuild the component

```
yarn build
```

To see the changes applied in a blueprint run synth

```
cd packages/blueprints/<blueprint>
yarn blueprint:synth
```

This generates the blueprint in the `synth` folder

```
packages/blueprints/<blueprint>/synth/<timestamp>
```

## Snapshot testing

Blueprints support [snapshot testing](https://jestjs.io/docs/snapshot-testing) on configurations provided by blueprint authors. Once snapshot testing
is enabled and configured, the build/test process will synthesize the given configurations and verify that the synthesized outputs haven't changed
from the reference snapshot.

To enable:

1. In `.projenrc.ts`, update the input object to `ProjenBlueprint` with the file(s) you want snapshoted.

```
{
  ....
  blueprintSnapshotConfiguration: {
    snapshotGlobs: ['**', '!environments/**', '!aws-account-to-environment/**'],
  },
}
```

2. Resynthesize the blueprint with `yarn projen`. This will create several TypeScript files in your blueprint project. Do not edit these source files,
   as they're maintained and regenerated by Projen.
3. Find the directory `src/wizard-configurations`, where you'll find the file `default-config.json` with an empty object. Customize or replace this
   file with one or more of your own test configurations. Each test configurations will be merged with the project's `defaults.json`, synthesized, and
   compared to snapshots during `yarn test`.

To run: run `yarn test` or `yarn test:update` or any task that includes _test_. The first time you run it, expect to see the lines:

> Snapshot Summary › NN snapshots written from 1 test suite.

Subsequent test runs will verify that synthesized output hasn't changed from these snapshots and display a line like:

> Snapshots: NN passed, NN total

If you intentionally change your blueprint to emit different output, then run `yarn test:update` to update the reference snapshots.

Snapshots expect synthesized output to be constant from run to run. If your blueprint generates files that vary, you must exclude it from snapshot
testing. Update the `blueprintSnapshotConfiguration` object of your `ProjenBlueprint` input object to add the `snapshotGlobs` property. This property
is an array of [globs](https://github.com/isaacs/node-glob#glob-primer) that determine which files to include and exclude from snapshotting. Note that
there is a _default_ list of globs; if you specify your own list, you may need to explicitly bring back the default entries.
