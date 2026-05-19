const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  page.on('error', err => console.log('PAGE CRASHED:', err.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  console.log('Page loaded. Toggling panel...');
  
  await page.evaluate(() => document.querySelector('button[aria-label="切換圖層面板"]').click());
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Clicking Trees...');
  await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('label'));
    const treeLabel = labels.find(l => l.textContent.includes('行道樹遮蔭'));
    if (treeLabel) treeLabel.querySelector('input').click();
  });
  
  console.log('Waiting 5s...');
  await new Promise(r => setTimeout(r, 5000));
  console.log('Done.');
  await browser.close();
})();
