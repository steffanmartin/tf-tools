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