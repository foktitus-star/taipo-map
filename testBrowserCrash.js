const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: 'new'});
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.error('PAGE UNCAUGHT ERROR:', err.toString());
  });
  
  page.on('console', msg => {
    console.log(`CONSOLE [${msg.type()}]:`, msg.text());
  });
  
  page.on('requestfailed', request => {
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`BAD RESPONSE [${response.status()}]: ${response.url()}`);
    }
  });

  try {
    await page.goto('http://localhost:3000', {waitUntil: 'networkidle2'});
    await new Promise(r => setTimeout(r, 3000));
  } catch (err) {
    console.error("GOTO Error:", err);
  }
  await browser.close();
})();
