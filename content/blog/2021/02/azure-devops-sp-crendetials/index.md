---
title: Reading service principal password from Azure DevOps
lead: |
  Service principal is representation of your tenant or directory on Azure.
  On Azure Devops, service principal credentials can be accessed for deploying any components
  It is possible to retrieve credentials from Azure Devops and use them on GitHub Actions.
date: 2021-02-19T08:15:00.000Z
---
# Security
Given [service principal](https://docs.microsoft.com/en-us/azure/active-directory/develop/app-objects-and-service-principals#service-principal-object) is eligible to manage your services and deployments.
Almost all the CI/CD services are coming with masking feature by default for these kinds of secret  values.

By design of these CI agents, they are `stateless` and each build they need sort of environment variable to work as your service principal.
This comes with a lot of flexibility where you can extend your setup without caring about previous state.
Downside of this flexibility, every CI pipeline needs access to credentials where anyone can access them as well.

Your credential can be super safe inside the Azure world, in fact, they are not as long as someone has access to your CI pipeline.

# Reading credentials

For the sake of demonstration, I've published an example repo on [GitHub](https://github.com/salimkayabasi/reading-service-principal-azure-devops).

## How to

On your `Azure DevOps` pipeline, you need to grant the given pipeline to access `service principal` credentials by just enabling a single flag.

```yaml
addSpnToEnvironment: true
```

This flag will add service principal credentials as environment variables on your CI pipeline.
As shown [here](https://github.com/salimkayabasi/reading-service-principal-azure-devops/blob/main/azure-pipeline.yml#L20).

Next thing to do use reading values and [printing them](https://github.com/salimkayabasi/reading-service-principal-azure-devops/blob/main/azure-pipeline.yml#L21-L26) in `hex` or `base64` format. This will help you to cheat `masking` behaviour.

```yaml
inlineScript: |
  echo "servicePrincipalId"
  xxd -p <<< $servicePrincipalId -c 256
  echo "servicePrincipalKey"
  xxd -p <<< $servicePrincipalKey -c 256
  echo "tenantId"
  xxd -p <<< $tenantId -c 256
```

Just a reminder, Azure DevOps pipelines will be using `ubuntu-latest` VM unless you change it.

{{< figure src="./assets/azure-devops-logs.png" caption="Actual values are masked for this image" >}}

## Reading

After retrieving values as `hex` strings from your Azure Devops, you need to convert them to actual values back.
It can be simply done with few lines of `Node.js` implementation.

```js
const convert = (from, to) => str => console.log(Buffer.from(str, from).toString(to));
const hexToUtf8 = convert('hex', 'utf8');

console.log('servicePrincipalId');
hexToUtf8('your servicePrincipalId goes here');
console.log('servicePrincipalKey');
hexToUtf8('your servicePrincipalKey goes here');
console.log('tenantId');
hexToUtf8('and tenantId here as well');
```

# Using them on GitHub Actions

## Adding as Secret

Let's create another secret for `GitHub Actions`. To do that, we need one more thing called `subscriptionId`.
The `subscriptionId` can be found on Azure Portal or simple `powershell` or `bash` command like

```powershell
Get-AzSubscription

Name                 Id             TenantId State
----                 --             -------- -----
Name Of Subscription subscriptionId tenantId Enabled
```

Add new `Secret` as JSON format on your project or organisation on GitHub.
```json
{
  "clientId": "value of servicePrincipalId",
  "clientSecret": "value of servicePrincipalKey",
  "subscriptionId": "your subscriptionId",
  "tenantId": "value of tenantId"
}
```

{{< figure src="./assets/github-secrets.png" >}}

## Accessing from GitHub Actions

On your github actions workflow file, you can try to log in with using given credentials. Full example can be found on [GitHub repo](https://github.com/salimkayabasi/reading-service-principal-azure-devops/blob/main/.github/workflows/azure.yml#L7-L12) as well.

```yaml
steps:
  - uses: actions/checkout@v2
  - uses: azure/login@v1
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}
  - run: az group list
  - name: Azure logout
    run: az logout
```

{{< figure src="./assets/github-actions-logs.png" caption="Successfully logged in" >}}

# Conclusion

It is possible to retrieve credentials and use them in a different CI*. Level of trust is important in the company level.
In order to prevent these kinds of issues, you can rotate credentials, but then they can be retrieved again.

As I said, if any person who is granted to access your CI then s/he can do whatever they like.
The purpose of this article, I just wanted to highlight that these ways of protections are useless and technically possible to read secrets.
Same goes for `GitHub Actions` as well and there is no way to keep those secrets away from people who work for company.

If you didn't like Azure DevOps and still want to use `GitHub Actions`, it is not that hard to migrate your CI to wherever you want.

_*By the way, GitHub Actions and Azure DevOps are using same virtual machines under the hood._

##### Credits
* [Pascal Naber](https://pascalnaber.wordpress.com/2020/01/04/backdoor-in-azure-devops-to-get-the-password-of-a-service-principal/)
