const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set explicit viewport size for the digital folder
  await page.setViewportSize({ width: 1080, height: 1920 });
  
  // Load local HTML file
  const fileUrl = 'file:///' + path.resolve(__dirname, 'folder-digital.html').replace(/\\/g, '/');
  console.log('Navigating to:', fileUrl);
  
  try {
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    
    // Capture screenshot
    const outputPath = path.resolve(__dirname, 'folder-digital.png');
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log('Screenshot saved to:', outputPath);
  } catch (error) {
    console.error('Error during rendering:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
