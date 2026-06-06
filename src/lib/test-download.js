const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const htmlPath = "C:\\Users\\HAPPY COMPUTER\\.gemini\\antigravity-ide\\brain\\d3592d96-a077-4f60-a9f4-6616da93217f\\scratch\\download.html";

try {
  console.log(`Loading HTML from: ${htmlPath}`);
  const html = fs.readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(html);

  const appName = $('.ipaomtk-download-list__head h2').text().replace(/\s+/g, ' ').trim();
  const introText = $('.ipaomtk-download-list__head p').text().replace(/\s+/g, ' ').trim();

  const downloadOptions = [];

  $('.ipaomtk-download-card').each((_, card) => {
    const $card = $(card);
    const optionNumber = $card.find('.ipaomtk-download-card__number').text().trim();
    const title = $card.find('.ipaomtk-download-card__title h3').text().replace(/\s+/g, ' ').trim();
    const subTitle = $card.find('.ipaomtk-download-card__title span').text().replace(/\s+/g, ' ').trim();

    const chips = $card.find('.ipaomtk-download-card__chips span');
    const version = $(chips[0]).text().trim();
    const fileSize = $(chips[1]).text().trim();
    const fileType = $(chips[2]).text().trim();

    const downloadUrl = $card.find('a.ipaomtk-final-download').attr('href') || '';
    const openInAppUrl = $card.find('a.ipaomtk-app-open').attr('href') || '';
    const certificateUrl = $card.find('a[data-ipaomtk-download-cert]').attr('href') || '';

    const $autoSignBtn = $card.find('.ipaomtk-auto-sign-btn');
    let autoSignParams = undefined;

    if ($autoSignBtn.length > 0) {
      autoSignParams = {
        ipaUrl: $autoSignBtn.attr('data-ipa-url') || '',
        appName: $autoSignBtn.attr('data-app-name') || '',
        startUrl: $autoSignBtn.attr('data-start-url') || '',
        statusUrl: $autoSignBtn.attr('data-status-url') || '',
        mergeUrl: $autoSignBtn.attr('data-merge-url') || ''
      };
    }

    downloadOptions.push({
      optionNumber,
      title,
      subTitle,
      version,
      fileSize,
      fileType,
      downloadUrl,
      openInAppUrl,
      certificateUrl,
      autoSignParams
    });
  });

  const result = {
    appName,
    introText,
    downloadOptions
  };

  console.log("\n=============================================");
  console.log("   OFFLINE DOWNLOAD PAGE PARSER VERIFICATION");
  console.log("=============================================");
  console.log(JSON.stringify(result, null, 2));

} catch (error) {
  console.error('Error running test download parser:', error);
}
