import { price } from '$lib/paraglide/messages';
import { sql } from 'drizzle-orm';
import {
	uuid,
	pgTable,
	pgEnum,
	serial,
	text,
	integer,
	timestamp,
	boolean,
	date,
	time,
	decimal,
	jsonb,
	varchar
} from 'drizzle-orm/pg-core';

export const rolesEnum = pgEnum('roles', ['user', 'admin', 'inspector']);

export const ticketStatusEnum = pgEnum('ticketStatus', [
	'reserved',
	'paid',
	'validated',	
	'refunded',
]);

export const discountTypesEnum = pgEnum('discountTypes', [
	'percentage',
	'fixed',
]);

export const user = pgTable('User', {
	id: text('id').primaryKey(),
	googleId: text('google_id').unique(),
	githubId: text('github_id').unique(),
	lastName: text('lastName'),
	firstName: text('firstName'),
	address: text('address'),
	email: text('email').unique(),
	password: text('password'),
	role: rolesEnum('role').default('user').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Film = typeof film.$inferSelect;
export type Showing = typeof showing.$inferSelect;
export type Cinema = typeof cinema.$inferSelect;
export type CinemaHall = typeof cinemaHall.$inferSelect;
export type Seat = typeof seat.$inferSelect;
export type SeatCategory = typeof seatCategory.$inferSelect;
export type PriceSet = typeof priceSet.$inferSelect;
export type TicketType = typeof ticketType.$inferSelect;
export type Ticket = typeof ticket.$inferSelect;

export const film = pgTable('Film', {
	id: serial('id').primaryKey(),
	imdbID: text('imdbID'),
	tmdbID: text('tmdbID'),
	backdrop: text('backdrop'),
	title: text('title'),
	genres: text('genres')
		.array()
		.notNull()
		.default(sql`'{}'::text[]`),
	// Actors: text("actors")
	//   .array()
	//   .notNull()
	//   .default(sql`'{}'::text[]`),
	director: text('director'),
	runtime: integer('runtime'),
	ageRating: text('ageRating'),
	poster: text('poster'),
	description: text('description'),

	year: text('year')
});

// export const filmRelations = relations(film, ({ many }) => ({
// 	showings: many(showing),
// }));

export const showing = pgTable('Showing', {
	id: serial('id').primaryKey(),
	filmid: integer('film_id').references(() => film.id, { onDelete: 'cascade' }),
	hallid: integer('hall_id').references(() => cinemaHall.id, { onDelete: 'cascade' }),
	priceSetId: integer('priceSetId')
		.references(() => priceSet.id)
		.default(sql`'1'::integer`),
	date: date('date').notNull(),
	time: time('time').notNull(),
	endTime: time('endTime'),
	language: text('language'),
	dimension: text('dimension'),
	cancelled: boolean('cancelled').default(false),
	soldTickets: text('soldTickets')
});

export const cinema = pgTable('Cinema', {
	id: serial('id').primaryKey(),
	name: text('name'),
	address: text('address'),
	opentime: time('opentime'),
	closeTime: time('closeTime'),
	numScreens: integer('numScreens')
});

export const cinemaHall = pgTable('CinemaHall', {
	id: serial('id').primaryKey(),
	name: text('name'),
	capacity: integer('capacity'),
	cinemaId: integer('cinemaId')
		.notNull()
		.references(() => cinema.id, { onDelete: 'cascade' })
});

export const seat = pgTable('seat', {
	id: serial('id').primaryKey(),
	seatNumber: text('seatNumber').notNull(),
	row: text('row').notNull(),
	cinemaHall: integer('cinemaHall')
		.notNull()
		.references(() => cinemaHall.id, { onDelete: 'cascade' }),
	categoryId: integer('categoryId')
		.notNull()
		.references(() => seatCategory.id)
});

export const seatCategory = pgTable('seatCategory', {
	id: serial('id').primaryKey(),
	name: text('name'),
	description: text('description'),
	emoji: text('emoji'),
	price: decimal('price', { precision: 10, scale: 2 })
});

export const priceSet = pgTable('PriceSet', {
	id: serial('id').primaryKey(),
	name: text('name'),
	seatCategoryPrices: integer('seatCategoryPrices')
		.array()
		.notNull()
		.default(sql`ARRAY [1,2,3,4,5]`),
	ticketTypes: integer('ticketTypes')
		.array()
		.notNull()
		.default(sql`ARRAY [1,2,3,4,5]`),
	priceFactor: decimal('priceFactor', { precision: 10, scale: 3 }).default(sql`'1'::integer`)
});

export const ticketType = pgTable('TicketType', {
	id: serial('id').primaryKey(),
	name: text('name'),
	description: text('description'),
	factor: decimal('factor', { precision: 10, scale: 3 })
});

export const paymentType = pgTable('PaymentType', {
	id: serial('id').primaryKey(),
	type: text('type'),
	value: integer('value')
});

export const priceDiscount = pgTable('PriceDiscount', {
	id: serial('id').primaryKey(),
	code: text('code').notNull(),
	value: decimal('value', { precision: 10, scale: 2 }).notNull(),
	discountType: discountTypesEnum('discountType').default('percentage').notNull(),
});

export const ticket = pgTable('Ticket', {
	id: serial('id').primaryKey(),
	token: uuid('token').defaultRandom().unique(),
	status: ticketStatusEnum('status').default('reserved').notNull(),
	type: integer('type').references(() => ticketType.id),
	showingId: integer('showingId').references(() => showing.id),
	bookingId: integer('bookingId').references(() => booking.id),
	seatId: integer('seatId').references(() => seat.id),
	price: decimal('price', { precision: 10, scale: 2 })
});

export const booking = pgTable('Booking', {
	id: serial('id').primaryKey(),
	date: date('date'),
	time: time('time'),
	totalPrice: decimal('totalPrice'),
	userId: text('userId').references(() => user.id),
	discount: integer('discount').references(() => priceDiscount.id)
});

export const logs = pgTable('logs', {
	id: serial('id').primaryKey(),
	level: text('level').notNull(), // 'info', 'warn', 'error'
	message: text('message').notNull(),
	metadata: jsonb('metadata').default({}),
	createdAt: timestamp('created_at').defaultNow()
});

export const subscribersNewsletter = pgTable('subscribersNewsletter', {
	id: serial('id').primaryKey(),
	email: text('email').unique()
});
