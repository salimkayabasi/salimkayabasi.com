---
title: Better GitHub flow with using GitHub Actions
lead: |
  GitHub flow is already lightweight and easy to understand but we can make it better with using GitHub Actions
date: 2021-05-21T11:24:20.000Z
---

{{< figure src="./assets/flow-deploy.png" caption="taken from GitHub flow documentation">}}

I would like to optimize the `Deploy` step of GitHub flow but before reading further, it might be better to check [GitHub flow](https://guides.github.com/introduction/flow/).

Depending on team requirements and decision, deployment step can be on `pull request` level or maybe after merging it to `HEAD` branch.
Most of the client-first projects; mobile apps, single page apps and similar other projects can be deployed/published as a temproary state.
Those temprorary deployments can be removed after merging the pull requests. But for the backend application, it would be easy solution to deploy them directly to target environment and test it there after merging pull requests.

## Beauty of GitHub Actions?

GitHub flow doesn't mention about anything related to release branches or tags or any other alternatives for deploying multiple environments on same repository.
As we all know, we need at least two different environments. One for development env to see the latest changes with high frequency of deployments.
Another one called production env for our users to access it.

Some teams would prefer to have protected branches for each environments. It may help you to see what was deployed to which environment.
As an idea, I don't prefer to use git as deployment tracking tool.

GitHub is offering [Environment](https://docs.github.com/en/actions/reference/environments) out of the box and it can be integrated with GitHub Actions.
It is possible to configure deployment steps to deploy spesific environment when conditions are met.

{{< figure src="./assets/envs.png" caption="Multiple environments have been created">}}

Just a single click to create a new environment and start defining conditions for deploying to given environment.

{{< figure src="./assets/env-review.png" caption="Review can be required to deploy">}}

As we can define branch protection, it is also possible to protect deployments. We can force to be reviewed before deployment.
And also it is possible to limit the branches which are allowed to deploy anything. Actual piece of this feature is having environment based secrets.

Secrets can be organization level, repository level or even environment level too. So we can use different deployment secrets on different environments.

{{< figure src="./assets/env-protection.png" caption="Protection of given environment">}}

## Flow in Action

It is still an option to have multiple protected branches on GitHub and track your deployments. But having one step further is always better.
We can now protect who can deploy to which environments. We can have different deployment secrets for each deployments.

In order to do that, just define the `environment` and `name` in your action file. The name should match with the ones under settings of repository.
GitHub will create a new one if the given name is not created previously.

Real life example from my current team;
* We are having single branch called `main` and merge all pull requests after reviews.
* `main` branch deploys on every push to `Development` environment.
* We've also defined manual triggers for deployments where we can set target environment.
* Once all the integration tests are green on `Development` environment, we are good to go for `Production` deployment by just triggering it.
* Reviewer checks and approves for deployment
* Deployment starts

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Name of environment to deploy'
        required: true
        default: 'Staging'
  push:
    branches:
      - main
jobs:
  # .... some other previous jobs
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: Production # can be defined dynamicly
      url: https://url-of-production
```

## Summary

GitHub Flow is already simple and easy to understand but now it is powerful and secure also.
It is nice to see what was deployed by who and when. We can defined protection rules and set secrets per environments.
As an example, you can have a look on deployment of this blog page, by clicking [here](https://github.com/salimkayabasi/salimkayabasi.com/deployments).
