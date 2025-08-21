import express from 'express';
import { QueueService } from '../services/queueService';
import { EmailDeliveryStatus } from '../config/database';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const stats = await QueueService.getQueueStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get queue stats' });
  }
});

router.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobStatus = await QueueService.getJobStatus(jobId);
    const deliveryStatus = await EmailDeliveryStatus.findOne({
      where: { jobId }
    });
    
    res.json({
      job: jobStatus,
      delivery: deliveryStatus,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

router.post('/retry-failed', async (req, res) => {
  try {
    await QueueService.retryFailedJobs();
    res.json({ message: 'Failed jobs retried successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retry failed jobs' });
  }
});

router.post('/clean', async (req, res) => {
  try {
    await QueueService.cleanOldJobs();
    res.json({ message: 'Old jobs cleaned successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clean old jobs' });
  }
});

router.get('/delivery-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const deliveryStatus = await EmailDeliveryStatus.findAll({
      where: { orderId: parseInt(orderId) },
      order: [['createdAt', 'DESC']],
    });
    
    res.json(deliveryStatus);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get delivery status' });
  }
});

export default router;
