import { Actor } from 'apify';
import { PlaywrightCrawler } from 'apify';

await Actor.init();

try {
    // Get input
    const input = await Actor.getInput();
    const { username } = input;

    if (!username) {
        throw new Error('Username is required');
    }

    console.log(`Starting to scrape videos for TikTok user: @${username}`);

    const videoLinks = new Set();
    const profileUrl = `https://www.tiktok.com/@${username}`;

    // Create a crawler
    const crawler = new PlaywrightCrawler({
        launchContext: {
            launchOptions: {
                headless: true,
            },
        },
        async requestHandler({ page, request }) {
            console.log(`Processing ${request.url}`);

            // Wait for the page to load
            await page.waitForLoadState('networkidle', { timeout: 30000 });

            // Scroll to load more videos
            let previousHeight = 0;
            let scrollAttempts = 0;
            const maxScrollAttempts = 10;

            while (scrollAttempts < maxScrollAttempts) {
                // Scroll down
                await page.evaluate(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                });

                // Wait for new content to load
                await page.waitForTimeout(2000);

                const currentHeight = await page.evaluate(() => document.body.scrollHeight);
                
                if (currentHeight === previousHeight) {
                    scrollAttempts++;
                } else {
                    scrollAttempts = 0;
                    previousHeight = currentHeight;
                }
            }

            // Extract all video links
            const links = await page.evaluate(() => {
                const videoElements = document.querySelectorAll('a[href*="/video/"]');
                const urls = [];
                videoElements.forEach(el => {
                    const href = el.getAttribute('href');
                    if (href && href.includes('/video/')) {
                        // Convert relative URLs to absolute
                        const fullUrl = href.startsWith('http') ? href : `https://www.tiktok.com${href}`;
                        urls.push(fullUrl);
                    }
                });
                return urls;
            });

            // Add to set to remove duplicates
            links.forEach(link => videoLinks.add(link));
            
            console.log(`Found ${links.length} video links on this page`);
            console.log(`Total unique video links: ${videoLinks.size}`);
        },
        maxRequestsPerCrawl: 1,
        maxConcurrency: 1,
    });

    // Run the crawler
    await crawler.run([profileUrl]);

    console.log(`Total unique video links found: ${videoLinks.size}`);

    // Convert Set to Array and create text content
    const videoLinksArray = Array.from(videoLinks);
    const textContent = videoLinksArray.join('\n');

    // Save to Key-Value Store
    await Actor.setValue('video-links.txt', textContent, { contentType: 'text/plain' });
    
    // Also save as JSON for easier programmatic access
    await Actor.setValue('OUTPUT', {
        username,
        totalVideos: videoLinksArray.length,
        videoLinks: videoLinksArray,
    });

    console.log('Video links saved to Key-Value Store as "video-links.txt" and "OUTPUT"');

} catch (error) {
    console.error('Error occurred:', error);
    throw error;
} finally {
    await Actor.exit();
}
