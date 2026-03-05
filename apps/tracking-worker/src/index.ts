import { Redis } from '@upstash/redis/cloudflare';
import { shouldTrackRedis } from './shouldTrackRedis';
import { getOrgSettings } from './getOrgSettings';
import { beautifyReferrer } from './beautifyReferrer';
import { handleScheduled } from './scheduled';
const BOT_REGEX = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebookcatalog/i;
export default {
	async fetch(request: Request, env: any, ctx: any): Promise<Response> {
		const url = new URL(request.url);
		const redis = Redis.fromEnv(env);
		const PAGES_URL = env.PAGES_URL || 'https://refearnapp.pages.dev';
		const VERCEL_ORIGIN = env.MAIN_APP_URL || 'https://origin.refearnapp.com';
		const PRIMARY_HOST = env.PRIMARY_HOST || 'www.refearnapp.com';
		function isEnabled(value: string | undefined): boolean {
			return value?.toLowerCase() === 'true' || value === '1';
		}
		const isSelfHosted = isEnabled(env.IS_SELF_HOSTED);
		// 1. SPECIFIC PUBLIC ASSETS (Strict Whitelist)
		// These are the files you manually put in /public
		const publicAssets = [
			'/apple-touch-icon.png',
			'/favicon.ico',
			'/favicon.svg',
			'/favicon-96x96.png',
			'/opengraph-update.png',
			'/refearnapp.svg',
			'/robots.txt',
			'/sitemap-index.xml',
			'/sitemap-0.xml',
			'/sitemap.xml',
		];

		// 2. CHECK IF ROUTE BELONGS TO ASTRO
		const isHome = url.pathname === '/';
		const isExplicitAsset = publicAssets.includes(url.pathname);
		const isLegalPage = ['/terms', '/privacy-policy', '/refund-policy'].includes(url.pathname);
		const isToolPage = url.pathname.startsWith('/tools/');
		const isComparePage = url.pathname.startsWith('/alternative/');
		// Astro compiled files (JS/CSS) always live here.
		// Your Vercel app likely doesn't use this specific folder name.
		const isCompiledAsset = url.pathname.startsWith('/_astro/');
		const isDocsPage = url.pathname.startsWith('/docs');
		const shouldServeAstro =
			isExplicitAsset || isCompiledAsset || (!isSelfHosted && (isHome || isLegalPage || isToolPage || isComparePage || isDocsPage));
		if (shouldServeAstro) {
			const resp = await fetch(`${PAGES_URL}${url.pathname}${url.search}`);
			const newResp = new Response(resp.body, resp);
			newResp.headers.set('Access-Control-Allow-Origin', '*');
			return newResp;
		}
		const origin = request.headers.get('Origin') || '*';
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};
		const credentialedCorsHeaders = {
			'Access-Control-Allow-Origin': origin,
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
			'Access-Control-Allow-Credentials': 'true',
		};
		if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
		// --- GET ORG SETTINGS ---
		if (url.pathname === '/org') {
			const ua = request.headers.get('user-agent') || '';
			const isBot = BOT_REGEX.test(ua);
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
			};
			const ua = data.userAgent || request.headers.get('user-agent') || '';
			const isBot = BOT_REGEX.test(ua);
			if (isBot) {
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
			const canTrack = shouldTrackRedis(org, isSelfHosted);

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
		// --- TRACK SIGNUP (LEAD) ---
		if (url.pathname === '/track-signup' && request.method === 'POST') {
			const { email } = (await request.json()) as { email: string };
			if (!email) return new Response('Missing email', { status: 400, headers: credentialedCorsHeaders });

			const cookieHeader = request.headers.get('Cookie') || '';
			const cookieName = 'refearnapp_affiliate_cookie';
			const rawCookie = cookieHeader.split('; ').find((row) => row.trim().startsWith(`${cookieName}=`));

			if (!rawCookie) {
				return new Response(JSON.stringify({ success: false, reason: 'No cookie' }), { status: 200, headers: credentialedCorsHeaders });
			}

			try {
				const cookieValue = decodeURIComponent(rawCookie.split('=')[1]);
				const affiliateData = JSON.parse(cookieValue);
				const code = affiliateData.code;

				// 1. Get Org Settings from Redis (The ref:{code} object)
				const org = await getOrgSettings(code, redis);
				if (!org) return new Response('Org not found', { status: 404, headers: credentialedCorsHeaders });
				const updatedCookieData = { ...affiliateData, email: email.toLowerCase() };

				// 3. Update Stats & Usage (Clutter-free)
				const now = new Date();
				const monthStr = now.toISOString().slice(0, 7);
				const dateStr = now.toISOString().slice(0, 10);

				ctx.waitUntil(
					Promise.all([
						redis.incr(`usage:total_signups:${org.ownerId}:${monthStr}`),
						redis.hincrby(`stats:${org.orgId}:${dateStr}`, 'signups', 1),
						redis.sadd(`sync:leads:${org.orgId}:${dateStr}`, `${email.toLowerCase()}:::${code}`),
					]),
				);
				return new Response(JSON.stringify({ success: true }), {
					headers: {
						...credentialedCorsHeaders,
						'Content-Type': 'application/json',
						'Set-Cookie': `${cookieName}=${encodeURIComponent(JSON.stringify(updatedCookieData))}; Path=/; HttpOnly; Secure; SameSite=Lax`,
					},
				});
			} catch (e) {
				return new Response('Error', { status: 500, headers: credentialedCorsHeaders });
			}
		}
		if (url.pathname === '/health') {
			const secret = request.headers.get('x-internal-secret');
			if (secret !== env.INTERNAL_SECRET) {
				return new Response('Unauthorized', { status: 401 });
			}

			const type = url.searchParams.get('type');

			if (type === 'sync') {
				// We pass a mock event object to trick the handler
				await handleScheduled({ cron: '*/5 * * * *' }, env);
				return new Response('Sync triggered manually', { status: 200 });
			}

			if (type === 'seed') {
				await handleScheduled({ cron: '0 0 * * *' }, env);
				return new Response('Currency seed triggered manually', { status: 200 });
			}

			return new Response('System Live. Use ?type=sync|seed to test.', { status: 200 });
		}
		const headers = new Headers(request.headers);
		headers.set('host', PRIMARY_HOST);
		headers.set('x-forwarded-host', PRIMARY_HOST);
		headers.set('x-forwarded-proto', 'https');
		const newRequest = new Request(`${VERCEL_ORIGIN}${url.pathname}${url.search}`, {
			method: request.method,
			headers: headers,
			body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
			redirect: 'manual',
		});

		return await fetch(newRequest);
	},
	async scheduled(event: any, env: any, ctx: any) {
		ctx.waitUntil(handleScheduled(event, env));
	},
};
