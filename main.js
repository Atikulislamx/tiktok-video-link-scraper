import { Actor } from 'apify';

await Actor.init();

const input = await Actor.getInput();
const username = input?.username;

if (!username) {
    throw new Error('TikTok username is required in input.');
}

console.log(`Fetching video links for @${username} ...`);

const profileUrl = `https://www.tiktok.com/@${username}`;

// Use fetch to get HTML of the profile page
const response = await fetch(profileUrl);
const html = await response.text();

// Extract video URLs using regex
const videoUrls = [...html.matchAll(/https:\/\/www\.tiktok\.com\/@[^"]+\/video\/\d+/g)]
    .map(match => match[0])
    .filter((v, i, a) => a.indexOf(v) === i); // remove duplicates

console.log(`✅ Found ${videoUrls.length} video links.`);

// Save video links to a txt file in Apify Key-Value Store
const fileContent = videoUrls.join('\n');
await Actor.setValue('video_links.txt', fileContent, { contentType: 'text/plain' });

console.log('📄 video_links.txt saved successfully!');
await Actor.exit();
