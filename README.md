# Import Art Exhibitions

A TypeScript CLI tool that reads URLs from an are.na channel and uses Claude AI to extract art exhibition data.

## Features

- Fetches items from are.na channels
- Extracts structured exhibition data using Claude Haiku
- Outputs JSON to stdout
- Configurable item limit

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the project root with the following variables:

```env
ARENA_FILTERIZER_KEY=your_arena_access_token
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## Usage

Build the project:

```bash
npm run build
```

Run the CLI:

```bash
npm start <channel-slug> --limit <number>
```

Or run in development mode:

```bash
npm run dev <channel-slug> --limit <number>
```

### Arguments

- `<channel>` - Required. The are.na channel slug or ID
- `--limit <number>` - Optional. Limit the number of items to process

### Example

```bash
npm start my-art-channel --limit 10
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
npm run watch
```

## Project Structure

```
src/
  index.ts      - Main CLI entry point
  types.ts      - TypeScript type definitions
  arena.ts      - Are.na API integration
  extractor.ts  - Claude AI extraction logic
```
