const { Actor } = require('apify');
const { chromium } = require('playwright');

Actor.main(async () => {
    // Get input from Apify Key-Value Store
    const input = await Actor.getInput();
    
    if (!input || !input.username) {
        throw new Error('Username is required in the input!');
    }
    
    const { username, maxVideos = 0 } = input;
    
    console.log(`Starting to scrape TikTok videos for username: @${username}`);
    console.log(`Max videos: ${maxVideos === 0 ? 'unlimited' : maxVideos}`);
    
    // Launch browser
    const browser = await chromium.launch({
        headless: true,
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    try {
        // Navigate to TikTok profile
        const profileUrl = `https://www.tiktok.com/@${username}`;
        console.log(`Navigating to: ${profileUrl}`);
        
        await page.goto(profileUrl, { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        console.log('Page loaded, waiting for content...');
        
        // Wait a bit for initial content to load
        await page.waitForTimeout(3000);
        
        // Set to store unique video URLs
        const videoUrls = new Set();
        let previousHeight = 0;
        let scrollAttempts = 0;
        const maxScrollAttempts = 50; // Prevent infinite scrolling
        
        console.log('Starting to scroll and collect video links...');
        
        // Scroll and collect video links
        while (scrollAttempts < maxScrollAttempts) {
            // Extract video links from current viewport
            const links = await page.$$eval('a[href*="/video/"]', anchors => 
                anchors.map(a => a.href).filter(href => href.includes('/video/'))
            );
            
            // Add new links to set (automatically handles duplicates)
            let newLinksCount = 0;
            links.forEach(link => {
                if (!videoUrls.has(link)) {
                    videoUrls.add(link);
                    newLinksCount++;
                }
            });
            
            console.log(`Found ${videoUrls.size} unique video links so far (added ${newLinksCount} new links in this iteration)`);
            
            // Check if we've reached the max videos limit
            if (maxVideos > 0 && videoUrls.size >= maxVideos) {
                console.log(`Reached maximum video limit: ${maxVideos}`);
                break;
            }
            
            // Scroll down
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            await page.waitForTimeout(2000); // Wait for content to load
            
            // Check if we've reached the bottom
            const currentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
            
            if (currentHeight === previousHeight) {
                // No new content loaded, try a few more times before giving up
                scrollAttempts++;
                console.log(`No new content detected (attempt ${scrollAttempts}/${maxScrollAttempts})`);
                
                if (scrollAttempts >= 3 && videoUrls.size > 0) {
                    console.log('No new content after multiple attempts, assuming end of page');
                    break;
                }
            } else {
                // New content loaded, reset counter
                scrollAttempts = 0;
                previousHeight = currentHeight;
            }
        }
        
        console.log(`\nScraping completed! Found ${videoUrls.size} unique video URLs`);
        
        // Convert Set to Array and limit if needed
        let finalVideoUrls = Array.from(videoUrls);
        if (maxVideos > 0 && finalVideoUrls.length > maxVideos) {
            finalVideoUrls = finalVideoUrls.slice(0, maxVideos);
        }
        
        // Remove duplicates (just in case)
        finalVideoUrls = [...new Set(finalVideoUrls)];
        
        // Prepare text content
        const textContent = finalVideoUrls.join('\n');
        
        // Save to Apify Key-Value Store as a text file
        await Actor.setValue('video_links.txt', textContent, { contentType: 'text/plain' });
        console.log('Video links saved to Key-Value Store as "video_links.txt"');
        
        // Also save as JSON for programmatic access
        await Actor.setValue('OUTPUT', {
            username,
            totalVideos: finalVideoUrls.length,
            videoUrls: finalVideoUrls,
            scrapedAt: new Date().toISOString()
        });
        
        console.log('\nSummary:');
        console.log(`- Username: @${username}`);
        console.log(`- Total unique videos found: ${finalVideoUrls.length}`);
        console.log(`- Results saved to Key-Value Store`);
        
        // Log first few URLs as sample
        if (finalVideoUrls.length > 0) {
            console.log('\nSample video URLs:');
            finalVideoUrls.slice(0, 5).forEach((url, index) => {
                console.log(`${index + 1}. ${url}`);
            });
            if (finalVideoUrls.length > 5) {
                console.log(`... and ${finalVideoUrls.length - 5} more`);
            }
        }
        
    } catch (error) {
        console.error('Error during scraping:', error);
        throw error;
    } finally {
        await browser.close();
        console.log('Browser closed');
    }
});
