import { Redis } from '@upstash/redis/cloudflare';

// This stays in the memory of the Cloudflare edge location
const ORG_CACHE: Record<string, { data: any; expiry: number }> = {};
const CACHE_TTL = 5 * 60 * 1000;

export async function getOrgSettings(code: string, redis: Redis) {
	const now = Date.now();
	const cached = ORG_CACHE[code];

	if (cached && cached.expiry > now) {
		return cached.data;
	}

	try {
		const raw = (await redis.hgetall(`ref:${code}`)) as Record<string, any> | null;

		if (raw && raw.orgId) {
			ORG_CACHE[code] = {
				data: raw,
				expiry: now + CACHE_TTL,
			};
			return raw;
		}
	} catch (err) {
		console.error('Redis Fallback Error:', err);
	}

	return null;
}
