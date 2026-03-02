import { $ } from 'bun';

async function setup() {
	console.log('\n🌐 Voteflow Tracker: Self-Host Deployment\n');

	// --- STEP 1: AUTH CHECK ---
	console.log('🔑 Checking Cloudflare session...');

	const authOutput = await $`npx wrangler whoami`.quiet().nothrow();
	const combinedOutput = authOutput.stdout.toString() + authOutput.stderr.toString();
	const isActuallyLoggedIn = combinedOutput.includes('Logged in') || /@/.test(combinedOutput);

	if (!isActuallyLoggedIn) {
		console.log('\n  ⚠️  Not logged in to Cloudflare.');
		console.log('  ---------------------------------------------------------');
		console.log('  Due to pnpm isolation, please authenticate manually:');
		console.log('\n  1. Run:  cd apps/tracking-worker');
		console.log('  2. Run:  npx wrangler login');
		console.log('  3. Run:  cd ../..');
		console.log('  4. Then: pnpm deploy:tracker');
		console.log('  ---------------------------------------------------------\n');
		process.exit(1);
	} else {
		console.log(`  ✅ Authenticated.`);
	}

	// --- STEP 2: COLLECT DATA ---
	console.log('\n📝 Configuration:');
	let rawDomain = prompt('Enter domain:');
	const cleanDomain =
		rawDomain
			?.replace(/^https?:\/\//, '')
			.replace(/\/$/, '')
			.toLowerCase() || '';
	const domain = `https://${cleanDomain}`;
	let rawBackend = prompt('Enter Backend URL:');
	const cleanBackend =
		rawBackend
			?.replace(/^https?:\/\//, '')
			.replace(/\/$/, '')
			.toLowerCase() || '';
	const backendUrl = cleanBackend.startsWith('www.') ? cleanBackend : `www.${cleanBackend}`;
	const internalSecret = prompt('INTERNAL_SECRET:');
	const redisUrl = prompt('REDIS_URL:');
	const redisToken = prompt('REDIS_TOKEN:');

	if (!domain || !backendUrl || !internalSecret || !redisUrl || !redisToken) {
		console.error('❌ Error: Missing required values.');
		process.exit(1);
	}
	const workerName = `${cleanDomain.replace(/\./g, '-')}-tracker`;

	// --- STEP 3: DEPLOY ---
	try {
		console.log(`\n📦 Step 1: Deploying Worker Code...`);

		await $`npx wrangler deploy src/index.ts --name ${workerName} --compatibility-date 2024-04-01 --var PRIMARY_HOST:${domain} --var MAIN_APP_URL:${backendUrl} --var IS_SELF_HOSTED:true`;

		console.log(`\n🔒 Step 2: Uploading Secrets...`);

		// Helper function using the 'echo' method you preferred
		const setSecret = async (k, v) => {
			// We use .nothrow() and remove .quiet() temporarily if you need to debug errors here
			await $`echo "${v.trim()}" | npx wrangler secret put ${k} --name ${workerName}`.quiet();
			console.log(`  ✅ ${k} secured.`);
		};

		await setSecret('INTERNAL_SECRET', internalSecret);
		await setSecret('UPSTASH_REDIS_REST_URL', redisUrl);
		await setSecret('UPSTASH_REDIS_REST_TOKEN', redisToken);

		console.log(`\n🎉 SUCCESS! Tracker live at https://${cleanDomain}`);
		console.log(`🔗 Dashboard: https://dash.cloudflare.com/?to=/:account/workers/services/view/${workerName}/production`);
	} catch (e) {
		console.error('\n❌ Deployment failed.');
		console.error(e.stderr?.toString() || e.stdout?.toString() || e.message);
	}
}

setup();
