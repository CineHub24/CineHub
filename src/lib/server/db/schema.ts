import { pgTable, pgEnum, text, integer, timestamp, boolean, date, time, decimal } from 'drizzle-orm/pg-core';
import * as t from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum('roles', ['user', 'admin']);

export const user = pgTable('User', {
  id: text('id').primaryKey(),
  googleId: text('google_id').unique(),
  githubId: text('github_id').unique(),
  lastName: text('lastName'),
  firstName: text('firstName'),
  address: text('address'),
  email: text('email').unique(),
  password: text('password'),
  role: rolesEnum("role").default('user').notNull()
//   login: boolean('login'),
//   logout: boolean('logout'),
//   register: boolean('register')
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


export const film = pgTable('Film', {
  id: t.text('id').primaryKey().generatedAlwaysAs(''),
  title: text('title'),
  genre: text('genre'),
  director: text('director'), 
  runtime: integer('runtime'),
  ageRating: text('ageRating'),
  poster: text('poster'),
  description: text('description'),
  releaseDate: date('releaseDate'),
//   getShowings: text('getShowings'),
//   createShowing: text('createShowing'),
//   getFilm: text('getFilm'),
//   getFilmById: text('getFilmById')
});

export const cinema = pgTable('Cinema', {
  id: text('id').primaryKey(),
  name: text('name'),
  address: text('address'),
  numScreens: integer('numScreens')
});

export const cinemaHall = pgTable('CinemaHall', {
  id: text('id').primaryKey(),
  hallNumber: integer('hallNumber'),
  capacity: integer('capacity'),
  deactivatedSeats: text('deactivatedSeats'),
  activatedSeats: text('activatedSeats'),
  cinemaId: text('cinemaId')
    .notNull()
    .references(() => cinema.id)  // Add this line
});

export const priceSet = pgTable('PriceSet', {
  id: text('id').primaryKey(),
  basePricePerCategory: integer('basePricePerCategory'),
  ticketTypeFactor: integer('ticketTypeFactor'),
  getDefaultPriceSet: text('getDefaultPriceSet'),
  calculatePrice: text('calculatePrice')
});

export const paymentType = pgTable('PaymentType', {
  id: text('id').primaryKey(),
  type: text('type'),
  value: integer('value')
});

export const priceDiscount = pgTable('PriceDiscount', {
  id: text('id').primaryKey(),
  code: text('code'), 
  paymentTypeId: text('paymentTypeId'),
  totalAmountPercentage: decimal('totalAmountPercentage'),
  cancelTicket: boolean('cancelTicket'),
  cancelTotal: boolean('cancelTotal'),
  payBooking: boolean('payBooking'),
  exportTerminal: boolean('exportTerminal'),
  remindUser: boolean('remindUser'),
  staticGetPriceDiscount: text('staticGetPriceDiscount')
});

export const ticket = pgTable('Ticket', {
  id: text('id').primaryKey(),
  status: text('status'),
  type: text('type'),
  showingId: text('showingId'),
  validate: boolean('validate'),
  delete: boolean('delete'),
  cancel: boolean('cancel'),
  generatedQRCode: text('generatedQRCode'),
  calculatePrice: text('calculatePrice')
});

export const booking = pgTable('Booking', {
  id: text('id').primaryKey(),
  date: date('date'),
  time: time('time'),
  totalPrice: decimal('totalPrice'),
  calculateTotalPercentagePrice: decimal('calculateTotalPercentagePrice'),
  cancelTicket: boolean('cancelTicket'),
  cancelTotal: boolean('cancelTotal'),
  payBooking: boolean('payBooking'),
  exportTerminal: boolean('exportTerminal'),
  remindUser: boolean('remindUser'),
  getPriceDiscount: text('getPriceDiscount'),
  getPaymentMethod: text('getPaymentMethod'),
  userId: text('userId')
});

export const seatCategory = pgTable('SeatCategory', {
  id: text('id').primaryKey(),
  front: boolean('front'),
  middle: boolean('middle'),
  rear: boolean('rear'),
  bookable: boolean('bookable'),
  premium: boolean('premium')
});

export const status = pgTable('Status', {
  id: text('id').primaryKey(),
  reserved: boolean('reserved'),
  booked: boolean('booked'),
  validated: boolean('validated'), 
  cancelled: boolean('cancelled')
});