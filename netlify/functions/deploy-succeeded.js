// Auto-ping IndexNow (Bing, Yandex, DuckDuckGo...) + Google on every deploy
const https = require('https');

const INDEXNOW_KEY = 'cbef03a6edb5413c8e8f0c68b8ac7bc4';
const BASE_URL = 'https://lacavernedelacompta.be';

// All pages to notify (matches sitemap.xml)
const URLS = [
  // FR
  '/fr/', '/fr/simulateur-immobilier/', '/fr/simulateur-credit/',
  '/fr/simulateur-requalification-loyer/', '/fr/simulateur-interets-composes/',
  '/fr/simulateur-retenue/', '/fr/simulateur-plus-value-immobiliere/',
  '/fr/pcmn-complet-societe-et-asbl/', '/fr/quick-memento-fiscal/',
  '/fr/remboursement-frais/', '/fr/questionnaire-frais-propres/',
  '/fr/commission-assurance/', '/fr/simulateur-frais-sejour-etranger/',
  '/fr/mentions-legales/',
  // NL
  '/nl/', '/nl/simulateur-immobilier/', '/nl/simulateur-credit/',
  '/nl/simulateur-requalification-loyer/', '/nl/simulateur-interets-composes/',
  '/nl/simulateur-retenue/', '/nl/simulateur-plus-value-immobiliere/',
  '/nl/pcmn-complet-societe-et-asbl/', '/nl/quick-memento-fiscal/',
  '/nl/remboursement-frais/', '/nl/questionnaire-frais-propres/',
  '/nl/commissie-verzekeringen/', '/nl/dagvergoeding-buitenland/',
  '/nl/mentions-legales/',
  // DE
  '/de/', '/de/simulateur-immobilier/', '/de/simulateur-credit/',
  '/de/simulateur-requalification-loyer/', '/de/simulateur-interets-composes/',
  '/de/simulateur-retenue/', '/de/simulateur-plus-value-immobiliere/',
  '/de/pcmn-complet-societe-et-asbl/', '/de/quick-memento-fiscal/',
  '/de/remboursement-frais/', '/de/questionnaire-frais-propres/',
  '/de/provisionsnachweis-versicherungen/', '/de/auslandsreisekostenrechner/',
  '/de/mentions-legales/',
  // EN
  '/en/', '/en/simulateur-immobilier/', '/en/simulateur-credit/',
  '/en/simulateur-requalification-loyer/', '/en/simulateur-interets-composes/',
  '/en/simulateur-retenue/', '/en/simulateur-plus-value-immobiliere/',
  '/en/pcmn-complet-societe-et-asbl/', '/en/quick-memento-fiscal/',
  '/en/remboursement-frais/', '/en/questionnaire-frais-propres/',
  '/en/insurance-commission/', '/en/foreign-travel-allowance/',
  '/en/mentions-legales/',
].map(path => BASE_URL + path);

function httpPost(hostname, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname, path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      console.log(`POST https://${hostname}${path} → ${res.statusCode}`);
      resolve(res.statusCode);
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      console.log(`GET ${url} → ${res.statusCode}`);
      resolve(res.statusCode);
    }).on('error', reject);
  });
}

exports.handler = async function() {
  console.log(`Notifying ${URLS.length} URLs...`);

  // 1. IndexNow — notifies Bing, Yandex, DuckDuckGo and all partners in one call
  try {
    await httpPost('api.indexnow.org', '/indexnow', {
      host: 'lacavernedelacompta.be',
      key: INDEXNOW_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: URLS
    });
    console.log('✅ IndexNow: batch submitted');
  } catch(e) {
    console.error('❌ IndexNow error:', e.message);
  }

  // 2. Google — ping sitemap (Google doesn't support IndexNow yet)
  try {
    const sitemapUrl = encodeURIComponent(`${BASE_URL}/sitemap.xml`);
    await httpGet(`https://www.google.com/ping?sitemap=${sitemapUrl}`);
    console.log('✅ Google sitemap ping sent');
  } catch(e) {
    console.error('❌ Google ping error:', e.message);
  }

  return { statusCode: 200, body: 'Done' };
};
