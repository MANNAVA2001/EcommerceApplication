import { QueueService } from '../services/queueService';
import { connectDatabase } from '../config/database';

async function testEmailQueue() {
  try {
    await connectDatabase();
    
    const testOrderData = {
      id: 999,
      orderDate: new Date().toISOString(),
      totalAmount: 99.99,
      paymentMethod: 'Credit Card',
      status: 'confirmed',
      user: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      },
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'United States',
      },
      orderProducts: [
        {
          quantity: 1,
          price: 99.99,
          product: {
            name: 'Test Product',
            description: 'A test product for queue testing',
          },
        },
      ],
    };

    const jobId = await QueueService.addEmailJob({
      type: 'order-confirmation',
      orderId: 999,
      customerEmail: 'test@example.com',
      orderData: testOrderData,
    });

    console.log(`Test email job queued with ID: ${jobId}`);
    
    setTimeout(async () => {
      const status = await QueueService.getJobStatus(jobId);
      console.log('Job status:', status);
      process.exit(0);
    }, 5000);

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testEmailQueue();
