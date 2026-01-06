export function beautifyReferrer(rawReferrer: string | undefined): string {
	if (!rawReferrer || rawReferrer === 'direct') return 'direct';

	try {
		const url = new URL(rawReferrer);
		// 1. Get hostname (e.g., l.facebook.com)
		let host = url.hostname.toLowerCase().replace('www.', '');

		// 2. Map known shims to clean names
		const mapping: Record<string, string> = {
			't.co': 'x.com',
			'l.facebook.com': 'facebook.com',
			'lm.facebook.com': 'facebook.com',
			'm.facebook.com': 'facebook.com',
			'lnkd.in': 'linkedin.com',
			'l.instagram.com': 'instagram.com',
			'out.reddit.com': 'reddit.com',
		};

		// 3. Return mapped name or just the root domain (removes /paths)
		return mapping[host] || host;
	} catch {
		// If it's not a full URL, just return it or 'unknown'
		return rawReferrer.includes('://') ? rawReferrer.split('://')[1].split('/')[0] : rawReferrer;
	}
}
