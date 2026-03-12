const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting Puppeteer Trace...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Enable request interception to print redirects
    page.on('response', resp => {
        if ([301, 302, 307, 308].includes(resp.status())) {
            console.log(`REDIRECT ${resp.status()}: ${resp.url()} -> ${resp.headers().location}`);
        }
    });
    // Log console
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    
    console.log("Typing credentials...");
    await page.type('input[type="email"]', 'katakepradeep11@gmail.com');
    await page.type('input[type="password"]', 'Prad@123'); 
    
    console.log("Submitting login form...");
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    let retries = 0;
    while(retries < 10 && !page.url().includes('dashboard')) {
        await new Promise(r => setTimeout(r, 1000));
        retries++;
    }
    
    console.log("Current URL after login:", page.url());
    
    // Check cookies
    const cookies = await page.cookies();
    console.log("Cookies:", cookies.map(c => `${c.name}=${c.value}`).join('; '));

    console.log("Clicking LMS Notes...");
    await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const el = links.find(a => a.textContent.includes('LMS Notes'));
        if (el) el.click();
        else console.log("LMS Notes link not found");
    });
    
    await new Promise(r => setTimeout(r, 5000));
    console.log("URL after clicking LMS Notes:", page.url());
    
    await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
