import { Redis } from '@upstash/redis/cloudflare';
import { shouldTrackRedis } from './shouldTrackRedis';

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
			const code = url.searchParams.get('code');
			if (!code) {
				return new Response('Missing code', { status: 400, headers: corsHeaders });
			}

			const raw = await redis.hgetall(`ref:${code}`);
			if (!raw || !raw.orgId) {
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
			} = raw;

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
			};

			const code = data.ref;
			if (!code) {
				return new Response('Missing ref', { status: 400, headers: corsHeaders });
			}

			const org = (await redis.hgetall(`ref:${code}`)) as Record<string, string> | null;
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
			const aggKey = [
				code,
				org.orgId,
				dateStr,
				hour,
				data.host || 'unknown',
				data.referrer || 'direct',
				data.deviceType || 'desktop',
				data.browser || 'unknown',
				data.os || 'unknown',
				data.url || 'unknown',
			].join(':::');
			ctx.waitUntil(Promise.all([redis.hincrby('sync_batch', aggKey, 1), redis.incr(`usage:total_clicks:${org.ownerId}:${monthStr}`)]));
			return new Response(
				JSON.stringify({
					success: true,
				}),
				{ headers: corsHeaders },
			);
		}

		return new Response('Not Found', { status: 404 });
	},
	async scheduled(_: any, env: any) {
		const redis = Redis.fromEnv(env);
		const exists = await redis.exists('sync_batch');
		if (!exists) return;

		const processingKey = `sync_processing_${Date.now()}`;
		await redis.rename('sync_batch', processingKey);
		const batch = (await redis.hgetall(processingKey)) as Record<string, string>;

		const response = await fetch(`${env.MAIN_APP_URL}/api/internal/sync-batch`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'x-internal-secret': env.INTERNAL_SECRET },
			body: JSON.stringify({ batch }),
		});

		if (response.ok) await redis.del(processingKey);
		else await redis.rename(processingKey, 'sync_batch');
	},
};
