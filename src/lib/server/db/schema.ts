
import { description, price } from '$lib/paraglide/messages';

import { timeStamp } from 'console';

import { sql } from 'drizzle-orm';
import { float } from 'drizzle-orm/mysql-core';
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
export const bookingEnum = pgEnum('bookingStatus', ['cart','completed']);
export const ticketStatusEnum = pgEnum('ticketStatus', [
	'reserved',
	'paid',
	'validated',	
	'refunded',
	'payAtCinema'
]);
export const discountTypesEnum = pgEnum('discountType', ['percentage', 'fixed']);

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
export type PriceDiscount = typeof priceDiscount.$inferSelect;
export type PriceDiscountForInsert = typeof priceDiscount.$inferInsert;
export type TicketType = typeof ticketType.$inferSelect;
export type Ticket = typeof ticket.$inferSelect;
export type Booking = typeof booking.$inferSelect;
export type GiftCode = typeof giftCodes.$inferSelect;
export type Discount = typeof priceDiscount.$inferSelect;

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
	soldTickets: integer('soldTickets').default(0),
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
  id: serial("id").primaryKey(),
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
	rotation: decimal('rotation').notNull(),
	top: decimal('top').notNull(),
	left: decimal('left').notNull(),
  cinemaHall: integer('cinemaHall').notNull().references(() => cinemaHall.id, { onDelete: 'cascade' }),
  categoryId: integer('categoryId').notNull().references(() => seatCategory.id),
});

export const seatCategory = pgTable('seatCategory', {
	id: serial('id').primaryKey(),
		createdAt: timestamp('createdAt').defaultNow(),
		name: text('name'),
		description: text('description'),
		color: varchar('color', { length: 7 }).notNull(), // Hex color code like #FF0000
		width: integer('width').notNull().default(40), // Changed from 'size' to 'width'
		height: integer('height').notNull().default(40), // Changed from 'size' to 'height'
		price: decimal('price', { precision: 10, scale: 2 }),
		isActive: boolean('isActive').notNull().default(true),
		customPath: text('customPath')
	});


export const priceSet = pgTable('PriceSet', {
  id: serial('id').primaryKey(),
  name: text('name'),
  seatCategoryPrices: integer("seatCategoryPrices")
    .array()
    .notNull()
    .default(sql`ARRAY [1,2,3,4,5]`),
  ticketTypes: integer('ticketTypes')
    .array()
    .notNull()
    .default(sql`ARRAY [1,2,3,4,5]`),
  priceFactor: decimal('priceFactor', { precision: 10, scale: 3 })
    .default(sql`'1'::integer`)
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
	expiresAt: date('expiresAt'),
	name: text('name')
});

export const ticket = pgTable('Ticket', {
	id: serial('id').primaryKey(),
	token: uuid('token').defaultRandom().unique(),
	status: ticketStatusEnum('status').default('reserved').notNull(),
	type: integer('type').references(() => ticketType.id),
	showingId: integer('showingId').references(() => showing.id),
	bookingId: integer('bookingId').references(() => booking.id),
	seatId: integer('seatId').references(() => seat.id),
	price: decimal('price', { precision: 10, scale: 2 }),
	createdAt: timestamp('createdAt').defaultNow()
});

export const booking = pgTable('Booking', {
	id: serial('id').primaryKey(),
	date: date('date'),
	time: time('time'),
	basePrice: decimal('basePrice'),
	finalPrice: decimal('finalPrice'),
	discountValue: decimal('discountValue'),
	items : integer('items'),
	status: bookingEnum('status').default('cart').notNull(),
  userId: text('userId').references(() => user.id),
  discount: integer('discount').references(() => priceDiscount.id),
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

export const passwordReset = pgTable('passwordReset', {
	id: serial('id').primaryKey(),
	userId: text('userId').references(() => user.id),
	token: uuid('token').defaultRandom().unique(),
	expiresAt: timestamp('expiresAt').notNull()
});
	
export const giftCodes = pgTable('giftCodes', {
	id: serial('id').primaryKey(),
	amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
	description: text('description')
});

export const giftCodesUsed = pgTable('giftCodesUsed', {
	id: serial('id').primaryKey(),
	bookingId: integer('bookingId').references(() => booking.id),
	giftCodeId: integer('giftCodeId').references(() => giftCodes.id),
	priceDiscountId: integer('priceDiscountId').references(() => priceDiscount.id),
	claimed: boolean('claimed').default(false),
	claimedValue: decimal('claimedValue', { precision: 10, scale: 2 })
});
