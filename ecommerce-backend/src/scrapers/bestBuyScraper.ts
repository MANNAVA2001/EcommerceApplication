import { LoggerService } from '../services/loggerService';

export interface ScrapedPrice {
  price: number;
  availability: boolean;
  url: string;
}

export class BestBuyScraper {
  private static readonly API_BASE_URL = 'https://api.bestbuy.com/v1';
  private static readonly API_KEY = process.env.BESTBUY_API_KEY || '';

  static async scrapePrice(productName: string): Promise<ScrapedPrice | null> {
    try {
      if (!this.API_KEY) {
        LoggerService.warn('BestBuyScraper', 'BestBuy API key not configured, using mock data');
        return this.getMockPrice(productName);
      }

      const searchQuery = encodeURIComponent(productName);
      const apiUrl = `${this.API_BASE_URL}/products((search=${searchQuery}))?apiKey=${this.API_KEY}&format=json&show=name,salePrice,regularPrice,url,onlineAvailability&pageSize=1`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`BestBuy API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        const price = product.salePrice || product.regularPrice || 0;
        
        return {
          price: parseFloat(price.toString()),
          availability: product.onlineAvailability === true,
          url: product.url || `https://www.bestbuy.com/site/searchpage.jsp?st=${searchQuery}`
        };
      }
      
      return null;
    } catch (error) {
      LoggerService.error('BestBuyScraper', `Failed to fetch price from BestBuy API for ${productName}`, error as Error);
      return this.getMockPrice(productName);
    }
  }

  private static getMockPrice(productName: string): ScrapedPrice {
    const mockPrices: { [key: string]: number } = {
      'macbook': 1299.99,
      'iphone': 999.99,
      'airpods': 179.99,
      'ipad': 329.99,
      'samsung galaxy': 899.99,
      'sony headphones': 299.99,
      'laptop': 799.99,
      'phone': 699.99,
      'tablet': 249.99,
      'headphones': 199.99
    };

    const lowerProductName = productName.toLowerCase();
    let mockPrice = 299.99;

    for (const [key, price] of Object.entries(mockPrices)) {
      if (lowerProductName.includes(key)) {
        mockPrice = price;
        break;
      }
    }

    const variation = (Math.random() - 0.5) * 100;
    const finalPrice = Math.max(mockPrice + variation, 50);

    return {
      price: Math.round(finalPrice * 100) / 100,
      availability: Math.random() > 0.2,
      url: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(productName)}`
    };
  }
}
