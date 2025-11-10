# Import Art Events

This is a command-line TypeScript application which reads URLs from an are.na channel, then uses Claude's Haiku model to extract the following data as JSON. The words in parentheses are the JSON fields. Print the JSON to STDOUT.

* Name of gallery (venue_name)
* Title of exhibition (title)
* Start date of exhibition (start_date)
* End date of exhibition (end_date)
* The URL from the are.na channel (website)

## Implementation

Use [arena.js](https://github.com/ivangreene/arena-js) to read the items. The personal access token is present as an environment variable named `ARENA_FILTERIZER_KEY`.

The application should accept a command-line argument called `--limit` to limit the number of items that will be processed.

## Workflow

- Always run `yarn install && yarn build` to make sure all packages are installed and the application has no compile errors.
- Be sure to typecheck when you’re done making a series of code changes
