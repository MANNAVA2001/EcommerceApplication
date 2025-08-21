import puppeteer, { Browser, Page } from 'puppeteer';
import { LoggerService } from '../services/loggerService';
import { ScrapedPrice } from './bestBuyScraper';

export class CostcoScraper {
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
      
      const searchUrl = `https://www.costco.com/s?dept=All&keyword=${encodeURIComponent(productName)}`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
      
      const noResultsText = await page.$eval('body', el => el.textContent || '');
      if (noResultsText.includes('We were not able to find a match')) {
        return null;
      }
      
      const priceSelectors = [
        '.price .currency + .sr-only',
        '.product-price .price',
        '[data-testid="price"]',
        '.price-current',
        '.product-tile-price .price'
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
      LoggerService.error('CostcoScraper', `Failed to scrape price for ${productName}`, error as Error);
      return null;
    } finally {
      if (browser) await browser.close();
    }
  }

  private static extractPrice(priceText: string | null): number {
    if (!priceText) return 0;
    const match = priceText.match(/\$?([\d,]+\.?\d*)/);
    return match ? parseFloat(match[1].replace(',', '')) : 0;
  }
}
