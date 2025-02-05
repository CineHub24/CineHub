<script lang="ts">
	import type { showing } from '$lib/server/db/schema';
	import * as m from '$lib/paraglide/messages.js';

	let { movie, show, url } = $props();
	type Show = typeof showing.$inferSelect;

	function formatShowDetails(show: Show) {
		const timeStr = show.time ? show.time.slice(0, 5) : m.no_time({});
		const endTimeStr = show.endTime ? show.endTime.slice(0, 5) : m.no_time({});
		const languageStr = show.language ? `${show.language}` : '';
		const dimensionStr = show.dimension ? `${show.dimension}` : '';

		return `${timeStr} - ${endTimeStr} ${languageStr} ${dimensionStr}`.trim();
	}
</script>

<a
	href={url}
	class="group block w-40 overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl"
>
	<div class="relative aspect-[2/3] overflow-hidden">
		<img
			src={movie.poster}
			alt={m.movie_poster({ title: movie.title })}
			class="h-full w-full transform object-cover object-center transition-transform duration-300 group-hover:scale-105"
		/>
		<div
			class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
		/>
	</div>

	<div class="space-y-2 p-3">
		<h3 class="truncate text-center font-semibold text-gray-900">
			{movie.title}
		</h3>

		<div class="space-y-1">
			<p class="flex items-center justify-center space-x-1 text-center text-sm text-gray-600">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
						clip-rule="evenodd"
					/>
				</svg>
				<span>{formatShowDetails(show)}</span>
			</p>

			<div class="flex items-center justify-center">
				<span
					class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs ft-medium text-blue-800"
				>
					{m.hall({})}
					{show.hallid}
				</span>
			</div>
		</div>
	</div>
</a>
