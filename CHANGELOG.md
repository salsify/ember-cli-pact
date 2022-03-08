# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/).

## Unreleased
## 1.0.0-alpha.6 (July 10, 2019)
### Added
- `ember pact:publish` now supports publishing using token-based authentication

## 1.0.0-alpha.5 (October 19, 2018)
### Fixed
- Pact files are now generated with a `pactSpecification` key rather than the non-standard `pact-specification`
- Mirage model names are now properly camelized before lookup

## 1.0.0-alpha.4 (April 27, 2018)
### Added
- ember-cli-pact now exposes an `ember pact:publish` command for uploading contracts to a Pact broker

## 1.0.0-alpha.3 (April 10, 2018)
### Fixed
- We no longer play games with `shouldIncludeChildAddon`, as that caused issues by caching project config before all addons had been initialized.

## 1.0.0-alpha.2 (April 10, 2018)
### Added
- ember-cli-pact can now produce Pact Specification v2 pact files according to the `version` config option

### Fixed
- Modules relying on `@ember/test-helpers` are now only included in the `test-support.js` output, avoiding issues in development

### Changed
- [BREAKING] Pact interaction APIs are now importable helpers rather than being exposed on the test context
- [BREAKING] The `moduleFor`-style API has been dropped in favor of a unified `setupPact` helper
