# TikTok Video Link Scraper

An Apify actor that scrapes all video URLs from a TikTok user profile. This actor accepts a TikTok username as input, navigates to the user's profile page, extracts all video links, removes duplicates, and saves them to a text file in the Apify Key-Value Store.

## Features

- 🎯 Scrapes all video URLs from any public TikTok profile
- 🔄 Automatically scrolls to load all videos
- 🎨 Removes duplicate links
- 💾 Saves results to both text file and JSON format
- 🚀 Built with Apify SDK and Playwright

## Input

The actor accepts the following input:

```json
{
  "username": "tiktok"
}
```

### Input Parameters

- **username** (required): The TikTok username to scrape (without the @ symbol)
  - Example: `"tiktok"` for the profile `@tiktok`

## Output

The actor produces two outputs in the Key-Value Store:

### 1. video-links.txt
A plain text file containing all unique video URLs, one per line:
```
https://www.tiktok.com/@username/video/1234567890
https://www.tiktok.com/@username/video/9876543210
...
```

### 2. OUTPUT (JSON)
A structured JSON object containing:
```json
{
  "username": "tiktok",
  "totalVideos": 100,
  "videoLinks": [
    "https://www.tiktok.com/@username/video/1234567890",
    "https://www.tiktok.com/@username/video/9876543210"
  ]
}
```

## Usage

### On Apify Platform

1. Create a new actor or use this existing one
2. Go to the actor's input tab
3. Enter the TikTok username (without @)
4. Click "Start" to run the actor
5. Once complete, download the results from the Key-Value Store

### Local Development

1. Clone this repository:
```bash
git clone https://github.com/Atikulislamx/tiktok-video-link-scraper.git
cd tiktok-video-link-scraper
```

2. Install dependencies:
```bash
npm install
```

3. Run the actor locally:
```bash
npm start
```

Note: For local development, you'll need to create an `INPUT.json` file in the `apify_storage/key_value_stores/default/` directory:

```json
{
  "username": "tiktok"
}
```

### Using Apify CLI

```bash
apify run -p
```

## Requirements

- Node.js 16 or higher
- Apify SDK
- Playwright

## How It Works

1. The actor receives a TikTok username as input
2. It opens the user's profile page using Playwright
3. Automatically scrolls down to load more videos
4. Extracts all video links from the page
5. Removes duplicate URLs using a Set
6. Saves the results to the Key-Value Store in both text and JSON formats

## Limitations

- Only works with public TikTok profiles
- The number of videos scraped may vary depending on TikTok's rate limiting and page loading
- TikTok's website structure may change, requiring updates to the scraper

## Technical Details

- **Language**: JavaScript (ES Modules)
- **Runtime**: Node.js
- **Browser**: Chromium (via Playwright)
- **SDK**: Apify SDK v3

## License

ISC

## Support

For issues or questions, please open an issue on the GitHub repository.