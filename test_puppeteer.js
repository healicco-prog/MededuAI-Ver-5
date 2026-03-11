const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting Puppeteer...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    
    console.log("Typing credentials...");
    await page.type('input[type="email"]', 'katakepradeep11@gmail.com');
    await page.type('input[type="password"]', 'Prad@123'); // Adjust to correct password
    
    console.log("Submitting login form...");
    await page.click('button[type="submit"]');
    
    // Wait for URL to change to dashboard
    try {
        await page.waitForFunction(() => window.location.href.includes('dashboard'), { timeout: 10000 });
    } catch(e) {
        console.log("Timeout waiting for dashboard. Current URL:", page.url());
        await browser.close();
        return;
    }
    
    console.log("Current URL after login:", page.url());
    
    // Output page content for context if needed
    if (page.url().includes('login')) {
        console.log("Login failed or still on login page.");
    } else {
        console.log("Successfully logged in. Looking for 'LMS Notes' link...");
        
        // Let React finish rendering
        await new Promise(r => setTimeout(r, 2000));
        
        await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a'));
            const el = links.find(a => a.textContent.includes('LMS Notes'));
            if (el) el.click();
            else console.log("LMS Notes link not found");
        });
        
        console.log("Clicked! Waiting for client-side transition...");
        await new Promise(r => setTimeout(r, 4000)); // wait for client side transition
        console.log("URL after clicking LMS Notes:", page.url());
        
        // Let's get the browser console logs!
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    }
    
    await browser.close();
})().catch(err => console.error(err));
