import puppeteer, { Browser } from 'puppeteer';
import { LoggerService } from '../services/loggerService';
import { PDFCacheService } from '../services/pdfCacheService';

export interface InvoiceData {
  id: number;
  orderDate: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  orderProducts: Array<{
    quantity: number;
    price: number;
    product: {
      name: string;
      description: string;
    };
  }>;
}

export async function generateInvoicePDF(orderData: InvoiceData): Promise<Buffer> {
  const cachedPdf = await PDFCacheService.get(orderData);
  if (cachedPdf) {
    return cachedPdf;
  }

  let browser: Browser | null = null;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      LoggerService.info('PDFGenerator', `Generating PDF for order ${orderData.id}, attempt ${retryCount + 1}`);
      
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        timeout: 30000
      });

      const page = await browser.newPage();
      await page.setDefaultTimeout(20000);
    
    const subtotal = orderData.orderProducts.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.08; // 8% tax rate
    const shipping = 10.00; // Fixed shipping cost
    const total = subtotal + tax + shipping;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice #${orderData.id}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
          }
          .company-info {
            flex: 1;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 5px;
          }
          .company-details {
            color: #666;
            font-size: 14px;
          }
          .invoice-info {
            text-align: right;
            flex: 1;
          }
          .invoice-title {
            font-size: 32px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }
          .invoice-number {
            font-size: 18px;
            color: #666;
          }
          .billing-section {
            display: flex;
            justify-content: space-between;
            margin: 30px 0;
          }
          .billing-info, .shipping-info {
            flex: 1;
            margin-right: 20px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .info-block {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #007bff;
          }
          .order-details {
            margin: 30px 0;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .detail-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .detail-label {
            font-weight: bold;
            color: #666;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .items-table th {
            background-color: #007bff;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: bold;
          }
          .items-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
          }
          .items-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .items-table tr:hover {
            background-color: #e3f2fd;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .totals-section {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
          }
          .totals-table {
            width: 300px;
            border-collapse: collapse;
          }
          .totals-table td {
            padding: 8px 15px;
            border-bottom: 1px solid #eee;
          }
          .totals-table .total-row {
            background-color: #007bff;
            color: white;
            font-weight: bold;
            font-size: 18px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            background-color: #28a745;
            color: white;
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="company-info">
            <div class="company-name">E-Commerce Store</div>
            <div class="company-details">
              123 Business Street<br>
              Commerce City, CC 12345<br>
              Phone: (555) 123-4567<br>
              Email: orders@ecommerce.com
            </div>
          </div>
          <div class="invoice-info">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">#${orderData.id}</div>
            <div style="margin-top: 10px;">
              <span class="status-badge">${orderData.status}</span>
            </div>
          </div>
        </div>

        <div class="billing-section">
          <div class="billing-info">
            <div class="section-title">Bill To</div>
            <div class="info-block">
              <strong>${orderData.user.firstName} ${orderData.user.lastName}</strong><br>
              ${orderData.user.email}
            </div>
          </div>
          <div class="shipping-info">
            <div class="section-title">Ship To</div>
            <div class="info-block">
              <strong>${orderData.user.firstName} ${orderData.user.lastName}</strong><br>
              ${orderData.shippingAddress.street}<br>
              ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipCode}<br>
              ${orderData.shippingAddress.country}
            </div>
          </div>
        </div>

        <div class="order-details">
          <div class="section-title">Order Information</div>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Order Date:</span>
              <span>${new Date(orderData.orderDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Payment Method:</span>
              <span>${orderData.paymentMethod}</span>
            </div>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th class="text-center">Quantity</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderData.orderProducts.map(item => `
              <tr>
                <td>
                  <strong>${item.product.name}</strong><br>
                  <small style="color: #666;">${item.product.description}</small>
                </td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">$${item.price.toFixed(2)}</td>
                <td class="text-right">$${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals-section">
          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td class="text-right">$${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax (8%):</td>
              <td class="text-right">$${tax.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Shipping:</td>
              <td class="text-right">$${shipping.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>Total:</td>
              <td class="text-right">$${total.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>For questions about this invoice, please contact us at orders@ecommerce.com or (555) 123-4567</p>
          <p>Payment terms: Net 30 days</p>
        </div>
      </body>
      </html>
    `;

    await page.setContent(html, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      const pdfBuffer = Buffer.from(pdf);
      await PDFCacheService.set(orderData, pdfBuffer);
      
      LoggerService.info('PDFGenerator', `PDF generated successfully for order ${orderData.id}`);
      return pdfBuffer;

    } catch (error) {
      retryCount++;
      LoggerService.error('PDFGenerator', `PDF generation attempt ${retryCount} failed for order ${orderData.id}`, error as Error);
      
      if (retryCount >= maxRetries) {
        LoggerService.error('PDFGenerator', `All PDF generation attempts failed for order ${orderData.id}`, error as Error);
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    } finally {
      if (browser) {
        await browser.close();
        browser = null;
      }
    }
  }

  throw new Error(`Failed to generate PDF after ${maxRetries} attempts`);
}
