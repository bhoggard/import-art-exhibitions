# Import Art Exhibitions

A TypeScript CLI tool that reads URLs from an are.na channel and uses Claude AI to extract art exhibition data.

## Features

- Fetches items from are.na channels
- Extracts structured exhibition data using Claude Haiku
- Searches for venues in Sanity CMS
- Creates draft events in Sanity
- Outputs JSON to stdout
- Configurable item limit

## Installation

```bash
yarn install
```

## Configuration

Create a `.env` file in the project root with the following variables:

```env
ARENA_FILTERIZER_KEY=your_arena_access_token
ANTHROPIC_API_KEY=your_anthropic_api_key
SANITY_API_KEY=your_sanity_api_key
```

## Usage

Build the project:

```bash
yarn build
```

Run the CLI:

```bash
yarn start --limit <number>
```

Or run in development mode:

```bash
yarn dev --limit <number>
```

The tool processes the `art-exhibitions-for-filterizer` are.na channel.

### Options

- `--limit <number>` - Optional. Limit the number of items to process

### Example

```bash
yarn start --limit 10
```

## Output

The tool outputs JSON data to stdout with the following structure:

```json
{
  "venue_name": "Gallery Name",
  "title": "Exhibition Title",
  "start_date": "2024-01-01",
  "end_date": "2024-02-01",
  "website": "https://example.com"
}
```

## Development

Watch mode for development:

```bash
yarn watch
```

## Project Structure

```
src/
  index.ts      - Main CLI entry point
  types.ts      - TypeScript type definitions
  arena.ts      - Are.na API integration
  extractor.ts  - Claude AI extraction logic
  sanity.ts     - Sanity CMS integration
```
