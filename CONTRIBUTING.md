# Contributing

By contibuting to @wwt-as/validated-actions you are also agreeing to abide by the [code of conduct](https://github.com/wwt/validated-actions/blob/master/CODE_OF_CONDUCT.md).

## Reporting Issues and Asking Questions

Before opening an issue, please search the [issue tracker](https://github.com/wwt/validated-actions/issues) to make sure your issue hasn't already been reported.

## Development

Visit the [Issue tracker](https://github.com/wwt/validated-actions/issues) to find a list of open issues that need attention.

Fork, then clone the repo:

```
git clone git@github.com:<your-user-name>/validated-actions.git
```

### Building

```
npm run build
```

### Testing and Linting

To run the tests:

```
npm run test
```

To perform linting with `eslint`, run the following:

```
npm run lint
```

### New Features

Please open an issue with a proposal for a new feature or refactoring before starting on the work. We don't want you to waste your efforts on a pull request that we won't want to accept.

## Submitting Changes

- Open a new issue in the [Issue tracker](https://github.com/wwt/validated-actions/issues).
- Fork the repo.
- Create a new feature branch based off the `master` branch. name the branch va-<issue number>
- Make sure changes are supported by tests.
- Make sure all tests pass and there are no linting errors.
- Submit a pull request, referencing any issues it addresses.

Please try to keep your pull request focused in scope and avoid including unrelated commits.

After you have submitted your pull request, we'll try to get back to you as soon as possible. We may suggest some changes or improvements.

Thank you for contributing!

## Commit Format

`<branch name> - <initials of who worker on the issue> - <message>`

ex:
`va-4 - np - updated CONTRIBUTING.md file to match standards for project`
