## Setup

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
$ nvm install node
Or just follow https://nodejs.org/en/
```

## Installation

```bash
# get yarn
$ npm install yarn -g

#get dependencies
$ yarn
```

## Running the app

```bash
# development
$ yarn dev

# storybook
$ yarn storybook

# production mode
$ yarn --production=true
$ yarn build
$ yarn start
```

## Test

```bash
# unit tests
$ yarn test
```

## Environment

```bash
# default
NODE_ENV=(default=development)
PORT= (default=9000)

## Semantic Commit Messages

See how a minor change to your commit message style can make you a better programmer.

Format: `<type>(<scope>): <subject>`

`<scope>` is optional

### Example

```

feat: add hat wobble
^--^ ^------------^
| |
| +-> Summary in present tense.
|
+-------> Type: chore, docs, feat, fix, refactor, style, or test.

```

More Examples:

- `feat`: (new feature for the user, not a new feature for build script)
- `fix`: (bug fix for the user, not a fix to a build script)
- `docs`: (changes to the documentation)
- `style`: (formatting, missing semi colons, etc; no production code change)
- `refactor`: (refactoring production code, eg. renaming a variable)
- `test`: (adding missing tests, refactoring tests; no production code change)
- `chore`: (updating grunt tasks etc; no production code change)

```
