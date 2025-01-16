<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import ShowsFilmDropdown from '$lib/components/ShowsFilmDropdown.svelte';
	import AdminShowCalendar from '$lib/components/AdminShowCalendar.svelte';

	let monthlySalesChart: SVGSVGElement;
	let cinemaRevenueChart: SVGSVGElement;
	let movieTicketSalesChart: SVGSVGElement;
	const { data } = $props();
	const {
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

		// Extrahieren Sie das Jahr und den Monat aus dem Datensatz
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

		// X-Achse
		svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));

		// Y-Achse
		svg.append('g').call(d3.axisLeft(y));

		// Balken
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
			.attr('fill', '#4CAF50');

		// Jahr über dem Diagramm
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
		const width = 300;
		const height = 300;
		const radius = Math.min(width, height) / 2;

		const color = d3.scaleOrdinal(d3.schemeCategory10);

		const svg = d3
			.select(cinemaRevenueChart)
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', `translate(${width / 2},${height / 2})`);

		const pie = d3.pie<CinemaData>().value((d) => d.revenue);

		const arc = d3
			.arc<d3.PieArcDatum<CinemaData>>()
			.innerRadius(radius * 0.5)
			.outerRadius(radius);

		const arcs = svg
			.selectAll('arc')
			.data(pie(cinemaRevenue))
			.enter()
			.append('g')
			.attr('class', 'arc');

		arcs
			.append('path')
			.attr('d', arc)
			.attr('fill', (d, i) => color(i.toString()));

		arcs
			.append('text')
			.attr('transform', (d) => `translate(${arc.centroid(d)})`)
			.attr('text-anchor', 'middle')
			.text((d) => d.data.name);
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
			.attr('fill', '#3498db');

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
	const avgTicketPrice = totalRevenue / ticketsSold;

	const calendarEvents = [
		{ date: '2023-05-15', event: 'Premiere: Avengers: Endgame' },
		{ date: '2023-05-18', event: 'Special Screening: The Godfather' },
		{ date: '2023-05-20', event: 'Kids Day: Toy Story Marathon' },
		{ date: '2023-05-25', event: 'Indie Film Festival' },
		{ date: '2023-05-30', event: 'Discount Tuesday' }
	];
</script>

{#if data == null}
	<h1>no data</h1>
{:else}
	<div class="dashboard">
		<header class="header">
			<h1>Cinema Chain Dashboard</h1>
		</header>
		<div class="summary">
			<div class="summary-item">
				<h3>Total Revenue</h3>
				<p class="large">${summaryData.totalRevenue}</p>
			</div>
			<div class="summary-item">
				<h3>Tickets Sold</h3>
				<p class="large">{summaryData.ticketsSold}</p>
			</div>
			<div class="summary-item">
				<h3>Avg. Ticket Price</h3>
				<p class="large">${Number(summaryData.avgTicketPrice).toFixed(2)}</p>
			</div>
			<div class="summary-item">
				<h3>Occupancy Rate</h3>
				<p class="large">{Number(occupancyRate).toFixed(2)}%</p>
			</div>
		</div>

		<div class="charts">
			<div class="chart">
				<h2>Monthly Ticket Sales</h2>
				<svg bind:this={monthlySalesChart}></svg>
			</div>
			<div class="chart">
				<h2>Revenue by Cinema</h2>
				<svg bind:this={cinemaRevenueChart}></svg>
			</div>
		</div>

		<div class="full-width-chart">
			<h2>Ticket Sales by Movie</h2>
			<svg bind:this={movieTicketSalesChart}></svg>
		</div>

		<div class="calendar">
			<AdminShowCalendar {shows} {movies} />
		</div>
	</div>
{/if}

<style>
	:global(body) {
		background-color: #f0f2f5;
		margin: 0;
		padding: 0;
	}

	.dashboard {
		font-family: 'Arial', sans-serif;
		color: #333;
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
	}

	.header {
		background-color: #2c3e50;
		color: white;
		padding: 20px;
		border-radius: 5px;
		margin-bottom: 20px;
	}

	.header h1 {
		margin: 0;
	}

	.summary {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
		margin-bottom: 20px;
	}

	.summary-item {
		background-color: white;
		padding: 20px;
		border-radius: 5px;
		text-align: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.large {
		font-size: 24px;
		font-weight: bold;
		color: #2c3e50;
	}

	.charts {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		margin-bottom: 20px;
	}

	.chart,
	.full-width-chart {
		background-color: white;
		padding: 20px;
		border-radius: 5px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.full-width-chart {
		grid-column: 1 / -1;
	}

	.calendar-events {
		background-color: white;
		padding: 20px;
		border-radius: 5px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.event {
		margin-bottom: 10px;
		padding: 10px;
		background-color: #ecf0f1;
		border-radius: 3px;
	}

	.event-date {
		font-weight: bold;
		margin-right: 10px;
		color: #2c3e50;
	}

	h2 {
		color: #2c3e50;
		border-bottom: 2px solid #ecf0f1;
		padding-bottom: 10px;
	}
</style>
