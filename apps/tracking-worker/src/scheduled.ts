import { Redis } from '@upstash/redis/cloudflare';

export async function handleScheduled(event: any, env: any) {
	console.log(`⏰ Cron Triggered: ${event.cron} at ${new Date().toISOString()}`);

	switch (event.cron) {
		case '*/5 * * * *':
			return await handleBatchSync(env);
		case '0 0 * * *':
			return await handleCurrencySeed(env);
		default:
			console.log('No handler for this cron string');
	}
}

async function handleBatchSync(env: any) {
	const redis = Redis.fromEnv(env);

	// --- 1. HANDLE CLICK BATCH (Existing Logic) ---
	const clickExists = await redis.exists('sync_batch');
	let clickBatch: Record<string, string> = {};
	let clickProcessingKey = '';

	if (clickExists) {
		clickProcessingKey = `sync_processing_clicks_${Date.now()}`;
		await redis.rename('sync_batch', clickProcessingKey);

		let cursor = '0';
		do {
			const [nextCursor, items] = await redis.hscan(clickProcessingKey, cursor, { count: 1000 });
			cursor = nextCursor;
			for (let i = 0; i < items.length; i += 2) {
				clickBatch[String(items[i])] = String(items[i + 1]);
			}
		} while (cursor !== '0');
	}

	// --- 2. HANDLE LEAD BATCH (New Signup Logic) ---
	// Look for keys matching sync:leads:orgId:date
	const leadKeys = await redis.keys('sync:leads:*');
	const leadData: Record<string, string[]> = {}; // { orgId: ["email:::code", ...] }

	for (const key of leadKeys) {
		const parts = key.split(':');
		const orgId = parts[2];
		const leads = await redis.smembers(key);
		if (leads.length > 0) {
			leadData[orgId] = leads;
		}
	}

	// --- 3. SEND TO VERCEL ---
	if (Object.keys(clickBatch).length === 0 && Object.keys(leadData).length === 0) return;

	try {
		const response = await fetch(`${env.MAIN_APP_URL}/api/internal/sync-batch`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-internal-secret': env.INTERNAL_SECRET,
			},
			body: JSON.stringify({
				batch: clickBatch,
				leads: leadData,
			}),
		});

		if (response.ok) {
			// Success! Cleanup Redis
			if (clickProcessingKey) await redis.del(clickProcessingKey);
			for (const key of leadKeys) await redis.del(key);
			console.log(`✅ Synced ${Object.keys(clickBatch).length} clicks and ${Object.keys(leadData).length} org-leads.`);
		} else {
			throw new Error(`Server returned ${response.status}`);
		}
	} catch (error) {
		console.error('❌ Sync failed, keeping data in Redis:', error);
		if (clickProcessingKey) {
			const pipeline = redis.pipeline();
			for (const [key, val] of Object.entries(clickBatch)) {
				pipeline.hincrby('sync_batch', key, parseInt(val));
			}
			await pipeline.exec();
			await redis.del(clickProcessingKey);
		}
	}
}

async function handleCurrencySeed(env: any) {
	try {
		const response = await fetch(`${env.MAIN_APP_URL}/api/internal/seed-rates`, {
			method: 'POST',
			headers: { 'x-internal-secret': env.INTERNAL_SECRET },
		});

		if (response.ok) {
			console.log('✅ Triggered Currency Seed on Vercel');
		} else {
			console.error('❌ Vercel failed to process currency seed');
		}
	} catch (err) {
		console.error('❌ Error pinging currency seed endpoint:', err);
	}
}
