import { Redis } from '@upstash/redis/cloudflare';
import { RedisLinkMetadata } from './redisLinkMetadata';

const ORG_CACHE: Record<string, { data: RedisLinkMetadata; expiry: number }> = {};
const CACHE_TTL = 5 * 60 * 1000;

export async function getOrgSettings(code: string, redis: Redis): Promise<RedisLinkMetadata | null> {
	const now = Date.now();
	const cached = ORG_CACHE[code];

	if (cached && cached.expiry > now) {
		return cached.data;
	}

	try {
		// 1. Switch from hgetall to get
		const raw = await redis.get(`ref:${code}`);

		if (raw) {
			// 2. Parse the JSON string (Upstash usually auto-parses if configured,
			// but explicit JSON.parse is safer here)
			const data = typeof raw === 'string' ? JSON.parse(raw) : (raw as RedisLinkMetadata);

			if (data && data.orgId) {
				ORG_CACHE[code] = {
					data,
					expiry: now + CACHE_TTL,
				};
				return data;
			}
		}
	} catch (err) {
		console.error('Redis Fetch Error:', err);
	}

	return null;
}
