<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import AdminShowCalendar from '$lib/components/AdminShowCalendar.svelte';
	import type { Cinema } from '$lib/server/db/schema';
	import * as m from '$lib/paraglide/messages.js';

	let monthlySalesChart: SVGSVGElement;
	let cinemaRevenueChart: SVGSVGElement;
	let movieTicketSalesChart: SVGSVGElement;
	export let data;
	const {
		cinemas,
		movies,
		shows,
		monthlyTicketSales,
		cinemaRevenue,
		movieTicketSales,
		summaryData,
		occupancyRate
	} = data;

	const monthNames = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];

	interface CinemaData {
		name: string | null;
		revenue: number;
	}

	interface MovieData {
		title: string | null;
		ticketsSold: number;
	}

	interface MonthlyTicketSale {
		month: string;
		ticket_count: number;
	}

	onMount(() => {
		createMonthlySalesChart();
		createCinemaRevenueChart();
		createMovieTicketSalesChart();
	});

	function createMonthlySalesChart() {
		const margin = { top: 40, right: 20, bottom: 30, left: 50 };
		const width = 500 - margin.left - margin.right;
		const height = 300 - margin.top - margin.bottom;

		const svg = d3
			.select(monthlySalesChart)
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const data = monthlyTicketSales.map((d) => ({
			...d,
			year: d.month.split('-')[0],
			monthNum: parseInt(d.month.split('-')[1]) - 1
		}));

		const x = d3.scaleBand().range([0, width]).domain(monthNames).padding(0.1);

		const y = d3
			.scaleLinear()
			.range([height, 0])
			.domain([0, d3.max(data, (d) => d.ticket_count) || 0]);

		svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
		svg.append('g').call(d3.axisLeft(y));

		const tooltip = d3
			.select('body')
			.append('div')
			.attr('class', 'tooltip')
			.style('opacity', 0)
			.style('position', 'absolute')
			.style('background-color', 'white')
			.style('border', '1px solid #ddd')
			.style('padding', '10px')
			.style('border-radius', '5px');

		svg
			.selectAll('.bar')
			.data(data)
			.enter()
			.append('rect')
			.attr('class', 'bar')
			.attr('x', (d) => x(monthNames[d.monthNum]) || 0)
			.attr('width', x.bandwidth())
			.attr('y', (d) => y(d.ticket_count))
			.attr('height', (d) => height - y(d.ticket_count))
			.attr('fill', '#4CAF50')
			.on('mouseover', function (event, d) {
				d3.select(this).attr('fill', '#45a049');
				tooltip.transition().duration(200).style('opacity', 0.9);
				tooltip
					.html(`Month: ${monthNames[d.monthNum]}<br/>Tickets: ${d.ticket_count}`)
					.style('left', event.pageX + 10 + 'px')
					.style('top', event.pageY - 28 + 'px');
			})
			.on('mouseout', function () {
				d3.select(this).attr('fill', '#4CAF50');
				tooltip.transition().duration(500).style('opacity', 0);
			});

		svg
			.append('text')
			.attr('x', width / 2)
			.attr('y', -margin.top / 2)
			.attr('text-anchor', 'middle')
			.style('font-size', '16px')
			.style('font-weight', 'bold')
			.text(data[0].year);
	}
	function createCinemaRevenueChart() {
		// Clear previous chart
		d3.select(cinemaRevenueChart).selectAll('*').remove();

		// Get the container dimensions
		const container = d3.select(cinemaRevenueChart.parentNode);
		const containerBox = (container.node() as HTMLElement).getBoundingClientRect();
		const containerWidth = containerBox.width;
		const containerHeight = containerBox.height || containerWidth;

		const margin = { top: 20, right: 120, bottom: 20, left: 20 };
		const width = containerWidth - margin.left - margin.right;
		const height = containerHeight - margin.top - margin.bottom;
		const radius = Math.min(width, height) / 2;

		const svg = d3
			.select(cinemaRevenueChart)
			.attr('width', containerWidth)
			.attr('height', containerHeight)
			.append('g')
			.attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

		const color = d3.scaleOrdinal(d3.schemeCategory10);

		const pie = d3
			.pie<CinemaData>()
			.value((d) => d.revenue)
			.sort(null);

		const arc = d3
			.arc<d3.PieArcDatum<CinemaData>>()
			.innerRadius(radius * 0.5)
			.outerRadius(radius * 0.8);

		const totalRevenue = d3.sum(cinemaRevenue, (d) => d.revenue);

		// Create pie segments
		const arcs = svg
			.selectAll('.arc')
			.data(pie(cinemaRevenue))
			.enter()
			.append('g')
			.attr('class', 'arc');

		arcs
			.append('path')
			.attr('d', arc)
			.attr('fill', (d, i) => color(i.toString()))
			.attr('stroke', 'white')
			.style('stroke-width', '2px')
			.style('opacity', 0.8)
			.on('mouseover', function (event, d) {
				d3.select(this).style('opacity', 1);
				showTooltip(event, d);
			})
			.on('mouseout', function () {
				d3.select(this).style('opacity', 0.8);
				hideTooltip();
			});

		// Create legend
		const legendGroup = svg.append('g').attr('transform', `translate(${radius + 10}, ${-radius})`);

		const legend = legendGroup
			.selectAll('.legend')
			.data(cinemaRevenue)
			.enter()
			.append('g')
			.attr('class', 'legend')
			.attr('transform', (d, i) => `translate(0, ${i * 20})`);

		legend
			.append('rect')
			.attr('width', 18)
			.attr('height', 18)
			.style('fill', (d, i) => color(i.toString()));

		legend
			.append('text')
			.attr('x', 24)
			.attr('y', 9)
			.attr('dy', '.35em')
			.style('font-size', '12px')
			.text((d) => {
				const percentage = ((d.revenue / totalRevenue) * 100).toFixed(1);
				return `${d.name} (${percentage}%)`;
			});

		// Center text
		svg
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('dy', '-0.2em')
			.style('font-size', '16px')
			.style('fill', '#333')
			.text('Total Revenue');

		svg
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('dy', '1em')
			.style('font-size', '24px')
			.style('font-weight', 'bold')
			.style('fill', '#333')
			.text(`$${totalRevenue.toLocaleString()}`);

		// Tooltip
		const tooltip = d3
			.select('body')
			.append('div')
			.attr('class', 'tooltip')
			.style('opacity', 0)
			.style('position', 'absolute')
			.style('background-color', 'white')
			.style('border', '1px solid #ddd')
			.style('padding', '10px')
			.style('border-radius', '5px')
			.style('font-size', '12px');

		function showTooltip(event: MouseEvent, d: d3.PieArcDatum<CinemaData>) {
			tooltip.transition().duration(200).style('opacity', 0.9);
			tooltip
				.html(`Cinema: ${d.data.name}<br/>Revenue: $${d.data.revenue.toLocaleString()}`)
				.style('left', event.pageX + 10 + 'px')
				.style('top', event.pageY - 28 + 'px');
		}

		function hideTooltip() {
			tooltip.transition().duration(500).style('opacity', 0);
		}
	}

	function createMovieTicketSalesChart() {
		const margin = { top: 20, right: 20, bottom: 70, left: 40 };
		const width = 1000 - margin.left - margin.right;
		const height = 300 - margin.top - margin.bottom;

		const svg = d3
			.select(movieTicketSalesChart)
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const x = d3.scaleBand().range([0, width]).padding(0.1);
		const y = d3.scaleLinear().range([height, 0]);

		x.domain(movieTicketSales.filter((d) => d.title !== null).map((d) => d.title!));
		y.domain([0, d3.max(movieTicketSales, (d) => d.ticketsSold) || 0]);

		const tooltip = d3
			.select('body')
			.append('div')
			.attr('class', 'tooltip')
			.style('opacity', 0)
			.style('position', 'absolute')
			.style('background-color', 'white')
			.style('border', '1px solid #ddd')
			.style('padding', '10px')
			.style('border-radius', '5px');

		svg
			.selectAll('.bar')
			.data(movieTicketSales)
			.enter()
			.append('rect')
			.attr('class', 'bar')
			.attr('x', (d) => x(d.title ?? '') || 0)
			.attr('width', x.bandwidth())
			.attr('y', (d) => y(d.ticketsSold))
			.attr('height', (d) => height - y(d.ticketsSold))
			.attr('fill', '#3498db')
			.on('mouseover', function (event, d) {
				d3.select(this).attr('fill', '#2980b9');
				tooltip.transition().duration(200).style('opacity', 0.9);
				tooltip
					.html(`Movie: ${d.title}<br/>Tickets Sold: ${d.ticketsSold}`)
					.style('left', event.pageX + 10 + 'px')
					.style('top', event.pageY - 28 + 'px');
			})
			.on('mouseout', function () {
				d3.select(this).attr('fill', '#3498db');
				tooltip.transition().duration(500).style('opacity', 0);
			});

		svg
			.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x))
			.selectAll('text')
			.attr('transform', 'rotate(-45)')
			.style('text-anchor', 'end');

		svg.append('g').call(d3.axisLeft(y));
	}

	const totalRevenue = cinemaRevenue.reduce((sum, cinema) => sum + cinema.revenue, 0);
	const ticketsSold = movieTicketSales.reduce((sum, movie) => sum + movie.ticketsSold, 0);

	let selectedCinema: Cinema['id'] = cinemas[0]?.CinemaHall.id;

	$: filteredShows = shows.filter((show) => show.hallid === selectedCinema);

	function handleCinemaChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		selectedCinema = parseInt(select.value);
		console.log(selectedCinema);
		console.log(filteredShows);
	}
</script>

{#if data.legth === 0}
	<div class="flex h-screen items-center justify-center">
		<h1 class="text-2xl font-bold text-gray-800">Keine Daten verfügbar</h1>
	</div>
{:else}
	<div class="min-h-screen bg-gray-100 py-8">
		<div class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<header
				class="mb-8 rounded-lg bg-gradient-to-r from-blue-600 via-blue-400 to-white p-6 shadow-lg"
			>
				<h1 class="text-3xl font-bold text-white">CineHub Dashboard</h1>
			</header>

			<div class="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each [{ title: m.total_revenue({}), value: `$${summaryData.totalRevenue}` }, { title: m.ticktets_sold({}), value: summaryData.ticketsSold }, { title: m.avg_ticket_price({}), value: `$${Number(summaryData.avgTicketPrice).toFixed(2)}` }, { title: m.occupancy_rate({}), value: `${Number(occupancyRate).toFixed(2)}%` }] as item}
					<div class="rounded-lg bg-white p-6 shadow-md">
						<h3 class="mb-2 text-sm font-medium text-gray-500">{item.title}</h3>
						<p class="text-2xl font-bold text-gray-900">{item.value}</p>
					</div>
				{/each}
			</div>

			<div class="mb-8 grid gap-6 lg:grid-cols-2">
				<div class="rounded-lg bg-white p-6 shadow-md">
					<h2 class="mb-4 text-xl font-semibold text-gray-800">{m.monthly_ticket_sales({})}</h2>
					<svg bind:this={monthlySalesChart} class="w-full"></svg>
				</div>
				<div class="rounded-lg bg-white p-6 shadow-md">
					<h2 class="mb-4 text-xl font-semibold text-gray-800">{m.revenue_by_cinema({})}</h2>
					<div class="flex h-[300px] w-full justify-center">
						<svg bind:this={cinemaRevenueChart} class="h-full w-full"></svg>
					</div>
				</div>
			</div>

			<div class="mb-8 rounded-lg bg-white p-6 shadow-md">
				<h2 class="mb-4 text-xl font-semibold text-gray-800">{m.ticket_sales_by_movie({})}</h2>
				<svg bind:this={movieTicketSalesChart} class="w-full"></svg>
			</div>

			<div class="rounded-lg bg-white p-6 shadow-md">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-800">{m.show_calendar({})}</h2>
					<div class="relative">
						<select
							on:change={handleCinemaChange}
							class="block w-full appearance-none rounded border border-gray-300 bg-white px-4 py-2 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
						>
							{#each cinemas as cinema}
								<option value={cinema.CinemaHall.id}>{cinema.Cinema.name}</option>
							{/each}
						</select>
						<div
							class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
						></div>
					</div>
				</div>
				<AdminShowCalendar shows={filteredShows} {movies} />
			</div>
		</div>
	</div>
{/if}
