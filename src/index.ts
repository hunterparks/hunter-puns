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
				},
			});
		}
		if (url.pathname !== '/api/random') {
			console.log(url.origin);
			return Response.redirect(`${url.origin}/`, 302);
		}
		
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
