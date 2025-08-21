import puppeteer, { Browser, Page } from 'puppeteer';
import { LoggerService } from '../services/loggerService';
import { ScrapedPrice } from './bestBuyScraper';

export class WalmartScraper {
  private static async createBrowser(): Promise<Browser> {
    return await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ],
      timeout: 30000
    });
  }

  static async scrapePrice(productName: string): Promise<ScrapedPrice | null> {
    let browser: Browser | null = null;
    try {
      browser = await this.createBrowser();
      const page = await browser.newPage();
      await page.setDefaultTimeout(20000);
      
      const searchUrl = `https://www.walmart.com/search?q=${encodeURIComponent(productName)}`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
      
      await page.waitForSelector('[data-testid="list-view"]', { timeout: 10000 });
      
      const priceSelectors = [
        '[data-automation-id="product-price"] span[itemprop="price"]',
        '[data-automation-id="product-price"] .notranslate',
        '.price-current',
        '[data-automation-id="product-price"] span:first-child',
        '.price-group .price-current'
      ];
      
      for (const selector of priceSelectors) {
        try {
          const priceElement = await page.$(selector);
          if (priceElement) {
            const priceText = await page.evaluate(el => el.textContent, priceElement);
            const price = this.extractPrice(priceText);
            if (price > 0) {
              return {
                price,
                availability: true,
                url: searchUrl
              };
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      return null;
    } catch (error) {
      LoggerService.error('WalmartScraper', `Failed to scrape price for ${productName}`, error as Error);
      return null;
    } finally {
      if (browser) await browser.close();
    }
  }

  private static extractPrice(priceText: string | null): number {
    if (!priceText) return 0;
    const cleanText = priceText.replace(/From\s+/i, '').replace(/current price\s+/i, '');
    const match = cleanText.match(/\$?([\d,]+\.?\d*)/);
    return match ? parseFloat(match[1].replace(',', '')) : 0;
  }
}
