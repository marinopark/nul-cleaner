# Code Signing Policy

This document describes how `nulCleaner` binaries are built, reviewed, signed, and released, in line with the requirements of the [SignPath Foundation](https://signpath.org/) open-source code signing program.

## Roles

| Role | Person |
|------|--------|
| Maintainer / author | [@marinopark](https://github.com/marinopark) |
| Reviewer | [@marinopark](https://github.com/marinopark) |
| Approver (release signing) | [@marinopark](https://github.com/marinopark) |

This is currently a single-maintainer project. If contributors join, this table will be updated to keep review and approval distinct.

## Source code

- Repository: <https://github.com/marinopark/nul-cleaner>
- License: [MIT](LICENSE) (OSI-approved)
- All source is hosted publicly on GitHub. There is no private code in the signed binary.

## Build process

Releases are built by the **`.github/workflows/release.yml`** GitHub Actions workflow on a `windows-latest` runner. Steps:

1. Check out the tag (`v*`).
2. Set up the pinned Go and Node.js toolchains.
3. Install the Wails CLI.
4. Regenerate the Windows icon resource (`build/windows/icon.ico`) from `nulcleaner.svg` using `tools/svg2pngmain.go` and `tools/geniconmain.go` — so the icon embedded in the binary is reproducible from sources.
5. Run `wails build -platform windows/amd64`.
6. Upload the produced `build/bin/nulCleaner.exe` as a workflow artefact.
7. (Once signing is enabled) submit the artefact to SignPath for review and signing.
8. Attach the signed binary to the GitHub Release.

Build inputs are pinned and reproducible from the source tree alone — no external scripts are fetched at build time other than published Go and npm modules locked by `go.sum` and `frontend/package-lock.json`.

## Signing approval

Every release that is submitted to SignPath is **manually approved by the maintainer** through the SignPath portal. Auto-signing is not enabled. The approver verifies:

- The tag and commit being built match the public source on GitHub.
- The workflow run that produced the artefact has no manual interventions.
- Nothing in the diff since the previous release introduces non-OSS code, telemetry, or undocumented network calls.

## Account security

- The GitHub account that owns the project and approves releases has **two-factor authentication** enabled.
- SignPath access is restricted to the same account; no shared credentials.
- Secrets required by the signing step (`SIGNPATH_API_TOKEN`, `SIGNPATH_ORG_ID`) live only in the repository's GitHub Actions secrets store.

## Reporting

If you believe a signed `nulCleaner` binary has been tampered with, or you have a security concern about the signing process, please contact `marino@flexbox.co.kr`.
