<script>
	import { dev } from '$app/environment';

	const kinoInfo = {
		name: 'CineHub',
		image: '/lobby.jpeg',
		description:
			'Seit 2020 bringen wir magische Momente auf die große Leinwand. Mit modernster Technik und komfortablen Sitzen bieten wir unseren Besuchern ein unvergessliches Kinoerlebnis.'
	};
	let developers = [
		{
			name: 'Luca Bäck',
			role: 'Developer',
			github: 'https://github.com/luca-baeck'
		},
		{
			name: 'Felix Erhard',
			role: 'Developer',
			github: 'https://github.com/'
		},
		{
			name: 'Johannes Kling',
			role: 'Developer',
			github: 'https://github.com/'
		},
		{
			name: 'Mika Jun',
			role: 'Developer',
			github: 'https://github.com/'
		},
		{
			name: 'Jonathan Wieder',
			role: 'Developer',
			github: 'https://github.com/'
		},
		{
			name: 'Nico Wrede',
			role: 'Developer',
			github: 'https://github.com/'
		}
	];

	developers = [...shuffleArray(developers)];

	function shuffleArray(array) {
		let currentIndex = array.length,
			randomIndex;

		// While there remain elements to shuffle.
		while (currentIndex != 0) {
			// Pick a remaining element.
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}

		return array;
	}
</script>

<div class="about-container">
	<section class="hero">
		<img src={kinoInfo.image} alt={kinoInfo.name} class="hero-image" />
		<div class="hero-content">
			<h1>{kinoInfo.name}</h1>
			<p>{kinoInfo.description}</p>
		</div>
	</section>
	<section class="team">
		<h2>Unser Team</h2>
		<div class="team-grid">
			{#each developers as dev}
				<div class="team-card">
					<div class="badge-container"></div>
					<div class="dev-info flex flex-col items-center justify-center">
						<h3>{dev.name}</h3>
						<p>{dev.role}</p>
						<div class="social-links">
							<a href={dev.github} target="_blank" rel="noopener noreferrer" class="github-link">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path
										d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
									></path>
								</svg> GitHub
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.about-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}
	.hero {
		position: relative;
		margin-bottom: 4rem;
		border-radius: 1rem;
		overflow: hidden;
	}
	.hero-image {
		width: 100%;
		height: 400px;
		object-fit: cover;
	}
	.hero-content {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 2rem;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
		color: white;
	}
	.hero h1 {
		font-size: 2.5rem;
		margin: 0 0 1rem 0;
	}
	.team {
		padding: 2rem 0;
	}
	.team h2 {
		text-align: center;
		margin-bottom: 3rem;
		font-size: 2rem;
		color: #333;
	}
	.team-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
		gap: 2rem;
		padding: 0 1rem;
	}
	.team-card {
		background: white;
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s;
		display: flex;
		align-items: center;
		padding: 1rem;
	}
	.team-card:hover {
		transform: translateY(-5px);
	}
	.badge-container {
		flex-shrink: 0;
		margin-right: 1rem;
	}
	.dev-info {
		flex-grow: 1;
	}
	.dev-info h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		color: #333;
	}
	.dev-info p {
		margin: 0 0 1rem 0;
		color: #666;
	}
	.social-links {
		display: flex;
		align-items: center;
	}
	.github-link {
		display: flex;
		align-items: center;
		color: #666;
		text-decoration: none;
		transition: color 0.2s;
	}
	.github-link:hover {
		color: #333;
	}
	.github-link svg {
		margin-right: 0.5rem;
	}

	@media (max-width: 768px) {
		.hero-content h1 {
			font-size: 2rem;
		}
		.team-grid {
			grid-template-columns: 1fr;
		}
		.team-card {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}
		.badge-container {
			margin-right: 0;
			margin-bottom: 1rem;
		}
	}
</style>
