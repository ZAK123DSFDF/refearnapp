import { Redis } from '@upstash/redis/cloudflare';
import { shouldTrackRedis } from './shouldTrackRedis';
import { getOrgSettings } from './getOrgSettings';
import { beautifyReferrer } from './beautifyReferrer';
const BOT_REGEX =
	/bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebookcatalog|Facebot|Twitterbot|Pinterest|LinkedInBot|Slackbot|TelegramBot|WhatsApp|Snapchat|Discordbot|Mastodon|pinit/i;
const CLIENT_TOKEN = 'refearnapp-v1-human';
export default {
	async fetch(request: Request, env: any, ctx: any): Promise<Response> {
		const url = new URL(request.url);
		const redis = Redis.fromEnv(env);

		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
		// --- GET ORG SETTINGS ---
		if (url.pathname === '/org') {
			const ua = request.headers.get('user-agent') || '';
			const isBot = BOT_REGEX.test(ua) || ua.includes('FBAN') || ua.includes('FBAV');
			if (isBot) {
				return new Response('Bot blocked', { status: 403, headers: corsHeaders });
			}
			const code = url.searchParams.get('code');
			if (!code) {
				return new Response('Missing code', { status: 400, headers: corsHeaders });
			}

			const org = await getOrgSettings(code, redis);
			if (!org) {
				return new Response('Not found', { status: 404, headers: corsHeaders });
			}

			const {
				cookieLifetimeValue,
				cookieLifetimeUnit,
				commissionType,
				commissionValue,
				commissionDurationValue,
				commissionDurationUnit,
				attributionModel,
				referralParam,
				currency,
			} = org;

			return new Response(
				JSON.stringify({
					cookieLifetimeValue: Number(cookieLifetimeValue),
					cookieLifetimeUnit,
					commissionType,
					commissionValue: Number(commissionValue),
					commissionDurationValue: Number(commissionDurationValue),
					commissionDurationUnit,
					attributionModel,
					referralParam,
					currency,
				}),
				{
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				},
			);
		}

		// --- TRACK CLICK ---
		if (url.pathname === '/track' && request.method === 'POST') {
			const data = (await request.json()) as {
				ref: string;
				referrer?: string;
				userAgent?: string;
				url?: string;
				host?: string;
				browser?: string;
				os?: string;
				deviceType?: string;
				token?: string;
			};
			const ua = data.userAgent || request.headers.get('user-agent') || '';
			const isBot = BOT_REGEX.test(ua) || ua.includes('FBAN') || ua.includes('FBAV');
			if (isBot || data.token !== CLIENT_TOKEN) {
				return new Response(JSON.stringify({ success: false, reason: 'Bot excluded' }), {
					status: 403,
					headers: corsHeaders,
				});
			}
			const code = data.ref;
			if (!code) {
				return new Response('Missing ref', { status: 400, headers: corsHeaders });
			}

			const org = await getOrgSettings(code, redis);
			if (!org || !org.orgId) {
				return new Response(JSON.stringify({ success: false, reason: 'Invalid code' }), { status: 200, headers: corsHeaders });
			}

			const canTrack = shouldTrackRedis(org);

			if (!canTrack) {
				return new Response(
					JSON.stringify({
						success: false,
						reason: 'Tracking disabled',
					}),
					{ status: 200, headers: corsHeaders },
				);
			}
			// 🚀 THE HIGH-SCALE AGGREGATION ENGINE
			const now = new Date();
			const dateStr = now.toISOString().slice(0, 10);
			const hour = now.getUTCHours();
			const monthStr = now.toISOString().slice(0, 7);
			const cleanReferrer = beautifyReferrer(data.referrer);
			const cleanUrl = data.url ? data.url.split('?')[0] : 'unknown';
			const usageKey = `usage:total_clicks:${org.ownerId}:${monthStr}`;
			const aggKey = [
				code,
				org.orgId,
				dateStr,
				hour,
				data.host || 'unknown',
				cleanReferrer,
				data.deviceType || 'desktop',
				data.browser || 'unknown',
				data.os || 'unknown',
				cleanUrl,
			].join(':::');
			ctx.waitUntil(Promise.all([redis.hincrby('sync_batch', aggKey, 1), redis.incr(usageKey), redis.expire(usageKey, 5184000)]));
			return new Response(
				JSON.stringify({
					success: true,
				}),
				{ headers: corsHeaders },
			);
		}

		return new Response('Not Found', { status: 404, headers: corsHeaders });
	},
	async scheduled(_: any, env: any) {
		console.log('⏰ Scheduled Cron Triggered at:', new Date().toISOString());
		const redis = Redis.fromEnv(env);
		const exists = await redis.exists('sync_batch');
		if (!exists) return;

		// 1. Isolate the data with a timestamped key
		const processingKey = `sync_processing_${Date.now()}`;
		await redis.rename('sync_batch', processingKey);

		let cursor = '0';
		const fullBatch: Record<string, string> = {};

		// 2. Efficiently pull data into memory
		do {
			const [nextCursor, items] = await redis.hscan(processingKey, cursor, { count: 1000 });
			cursor = nextCursor;

			for (let i = 0; i < items.length; i += 2) {
				// ✅ FIX: Explicitly cast key and value to String to resolve TS2322
				const key = String(items[i]);
				fullBatch[key] = String(items[i + 1]);
			}
		} while (cursor !== '0');

		// 3. Prevent empty pings
		const batchKeys = Object.keys(fullBatch);
		if (batchKeys.length === 0) {
			await redis.del(processingKey);
			return;
		}

		try {
			const response = await fetch(`${env.MAIN_APP_URL}/api/internal/sync-batch`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-internal-secret': env.INTERNAL_SECRET,
				},
				body: JSON.stringify({ batch: fullBatch }),
			});

			if (response.ok) {
				// SUCCESS: Cleanup temp data
				await redis.del(processingKey);
				console.log(`✅ Synced ${batchKeys.length} items to Vercel.`);
			} else {
				throw new Error(`Server returned ${response.status}`);
			}
		} catch (error) {
			console.error('❌ Sync failed, merging data back to main batch:', error);

			/** * SAFE FAIL-BACK:
			 * We iterate the fullBatch and use HINCRBY to merge it back into 'sync_batch'.
			 * This ensures if new clicks happened while we were trying to sync,
			 * we don't overwrite them; we add to them.
			 */
			const pipeline = redis.pipeline();
			for (const [key, val] of Object.entries(fullBatch)) {
				pipeline.hincrby('sync_batch', key, parseInt(val));
			}
			await pipeline.exec();
			await redis.del(processingKey);
		}
	},
};
