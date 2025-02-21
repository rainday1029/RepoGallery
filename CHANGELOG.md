# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-02-21
### Added
- Added a new exclusion mechanism in `config.yaml` that allows repositories to be excluded\
  using regular expressions, in addition to specifying full repository names.

### Changed
- Changed the synchronization mechanism to rebase the `main` branch instead of merging it.

### Removed
- Removed unnecessary bot commits from GitHub Actions.
- Removed automatic push of `index.html`.

## [1.1.0] - 2025-02-20
### Added
- Added user-configurable image settings, allowing users to define custom images.

### Changed
- When no user-provided image is available and "random image" is disabled,\
  the system now displays a text card instead of using the first image from the repository's README.

### Removed
- Removed the fallback behavior where the first image from the repository's README was used\
  when "random image" is disabled.

## [1.0.0] - 2025-02-16
### Added
- Initial release of RepoGallery.