const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ipaHtmlPath = "C:\\Users\\HAPPY COMPUTER\\.gemini\\antigravity-ide\\brain\\d3592d96-a077-4f60-a9f4-6616da93217f\\scratch\\detail.html";
const apkHtmlPath = "C:\\Users\\HAPPY COMPUTER\\.gemini\\antigravity-ide\\brain\\d3592d96-a077-4f60-a9f4-6616da93217f\\scratch\\apk-detail.html";

function testOfflineScrape(filePath, name) {
  try {
    console.log(`\n=============================================`);
    console.log(` Testing Parser on ${name} Detail HTML`);
    console.log(`=============================================`);
    console.log(`Loading: ${filePath}`);
    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);

    // Parse Metadata Cards (.glass-card)
    const metadata = {};
    $('.glass-card').each((_, el) => {
      const $card = $(el);
      const label = $card.find('p.text-xs').text().replace(/\s+/g, ' ').trim();
      const $valElement = $card.find('p.font-bold, a.font-bold');
      const value = $valElement.text().replace(/\s+/g, ' ').trim();
      const link = $valElement.attr('href') || undefined;

      if (label) {
        metadata[label.toLowerCase()] = { value, url: link };
      }
    });

    // Parse Download URL (looking for a.btn-liquid containing "/download/")
    let downloadUrl = '';
    const $downloadBtn = $('a.btn-liquid[href*="/download/"]').first();
    if ($downloadBtn.length > 0) {
      downloadUrl = $downloadBtn.attr('href') || '';
    } else {
      // Fallback: search for any anchor link containing "/download/"
      $('a').each((_, el) => {
        const $link = $(el);
        const href = $link.attr('href') || '';
        const text = $link.text().toLowerCase();
        if (
          (href.includes('/download/') || text.includes('download')) &&
          !href.startsWith('#') &&
          !downloadUrl
        ) {
          downloadUrl = href;
        }
      });
    }

    // Parse Description Content
    const $contentArea = $('.content-area');
    const descriptionHtml = $contentArea.html() || '';
    const descriptionText = $contentArea.text().trim();

    const result = {
      appName: metadata['app name']?.value || metadata['name']?.value || '',
      version: metadata['version']?.value || '',
      updated: metadata['updated']?.value || '',
      publisher: metadata['publisher']?.value || '',
      size: metadata['size']?.value || '',
      platform: metadata['platform']?.value || '',
      category: metadata['category']?.value || '',
      categoryUrl: metadata['category']?.url || '',
      getItOn: metadata['get it on']?.value || '',
      getItOnUrl: metadata['get it on']?.url || '',
      downloadUrl,
      descriptionLength: descriptionText.length,
      descriptionSnippet: descriptionText.replace(/\s+/g, ' ').substring(0, 150) + '...'
    };

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`Error parsing ${name} details:`, error);
  }
}

testOfflineScrape(ipaHtmlPath, "TikTok IPA");
testOfflineScrape(apkHtmlPath, "TeraBox APK");
