const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Load HTML from scratch directory
const htmlPath = "C:\\Users\\HAPPY COMPUTER\\.gemini\\antigravity-ide\\brain\\d3592d96-a077-4f60-a9f4-6616da93217f\\scratch\\homepage.html";

try {
  console.log(`Loading HTML from: ${htmlPath}`);
  const html = fs.readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(html);

  const ipa = [];
  const apk = [];

  $('.ipaomtk-app-card').each((_, element) => {
    const $el = $(element);

    const detailUrl = $el.attr('href') || '';
    const title = $el.find('.ipaomtk-card-title').text().replace(/\s+/g, ' ').trim();
    const status = $el.find('.ipaomtk-status-pill').text().replace(/\s+/g, ' ').trim();
    const badge = $el.find('.liquid-mod-badge').text().replace(/\s+/g, ' ').trim();
    const iconUrl = $el.find('img.ipaomtk-card-icon').attr('src') || '';

    const metaSpans = $el.find('.ipaomtk-card-meta span');
    const category = $(metaSpans[0]).text().replace(/\s+/g, ' ').trim();
    const size = $(metaSpans[1]).text().replace(/\s+/g, ' ').trim();

    const version = $el.find('.ipaomtk-card-detail > span').first().text().replace(/\s+/g, ' ').trim();
    const modFeatures = $el.find('.ipaomtk-card-mod').text().replace(/\s+/g, ' ').trim();

    let platform = 'ios';
    if ($el.find('.liquid-platform-icon.ios').length > 0) {
      platform = 'ios';
    } else if ($el.find('.liquid-platform-icon.android').length > 0) {
      platform = 'android';
    } else if (detailUrl.includes('/apk/') || category.toLowerCase().includes('apk')) {
      platform = 'android';
    }

    const appData = {
      title,
      version,
      size,
      category,
      platform,
      modFeatures,
      iconUrl,
      detailUrl,
      badge,
      status
    };

    if (platform === 'ios') {
      ipa.push(appData);
    } else {
      apk.push(appData);
    }
  });

  console.log('\n=============================================');
  console.log('         SCRAPING RESULTS SUMMARY');
  console.log('=============================================');
  console.log(`Total IPA (iOS) Apps Found:      ${ipa.length}`);
  console.log(`Total APK (Android) Apps Found:  ${apk.length}`);
  console.log(`Total Apps Parsed:               ${ipa.length + apk.length}`);
  console.log('=============================================\n');

  console.log('=== SAMPLE IPA APP ===');
  if (ipa.length > 0) {
    console.log(JSON.stringify(ipa[0], null, 2));
  } else {
    console.log('No IPA apps found.');
  }
  console.log('\n');

  console.log('=== SAMPLE APK APP ===');
  if (apk.length > 0) {
    console.log(JSON.stringify(apk[0], null, 2));
  } else {
    console.log('No APK apps found.');
  }

} catch (error) {
  console.error('Error running test scraper:', error);
}
