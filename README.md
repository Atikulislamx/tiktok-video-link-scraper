# TikTok Video Link Scraper

An Apify actor that scrapes all video URLs from a TikTok user profile. Simply provide a TikTok username and the actor will extract all video links, remove duplicates, and save them to a text file in the Apify Key-Value Store.

## Features

- ✅ Scrapes all video URLs from any public TikTok profile
- ✅ Automatically removes duplicate links
- ✅ Scrolls through the entire profile to collect all videos
- ✅ Saves results as both text file and JSON
- ✅ Supports limiting the maximum number of videos to scrape
- ✅ Provides detailed logging and progress updates

## Input

The actor accepts the following input parameters:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | String | Yes | The TikTok username to scrape (without @ symbol) |
| `maxVideos` | Integer | No | Maximum number of videos to scrape (0 = unlimited, default: 0) |

### Example Input

```json
{
  "username": "tiktokcreator",
  "maxVideos": 0
}
```

## Output

The actor saves the results in two formats to the Apify Key-Value Store:

### 1. Text File (`video_links.txt`)
A plain text file with one video URL per line:
```
https://www.tiktok.com/@username/video/1234567890123456789
https://www.tiktok.com/@username/video/9876543210987654321
...
```

### 2. JSON Output (`OUTPUT`)
A structured JSON object with metadata:
```json
{
  "username": "tiktokcreator",
  "totalVideos": 150,
  "videoUrls": [
    "https://www.tiktok.com/@username/video/1234567890123456789",
    "https://www.tiktok.com/@username/video/9876543210987654321",
    ...
  ],
  "scrapedAt": "2024-01-15T12:00:00.000Z"
}
```

## Usage

### On Apify Platform

1. Go to the actor's page on Apify
2. Click "Try for free"
3. Enter the TikTok username you want to scrape
4. Optionally set a maximum number of videos
5. Click "Start"
6. Once finished, download the results from the Key-Value Store

### Locally

1. Clone this repository:
```bash
git clone https://github.com/Atikulislamx/tiktok-video-link-scraper.git
cd tiktok-video-link-scraper
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install chromium
```

4. Create an input file `input.json`:
```json
{
  "username": "tiktokcreator",
  "maxVideos": 0
}
```

5. Run the actor:
```bash
npm start
```

6. Find the results in the `apify_storage/key_value_stores/default/` directory

### Using Apify CLI

```bash
apify run -p
```

## How It Works

1. **Input Validation**: The actor first validates that a username is provided
2. **Browser Launch**: Launches a headless Chromium browser using Playwright
3. **Navigation**: Navigates to the TikTok profile page
4. **Scrolling**: Automatically scrolls through the page to load all videos
5. **Extraction**: Extracts video URLs from the page using CSS selectors
6. **Deduplication**: Uses a Set data structure to automatically remove duplicates
7. **Storage**: Saves the unique video URLs to both a text file and JSON format

## Requirements

- Node.js 16 or higher
- At least 2GB of RAM
- Internet connection

## Dependencies

- `apify`: ^3.0.0 - Apify SDK for building actors
- `playwright`: ^1.40.0 - Browser automation library

## Limitations

- Only works with public TikTok profiles
- TikTok may rate-limit or block requests if too many are made in a short time
- Some regions may have restricted access to TikTok
- The structure of TikTok's website may change, requiring updates to the scraper

## Troubleshooting

### No videos found
- Ensure the username is correct (without @ symbol)
- Check if the profile is public
- Try running the actor again after a few minutes

### Actor times out
- Reduce the `maxVideos` parameter
- The profile might have too many videos; try scraping in batches

### Browser errors
- Ensure Playwright browsers are installed: `npx playwright install chromium`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC License

## Disclaimer

This tool is for educational purposes only. Make sure to comply with TikTok's Terms of Service and robots.txt when scraping. Use responsibly and respect rate limits.