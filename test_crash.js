const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  page.on('error', err => console.log('PAGE CRASHED:', err.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  console.log('Page loaded. Clicking panel toggle...');
  
  await page.evaluate(() => document.querySelector('button[aria-label="切換圖層面板"]').click());
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Clicking Trees...');
  await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('label'));
    const treeLabel = labels.find(l => l.textContent.includes('行道樹遮蔭'));
    if (treeLabel) treeLabel.querySelector('input').click();
  });
  
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Clicking Sidewalks...');
  await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('label'));
    const sideLabel = labels.find(l => l.textContent.includes('人行道範圍'));
    if (sideLabel) sideLabel.querySelector('input').click();
  });
  
  await new Promise(r => setTimeout(r, 10000));
  
  console.log('Done.');
  await browser.close();
})();
