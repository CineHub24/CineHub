import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq, gte, ne, sql, desc, asc, or } from 'drizzle-orm';

import type { RowList } from 'postgres';

export const load = async (event) => {
	let preferredCinemaId = event.cookies.get('preferredCinema');

	if (!preferredCinemaId) {
		const cinemas = await db.select().from(table.cinema).orderBy(table.cinema.name);
		let preferredCinemaId = cinemas[0].id;
	}

	const movies = await db.select().from(table.film);

	const shows = await db
		.select()
		.from(table.showing)
		.innerJoin(table.cinemaHall, eq(table.showing.hallid, table.cinemaHall.id))
		.where(
			and(gte(table.showing.date, new Date().toISOString()), ne(table.showing.cancelled, true))
		)
		.orderBy(asc(table.showing.date));

	const showsFiltered = shows.map((show) => show.Showing);
	interface MonthlyTicketSale {
		month: string;
		ticket_count: number;
	}
	// Monthly Ticket Sales
	type PostgresResult = RowList<Record<string, unknown>[]>;

	// Führen Sie die SQL-Abfrage aus
	const monthlyTicketSales: PostgresResult = await db.execute(sql`
    WITH all_months AS (
    SELECT TO_CHAR(date_trunc('month', d), 'YYYY-MM') AS month
    FROM generate_series(
    date_trunc('year', CURRENT_DATE),
    date_trunc('year', CURRENT_DATE) + INTERVAL '11 months',
    INTERVAL '1 month'
    ) d
    ),
    ticket_sales AS (
    SELECT
    TO_CHAR(DATE_TRUNC('month', ${table.ticket.createdAt}), 'YYYY-MM') AS month,
    COUNT(*) AS ticket_count
    FROM ${table.ticket}
    INNER JOIN ${table.showing} ON ${table.ticket.showingId} = ${table.showing.id}
    WHERE (${table.ticket.status} = 'paid'
	OR ${table.ticket.status} = 'validated')
    AND ${table.showing.date} >= DATE_TRUNC('year', CURRENT_DATE)
    GROUP BY TO_CHAR(DATE_TRUNC('month', ${table.ticket.createdAt}), 'YYYY-MM')
    )
    SELECT
    all_months.month,
    COALESCE(ticket_sales.ticket_count, 0) AS ticket_count
    FROM all_months
    LEFT JOIN ticket_sales ON all_months.month = ticket_sales.month
    ORDER BY all_months.month
    `);

	// Funktion zur Konvertierung des Postgres-Ergebnisses in ein Array von MonthlyTicketSale
	function convertToMonthlyTicketSales(result: PostgresResult): MonthlyTicketSale[] {
		return result.map((row) => ({
			month: row.month as string,
			ticket_count: Number(row.ticket_count)
		}));
	}

	// Cinema Revenue
	interface CinemaRevenue {
		name: string;
		revenue: number;
	}
	const cinemaRevenue = await db
		.select({
			name: table.cinema.name,
			revenue: sql<number>`SUM(${table.ticket.price})`
		})
		.from(table.ticket)
		.innerJoin(table.showing, eq(table.ticket.showingId, table.showing.id))
		.innerJoin(table.cinemaHall, eq(table.showing.hallid, table.cinemaHall.id))
		.innerJoin(table.cinema, eq(table.cinemaHall.cinemaId, table.cinema.id))
		.where(
			and(
				or(eq(table.ticket.status, 'paid'),eq(table.ticket.status, 'validated')),								
				gte(table.showing.date, sql`DATE_TRUNC('year', CURRENT_DATE)`)
			)
		)
		.groupBy(table.cinema.id, table.cinema.name)
		.orderBy(desc(sql`SUM(${table.ticket.price})`));

	// Movie Ticket Sales
	const movieTicketSales = await db
		.select({
			title: table.film.title,
			ticketsSold: sql<number>`COUNT(*)`
		})
		.from(table.ticket)
		.innerJoin(table.showing, eq(table.ticket.showingId, table.showing.id))
		.innerJoin(table.film, eq(table.showing.filmid, table.film.id))
		.where(
			and(
				or(eq(table.ticket.status, 'paid'),eq(table.ticket.status, 'validated')),		
				gte(table.showing.date, sql`DATE_TRUNC('month', CURRENT_DATE)`)
			)
		)
		.groupBy(table.film.id, table.film.title)
		.orderBy(desc(sql`COUNT(*)`))
		.limit(5);

	// Summary Data
	const summaryData = await db
		.select({
			totalRevenue: sql<number>`SUM(${table.ticket.price})`,
			ticketsSold: sql<number>`COUNT(*)`,
			avgTicketPrice: sql<number>`AVG(${table.ticket.price})`
		})
		.from(table.ticket)
		.innerJoin(table.showing, eq(table.ticket.showingId, table.showing.id))
		.where(
			and(
				or(eq(table.ticket.status, 'paid'),eq(table.ticket.status, 'validated')),		
				gte(table.showing.date, sql`DATE_TRUNC('month', CURRENT_DATE)`)
			)
		);

	// Occupancy Rate
	const occupancyRate = await db
		.select({
			avgOccupancyRate: sql<number>`AVG(CAST(${table.showing.soldTickets} AS INTEGER) * 100.0 / ${table.cinemaHall.capacity})`
		})
		.from(table.showing)
		.innerJoin(table.cinemaHall, eq(table.showing.hallid, table.cinemaHall.id))
		.where(gte(table.showing.date, sql`DATE_TRUNC('month', CURRENT_DATE)`));

	console.log(occupancyRate[0].avgOccupancyRate);

	const cinemas = await db
		.select()
		.from(table.cinema)
		.orderBy(table.cinema.name);

	const halls = await db.select().from(table.cinemaHall);

	return {
		cinemas,
		halls,
		movies: movies,
		shows: showsFiltered,
		monthlyTicketSales: monthlyTicketSales,
		cinemaRevenue: cinemaRevenue,
		movieTicketSales: movieTicketSales,
		summaryData: summaryData[0],
		occupancyRate: occupancyRate[0].avgOccupancyRate
	};
};
