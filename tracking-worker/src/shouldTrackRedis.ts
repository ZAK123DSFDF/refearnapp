/**
 * Redis-based plan checker for Cloudflare Workers.
 * Replaces the Drizzle-based version to save DB costs and latency.
 */
export function shouldTrackRedis(org: Record<string, string>): boolean {
	// 1. If the hash doesn't exist, don't track
	if (!org || Object.keys(org).length === 0) return false;

	const paymentType = org.paymentType; // "ONE-TIME" or "SUBSCRIPTION"
	const expiresAtRaw = org.expiresAt; // ISO string or "null"

	// 2. Handle ONE-TIME PURCHASE (Always track)
	if (paymentType === 'ONE-TIME') {
		return true;
	}

	// 3. Handle SUBSCRIPTION
	if (paymentType === 'SUBSCRIPTION') {
		// If expiresAt is "null", it's an active sub with no set end date yet
		if (expiresAtRaw === 'null') return true;

		const expiresAt = new Date(expiresAtRaw);
		const isExpired = expiresAt < new Date();

		// FREE, PRO, or ULTIMATE: Only track if not expired
		return !isExpired;
	}

	return false;
}
