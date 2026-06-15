import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import dbConnect from './mongodb';
import EmailCampaign from '@/models/EmailCampaign';
import EmailLog from '@/models/EmailLog';
import User from '@/models/User';
import { EmailService } from './email';
import { getCampaignRecipients } from '@/utils/audienceBuilder';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

let connection: IORedis | null = null;
let emailQueue: Queue | null = null;
let queueWorker: Worker | null = null;
let isRedisAvailable = false;

// Attempt Redis connection
try {
  const redisOptions: any = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null, // Required for BullMQ
    connectTimeout: 5000,
    lazyConnect: true
  };
  if (REDIS_PASSWORD) {
    redisOptions.password = REDIS_PASSWORD;
  }

  connection = new IORedis(redisOptions);
  
  // Test connection
  connection.connect()
    .then(() => {
      console.log(`[QUEUE] Connected to Redis successfully at ${REDIS_HOST}:${REDIS_PORT}`);
      isRedisAvailable = true;
      initializeQueue();
    })
    .catch((err) => {
      console.warn(`[QUEUE] Redis connection failed: ${err.message}. Fallback to DB queue.`);
      isRedisAvailable = false;
    });
} catch (error: any) {
  console.warn(`[QUEUE] Redis configuration failed: ${error.message}. Fallback to DB queue.`);
  isRedisAvailable = false;
}

function initializeQueue() {
  const redisConnectionConfig = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null
  };

  // Define Queue
  emailQueue = new Queue('email-campaign-queue', {
    connection: redisConnectionConfig,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  });

  // Define Worker
  queueWorker = new Worker(
    'email-campaign-queue',
    async (job: Job) => {
      console.log(`[QUEUE-WORKER] Processing job: ${job.name} (ID: ${job.id})`);
      await dbConnect();

      if (job.name === 'campaign-dispatcher') {
        const { campaignId } = job.data;
        await dispatchCampaignJobs(campaignId);
      } else if (job.name === 'email-sender') {
        const { campaignId, recipientEmail, recipientName, userId, subject, content, attachments } = job.data;
        await sendCampaignEmail(campaignId, recipientEmail, recipientName, userId, subject, content, attachments);
      }
    },
    { connection: redisConnectionConfig, concurrency: 5 } // Process 5 emails concurrently
  );

  queueWorker.on('failed', (job, err) => {
    console.error(`[QUEUE-WORKER] Job ${job?.id} failed:`, err.message);
  });
}

// ----------------------------------------------------
// Dispatcher & Sender Logic
// ----------------------------------------------------

// Resolve merge tags for a recipient
export function resolveMergeTags(content: string, user: any): string {
  if (!content) return '';
  let resolved = content;
  
  const joiningDateFormatted = (user.joiningDate || user.createdAt)
    ? new Date(user.joiningDate || user.createdAt).toLocaleDateString('en-IN')
    : 'N/A';

  const tags: Record<string, string> = {
    '{{name}}': user.fullName || '',
    '{{email}}': user.email || '',
    '{{phone}}': user.mobile || '',
    '{{employeeId}}': user.employeeId || '',
    '{{memberId}}': user.memberId || user._id?.toString() || '',
    '{{designation}}': user.designation || '',
    '{{district}}': user.district || '',
    '{{state}}': user.state || '',
    '{{vendorName}}': user.businessName || '',
    '{{joiningDate}}': joiningDateFormatted
  };

  for (const [tag, val] of Object.entries(tags)) {
    // Replace all occurrences of tag
    resolved = resolved.replace(new RegExp(tag, 'g'), val);
  }

  return resolved;
}

// Dispatches individual email sending jobs for all recipients in a campaign
async function dispatchCampaignJobs(campaignId: string) {
  const campaign = await EmailCampaign.findById(campaignId);
  if (!campaign || campaign.status === 'cancelled') return;

  // Query matching audience using unified extraction service
  const recipients = await getCampaignRecipients(campaign.filters);
  
  // Find successful logs to skip (Fix 3 - Campaign Recovery)
  const successEmails = await EmailLog.find({
    campaignId: campaign._id,
    status: { $in: ['success', 'delivered', 'opened', 'clicked'] }
  }).distinct('recipient');
  
  const successSet = new Set(successEmails);
  const remainingRecipients = recipients.filter(user => !successSet.has(user.email));

  console.log(`[QUEUE] Dispatching campaign "${campaign.name}". Total: ${recipients.length}, Sent: ${successSet.size}, Remaining: ${remainingRecipients.length}`);
  
  if (campaign.status !== 'sending') {
    campaign.status = 'sending';
  }
  if (!campaign.sentAt) {
    campaign.sentAt = new Date();
  }
  campaign.recipientCount = recipients.length;
  await campaign.save();

  if (remainingRecipients.length === 0) {
    campaign.status = 'completed';
    campaign.completedAt = campaign.completedAt || new Date();
    await campaign.save();
    return;
  }

  if (isRedisAvailable && emailQueue) {
    // BullMQ bulk addition
    const jobs = remainingRecipients.map(user => ({
      name: 'email-sender',
      data: {
        campaignId: campaign._id.toString(),
        recipientEmail: user.email,
        recipientName: user.fullName,
        userId: user._id.toString(),
        subject: campaign.subject,
        content: campaign.content,
        attachments: campaign.attachments
      }
    }));
    await emailQueue.addBulk(jobs);
  } else {
    // Fallback: Dispatch via background DB processor asynchronously
    // Start background process without blocking
    processCampaignDbFallback(campaignId, remainingRecipients);
  }
}

// Sends a single email, logs delivery tracking, and updates campaign aggregate metrics
async function sendCampaignEmail(
  campaignId: string,
  email: string,
  name: string,
  userId: string,
  subject: string,
  content: string,
  attachments?: any[]
) {
  // Resolve merge tags for this user
  let userObj: any = { fullName: name, email };
  try {
    const fetched = await User.findById(userId).lean();
    if (fetched) userObj = fetched;
  } catch {}

  const customizedContent = resolveMergeTags(content, userObj);
  const customizedSubject = resolveMergeTags(subject, userObj);

  // Initialize pending log
  const log = await EmailLog.create({
    recipient: email,
    recipientUser: userId,
    recipientName: name,
    subject: customizedSubject,
    type: 'campaign',
    campaignId,
    status: 'pending',
    sentAt: new Date()
  });

  // Call Email Provider Abstraction
  const formattedAttachments = attachments?.map(att => ({
    filename: att.filename,
    content: att.url, // Resend / providers can read this or we parse it
    contentType: 'application/octet-stream' // fallback
  }));

  const result = await EmailService.send(email, customizedSubject, customizedContent, formattedAttachments);

  // Update Log and Campaign counts
  if (result.success) {
    log.status = 'success';
    log.delivered = true;
    await log.save();

    await EmailCampaign.findByIdAndUpdate(campaignId, {
      $inc: { deliveredCount: 1 }
    });
  } else {
    log.status = 'failed';
    log.failed = true;
    log.error = result.error;
    await log.save();

    await EmailCampaign.findByIdAndUpdate(campaignId, {
      $inc: { failedCount: 1 }
    });
  }

  // Check if campaign is finished
  await checkCampaignCompletion(campaignId);
}

// Checks if all emails for a campaign have been sent and updates the campaign status
async function checkCampaignCompletion(campaignId: string) {
  const campaign = await EmailCampaign.findById(campaignId);
  if (!campaign) return;

  const totalProcessed = campaign.deliveredCount + campaign.failedCount;
  if (totalProcessed >= campaign.recipientCount && campaign.status === 'sending') {
    campaign.status = 'completed';
    campaign.completedAt = new Date();
    await campaign.save();
    console.log(`[QUEUE] Campaign "${campaign.name}" has completed sending to ${totalProcessed}/${campaign.recipientCount} users.`);
  }
}

// Fallback sequential processor using MongoDB database (runs asynchronously on node thread)
async function processCampaignDbFallback(campaignId: string, recipients: any[]) {
  console.log(`[QUEUE-FALLBACK] Starting db fallback sequential processor for campaign: ${campaignId}`);
  
  const campaign = await EmailCampaign.findById(campaignId);
  if (!campaign) return;

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (let i = 0; i < recipients.length; i++) {
    // Check if campaign was cancelled in the middle
    const currentCampaignStatus = await EmailCampaign.findById(campaignId).select('status');
    if (currentCampaignStatus?.status === 'cancelled') {
      console.log(`[QUEUE-FALLBACK] Campaign ${campaignId} cancelled during run.`);
      break;
    }

    const user = recipients[i];
    try {
      await sendCampaignEmail(
        campaignId,
        user.email,
        user.fullName,
        user._id.toString(),
        campaign.subject,
        campaign.content,
        campaign.attachments
      );
    } catch (err) {
      console.error(`[QUEUE-FALLBACK] Error processing email for ${user.email} in fallback:`, err);
    }

    // Add 1000ms delay between sends (Fix 2)
    if (i < recipients.length - 1) {
      await delay(1000);
    }
  }

  // Ensure status updates to completed if fallback finished everything
  const finalCampaign = await EmailCampaign.findById(campaignId);
  if (finalCampaign && finalCampaign.status === 'sending') {
    const pendingCount = await EmailLog.countDocuments({ campaignId, status: 'pending' });
    if (pendingCount === 0) {
      finalCampaign.status = 'completed';
      finalCampaign.completedAt = new Date();
      await finalCampaign.save();
      console.log(`[QUEUE-FALLBACK] Completed campaign: ${campaignId}`);
    }
  }
}

// ----------------------------------------------------
// Public API Interfaces
// ----------------------------------------------------
export const CampaignQueue = {
  addCampaign: async (campaignId: string, delayMs?: number) => {
    await dbConnect();
    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    if (delayMs && delayMs > 0) {
      // Schedule it
      campaign.status = 'scheduled';
      campaign.scheduledAt = new Date(Date.now() + delayMs);
      await campaign.save();

      if (isRedisAvailable && emailQueue) {
        await emailQueue.add('campaign-dispatcher', { campaignId }, { delay: delayMs, jobId: campaignId });
        console.log(`[QUEUE] Scheduled campaign ${campaign.name} via BullMQ with delay ${delayMs}ms`);
      } else {
        console.log(`[QUEUE] Scheduled campaign ${campaign.name} via DB fallback at ${campaign.scheduledAt}`);
      }
    } else {
      // Send immediately
      campaign.status = 'sending';
      await campaign.save();

      if (isRedisAvailable && emailQueue) {
        await emailQueue.add('campaign-dispatcher', { campaignId }, { jobId: campaignId });
        console.log(`[QUEUE] Enqueued campaign ${campaign.name} immediately via BullMQ`);
      } else {
        console.log(`[QUEUE] Enqueued campaign ${campaign.name} immediately via DB fallback`);
        // Trigger background dispatch without blocking
        setTimeout(() => {
          dispatchCampaignJobs(campaignId).catch(err => {
            console.error('[QUEUE] Error in DB fallback dispatcher:', err);
          });
        }, 100);
      }
    }
  },

  cancelCampaign: async (campaignId: string) => {
    await dbConnect();
    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    campaign.status = 'cancelled';
    await campaign.save();

    if (isRedisAvailable && emailQueue) {
      // Remove scheduled job from BullMQ if it is present
      const job = await emailQueue.getJob(campaignId);
      if (job) {
        await job.remove();
        console.log(`[QUEUE] Removed scheduled campaign job ${campaignId} from BullMQ`);
      }
    }
    console.log(`[QUEUE] Cancelled campaign status saved: ${campaignId}`);
  },

  isRedisActive: () => {
    return isRedisAvailable;
  },

  detectAndRecoverStuckCampaigns: async () => {
    await dbConnect();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Find campaigns in 'sending' state
    const activeCampaigns = await EmailCampaign.find({ status: 'sending' });
    const recovered = [];
    
    for (const campaign of activeCampaigns) {
      // Check the last sent email log
      const lastLog = await EmailLog.findOne({ campaignId: campaign._id })
        .sort({ sentAt: -1 })
        .select('sentAt');
        
      const lastActivity = lastLog ? lastLog.sentAt : campaign.sentAt;
      
      if (lastActivity && new Date(lastActivity) < fiveMinutesAgo) {
        console.warn(`[STUCK-CAMPAIGN-DETECTION] Campaign "${campaign.name}" (${campaign._id}) is stalled. Last activity was at ${lastActivity}.`);
        
        // Update status to stalled, log the error, and retry
        campaign.status = 'stalled';
        await campaign.save();
        
        // Log the recovery attempt to EmailLog
        await EmailLog.create({
          recipient: 'system@sakhihub.com',
          subject: `Stalled campaign recovery: ${campaign.name}`,
          type: 'system',
          campaignId: campaign._id.toString(),
          status: 'failed',
          error: `Campaign detected as stalled. Last activity: ${lastActivity}. Initiating automatic retry.`,
          sentAt: new Date(),
          timestamp: new Date()
        });
        
        // Change status to sending and retry
        campaign.status = 'sending';
        await campaign.save();
        
        // Trigger execution (which will skip already-sent recipients!)
        await CampaignQueue.addCampaign(campaign._id.toString());
        
        recovered.push({
          campaignId: campaign._id.toString(),
          name: campaign.name,
          lastActivity
        });
      }
    }
    return recovered;
  },

  recoverPendingLogs: async () => {
    await dbConnect();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const pendingLogs = await EmailLog.find({
      status: 'pending',
      createdAt: { $lt: fiveMinutesAgo }
    });

    let updatedCount = 0;

    for (const log of pendingLogs) {
      if (!log.campaignId) {
        log.status = 'failed';
        log.failed = true;
        log.error = 'Pending timeout (no campaign link)';
        await log.save();
        updatedCount++;
        continue;
      }

      const campaign = await EmailCampaign.findById(log.campaignId);
      if (!campaign) {
        log.status = 'failed';
        log.failed = true;
        log.error = 'Campaign not found';
        await log.save();
        updatedCount++;
        continue;
      }

      // Based on campaign state:
      if (['completed', 'cancelled'].includes(campaign.status)) {
        log.status = 'failed';
        log.failed = true;
        log.error = 'Pending timeout (campaign ended)';
        await log.save();
      } else {
        // Campaign is 'sending', 'stalled', or 'scheduled'.
        // Mark as failed with retry note so campaign recovery can pick it up.
        log.status = 'failed';
        log.failed = true;
        log.error = 'Connection timeout - scheduled for retry';
        await log.save();
      }
      updatedCount++;
    }

    return updatedCount;
  },

  getQueueMetrics: async () => {
    if (isRedisAvailable && emailQueue) {
      try {
        const counts = await emailQueue.getJobCounts();
        return {
          active: true,
          mode: 'bullmq',
          counts
        };
      } catch (err: any) {
        return {
          active: true,
          mode: 'bullmq',
          error: err.message
        };
      }
    } else {
      return {
        active: false,
        mode: 'database-fallback'
      };
    }
  },

  getWorkerMetrics: async () => {
    if (isRedisAvailable && queueWorker) {
      return {
        active: queueWorker.isRunning(),
        concurrency: (queueWorker as any).opts?.concurrency || 5,
        name: queueWorker.name
      };
    }
    return {
      active: false,
      mode: 'database-fallback'
    };
  }
};
