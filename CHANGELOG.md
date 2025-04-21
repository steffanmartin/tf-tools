# Change Log

All notable changes to the "tf-tools" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.0.2] - 09/04/2025

### Enhancements
- Resource/data tags now link to the specific provider versions declared in the module context.
- Link correctly to non-HashiCorp providers, e.g. `azure/azapi`, `aliyun/alicloud` or `oci/oracle`.
- Defaults to hashicorp publisher and latest version if none can be found.

## [0.0.1] - 30/03/2025

- Initial release
- Clickable Terraform resource/data tags with links to Terraform Registry docs.

## [0.0.2] - 09/04/2025

- Resource/data tags link to the provider publisher and version specified in the `versions.tf` module file.
  - Defaults to `hashicorp/latest` if no provider block is found.
- New release pipeline to package a new extension version.

## [0.0.3] - 21/04/2025

- Option to toggle provider version feature with *Always use latest provider version* config setting (defaults to false).
- Bundle extension node packages with Webpack and replace image links for smaller bundle size.
- Configured `vscode-test` on the project and added sample unit tests.
- New CI pipeline to build the project and run tests as part of pull-request flow.
- Clickable Terraform module tags with links to local folder or Terraform Module Registry.