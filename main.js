import Apify from 'apify';
import fs from 'fs';
import fetch from 'node-fetch';

const { log, dataset, keyValueStore, getInput } = Apify;

await Apify.main(async () => {
    const input = await getInput();
    const username = input.username;
    if (!username) {
        throw new Error('Please provide a TikTok username!');
    }

    log.info(`Fetching video links for @${username} ...`);

    const videoLinks = [];
    let hasMore = true;
    let cursor = 0;

    while (hasMore) {
        const url = `https://www.tiktok.com/api/user/detail/?username=${username}&count=30&cursor=${cursor}`;
        // TikTok API endpoint may vary; we’ll try JSON endpoint for videos
        const userInfoUrl = `https://www.tiktok.com/@${username}?lang=en`;

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'application/json, text/plain, */*'
        };

        const response = await fetch(userInfoUrl, { headers });
        if (!response.ok) {
            throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const html = await response.text();

        // Extract JSON from TikTok page
        const match = html.match(/<script id="SIGI_STATE" type="application\/json">(.+?)<\/script>/);
        if (!match) break;

        const json = JSON.parse(match[1]);
        const videos = Object.values(json.ItemModule || {});

        if (videos.length === 0) break;

        for (const video of videos) {
            videoLinks.push(`https://www.tiktok.com/@${username}/video/${video.id}`);
        }

        hasMore = false; // JSON from page loads all recent videos; you can implement cursor logic if needed
    }

    // Remove duplicates
    const uniqueLinks = [...new Set(videoLinks)];

    // Save to txt
    const txt = uniqueLinks.join('\n');
    await keyValueStore.setValue('video_links.txt', txt);

    log.info(`✅ Found ${uniqueLinks.length} video links.`);
    log.info('📄 video_links.txt saved successfully!');
});
