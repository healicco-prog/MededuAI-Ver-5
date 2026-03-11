const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting Puppeteer on port 3001...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle2' });
    
    console.log("Typing credentials...");
    await page.type('input[type="email"]', 'katakepradeep11@gmail.com');
    await page.type('input[type="password"]', 'Prad@123'); 
    
    console.log("Submitting login form...");
    await page.click('button[type="submit"]');
    
    try {
        await page.waitForFunction(() => window.location.href.includes('dashboard'), { timeout: 10000 });
    } catch(e) {
        console.log("Timeout waiting for dashboard. Current URL:", page.url());
        await browser.close();
        return;
    }
    
    console.log("Current URL after login:", page.url());
    
    if (page.url().includes('login')) {
        console.log("Login failed or still on login page.");
    } else {
        console.log("Successfully logged in. Looking for 'LMS Notes' link...");
        
        await new Promise(r => setTimeout(r, 2000));
        
        await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a'));
            const el = Object.values(links).find(a => a.textContent.includes('LMS Notes'));
            if (el) el.click();
            else console.log("LMS Notes link not found");
        });
        
        console.log("Clicked! Waiting for client-side transition...");
        await new Promise(r => setTimeout(r, 4000));
        console.log("URL after clicking LMS Notes:", page.url());
    }
    
    await browser.close();
})().catch(err => console.error(err));
