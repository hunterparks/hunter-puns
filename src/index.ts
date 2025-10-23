export default {
	async fetch(_request, _env, _ctx): Promise<Response> {
		const JOKES_URL = 'https://raw.githubusercontent.com/hunterparks/hunter-puns/main/static/jokes.json';
		
		const response = await fetch(JOKES_URL, { cf: { cacheEverything: true, cacheTtl: 300 }});
		if (!response.ok) {
			return new Response('Failed to load jokes', { status: 502 });
		}

		const jokes = await response.json();
		if (!Array.isArray(jokes) || jokes.length < 1) {
			return new Response('No jokes available', { status: 500 });
		}

		const joke = jokes[Math.floor(Math.random() * jokes.length)];
		return new Response(JSON.stringify(joke), {
			headers: {
				'Content-Type': 'application/json; charset=UTF-8',
				'Cache-Control': 'no-store',
			},
		});
	},
} satisfies ExportedHandler<Env>;
