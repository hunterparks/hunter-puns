const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
};

// Format: 'month-day' -> joke id
const FEATURED_JOKES = new Map<string, number>([
	['10-31', 67]
]);

export default {
	async fetch(request, _env, _ctx): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === '/') {
			const year = new Date().getFullYear();
			return new Response(`
				<html>
					<head>
						<meta name= "color-scheme" content = "dark" />
						<title>Hunter Puns API</title>
						<style>
							body {
								box-sizing: border-box;
								display: grid;
								font-family: system-ui, sans-serif;
								font-size: 2rem;
								grid-template-rows: 1fr auto;
								height: 100%;
								margin: 0;
								padding: 0;
							}

							main {
								align-items: center;
								display: flex;
								justify-content: center;

								& div {
									max-width: 50ch;
									text-align: center;
									text-wrap: balance;
								}
							}
									
							footer {
								font-size: 1rem;
								font-style: italic;
								padding-block: 1rem;
								text-align: center;
							}
						</style>
					</head>
					<body>
						<main>
							<div>
								Looks like you've ended up at the wrong spot. Please head over to
								<a href="/api/random">/api/random</a>
								to get a random joke!
							</div>
						</main>
						<footer>
							&copy;${year} Hunter Puns
						</footer>
					</body>
				</html>
			`,
			{
				headers: {
					'Content-Type': 'text/html',
					...corsHeaders,
				},
			});
		}
		if (url.pathname !== '/api/random') {
			return Response.redirect(`${url.origin}/`, 302);
		}
		
		const JOKES_URL = 'https://raw.githubusercontent.com/hunterparks/hunter-puns/main/static/jokes.json';
		
		const response = await fetch(JOKES_URL, { cf: { cacheEverything: true, cacheTtl: 300 }});
		if (!response.ok) {
			return new Response('Failed to load jokes', { status: 502, headers: corsHeaders });
		}

		const jokes = await response.json<Array<{ id: number; setup: string; punchline: string; }>>();
		if (!Array.isArray(jokes) || jokes.length < 1) {
			return new Response('No jokes available', { status: 500, headers: corsHeaders });
		}

		const now = new Date();
		let formattedDate = `${now.getMonth() + 1}-${now.getDate()}`;
		if (request.cf?.timezone) {
			const options = {
				timeZone: request.cf.timezone,
			};
			const formatter = new Intl.DateTimeFormat([], options);
			const formattedParts = formatter.formatToParts(new Date());
			const formattedMonth = formattedParts.find((part) => part.type === 'month')?.value;
			const formattedDay = formattedParts.find((part) => part.type === 'day')?.value;
			if (formattedMonth && formattedDay) {
				formattedDate = `${formattedMonth}-${formattedDay}`;
			}
		}
		
		const featuredJoke = FEATURED_JOKES.get(formattedDate);
		const joke = featuredJoke ? jokes.find((j) => j.id === featuredJoke) : jokes[Math.floor(Math.random() * jokes.length)];
		if (!joke) {
			return new Response('Unable to select joke', { status: 500, headers: corsHeaders });
		}

		return new Response(JSON.stringify(joke), {
			headers: {
				'Content-Type': 'application/json; charset=UTF-8',
				'Cache-Control': 'no-store',
				...corsHeaders,
			},
		});
	},
} satisfies ExportedHandler<Env>;
