import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import dbConnect from './mongodb';
import EmailCampaign from '@/models/EmailCampaign';
import EmailLog from '@/models/EmailLog';
import User from '@/models/User';
import { EmailService } from './email';
import { translateFiltersToMongoQuery } from '@/utils/audienceBuilder';

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
  
  const joiningDateFormatted = user.joiningDate 
    ? new Date(user.joiningDate).toLocaleDateString()
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

  campaign.status = 'sending';
  campaign.sentAt = new Date();
  await campaign.save();

  // Query matching audience
  const query = await translateFiltersToMongoQuery(campaign.filters);
  // Ensure email is present
  query.email = { $exists: true, $ne: '' };
  
  const recipients = await User.find(query).lean();
  
  console.log(`[QUEUE] Dispatching campaign "${campaign.name}" to ${recipients.length} recipients`);
  campaign.recipientCount = recipients.length;
  await campaign.save();

  if (recipients.length === 0) {
    campaign.status = 'completed';
    campaign.completedAt = new Date();
    await campaign.save();
    return;
  }

  if (isRedisAvailable && emailQueue) {
    // BullMQ bulk addition
    const jobs = recipients.map(user => ({
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
    processCampaignDbFallback(campaignId, recipients);
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

// Fallback Batch processor using MongoDB database (runs asynchronously on node thread)
async function processCampaignDbFallback(campaignId: string, recipients: any[]) {
  console.log(`[QUEUE-FALLBACK] Starting db fallback batch processor for campaign: ${campaignId}`);
  
  const campaign = await EmailCampaign.findById(campaignId);
  if (!campaign) return;

  // Process in batches of 10 to avoid server blocking and rate limit bans
  const batchSize = 10;
  const delayBetweenBatchesMs = 2000;

  for (let i = 0; i < recipients.length; i += batchSize) {
    // Check if campaign was cancelled in the middle
    const currentCampaignStatus = await EmailCampaign.findById(campaignId).select('status');
    if (currentCampaignStatus?.status === 'cancelled') {
      console.log(`[QUEUE-FALLBACK] Campaign ${campaignId} cancelled during run.`);
      break;
    }

    const batch = recipients.slice(i, i + batchSize);
    
    // Process batch concurrently
    await Promise.all(
      batch.map(user =>
        sendCampaignEmail(
          campaignId,
          user.email,
          user.fullName,
          user._id.toString(),
          campaign.subject,
          campaign.content,
          campaign.attachments
        ).catch(err => {
          console.error(`[QUEUE-FALLBACK] Error processing email in fallback:`, err);
        })
      )
    );

    // Rate-limit batch delay
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatchesMs));
    }
  }

  // Ensure status updates to completed if fallback finished everything
  const finalCampaign = await EmailCampaign.findById(campaignId);
  if (finalCampaign && finalCampaign.status === 'sending') {
    finalCampaign.status = 'completed';
    finalCampaign.completedAt = new Date();
    await finalCampaign.save();
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
  }
};
