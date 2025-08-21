export function generateOrderConfirmationHTML(orderData: any): string {
  const subtotal = orderData.orderProducts?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;
  const tax = subtotal * 0.08;
  const shipping = 10.00;
  const total = subtotal + tax + shipping;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation #${orderData.id}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          line-height: 1.6;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
        .order-title {
          font-size: 24px;
          color: #333;
          margin-bottom: 10px;
        }
        .order-number {
          font-size: 18px;
          color: #666;
        }
        .section {
          margin: 30px 0;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 15px;
          text-transform: uppercase;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .info-block {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          border-left: 4px solid #007bff;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
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
        .totals-section {
          margin-top: 30px;
          text-align: right;
        }
        .totals-table {
          margin-left: auto;
          border-collapse: collapse;
          min-width: 300px;
        }
        .totals-table td {
          padding: 8px 15px;
          border-bottom: 1px solid #eee;
        }
        .total-row {
          background-color: #007bff;
          color: white;
          font-weight: bold;
          font-size: 18px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 14px;
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
      <div class="container">
        <div class="header">
          <div class="company-name">E-Commerce Store</div>
          <div class="order-title">Order Confirmation</div>
          <div class="order-number">#${orderData.id}</div>
          <div style="margin-top: 10px;">
            <span class="status-badge">${orderData.status}</span>
          </div>
        </div>

        <div class="section">
          <p>Dear ${orderData.user?.firstName || 'Customer'},</p>
          <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
        </div>

        <div class="section">
          <div class="section-title">Customer & Shipping Information</div>
          <div class="info-grid">
            <div class="info-block">
              <strong>Bill To:</strong><br>
              ${orderData.user?.firstName} ${orderData.user?.lastName}<br>
              ${orderData.user?.email}
            </div>
            <div class="info-block">
              <strong>Ship To:</strong><br>
              ${orderData.user?.firstName} ${orderData.user?.lastName}<br>
              ${orderData.shippingAddress?.street}<br>
              ${orderData.shippingAddress?.city}, ${orderData.shippingAddress?.state} ${orderData.shippingAddress?.zipCode}<br>
              ${orderData.shippingAddress?.country}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Order Details</div>
          <div class="info-grid">
            <div class="info-block">
              <strong>Order Date:</strong><br>
              ${new Date(orderData.orderDate).toLocaleDateString()}
            </div>
            <div class="info-block">
              <strong>Payment Method:</strong><br>
              ${orderData.paymentMethod}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Order Items</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.orderProducts?.map((item: any) => `
                <tr>
                  <td>
                    <strong>${item.product?.name || 'Product'}</strong><br>
                    <small style="color: #666;">${item.product?.description || ''}</small>
                  </td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">$${item.price.toFixed(2)}</td>
                  <td style="text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
        </div>

        <div class="totals-section">
          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">$${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax (8%):</td>
              <td style="text-align: right;">$${tax.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Shipping:</td>
              <td style="text-align: right;">$${shipping.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>Total:</td>
              <td style="text-align: right;">$${total.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p><strong>Thank you for your business!</strong></p>
          <p>For questions about this order, please contact us at orders@ecommerce.com or (555) 123-4567</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
