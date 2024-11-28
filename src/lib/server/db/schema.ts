import { pgTable, serial, text, integer, timestamp, boolean, date, time, decimal } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
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
  id: text('id').primaryKey(),
  title: text('title'),
  genre: text('genre'),
  regisseur: text('regisseur'), 
  laufzeit: integer('laufzeit'),
  alterfreigabe: text('alterfreigabe'),
  getVorstellungen: text('getVorstellungen'),
  erstelleVorstellung: text('erstelleVorstellung'),
  getFilm: text('getFilm'),
  getFilmById: text('getFilmById')
});

export const kino = pgTable('Kino', {
  id: text('id').primaryKey(),
  name: text('name'),
  adresse: text('adresse'),
  anzahlSaele: integer('anzahlSaele')
});

export const kinosaal = pgTable('Kinosaal', {
  id: text('id').primaryKey(),
  saalnummer: integer('saalnummer'),
  kapazitaet: integer('kapazitaet'),
  deaktiviereSitz: text('deaktiviereSitz'),
  aktiviereSitz: text('aktiviereSitz'),
  kinoId: text('kinoId')
});

export const preisset = pgTable('Preisset', {
  id: text('id').primaryKey(),
  grundpreisStzKategorie: integer('grundpreisStzKategorie'),
  faktorenTicketarten: integer('faktorenTicketarten'),
  getDefaultPreisset: text('getDefaultPreisset'),
  berechnePreis: text('berechnePreis')
});

export const abschlussart = pgTable('Abschlussart', {
  id: text('id').primaryKey(),
  art: text('art'),
  wert: integer('wert')
});

export const preisabschlag = pgTable('Preisabschlag', {
  id: text('id').primaryKey(),
  code: text('code'), 
  abschlussartId: text('abschlussartId'),
  betragGesPercentsprei: decimal('betragGesPercentsprei'),
  stornierenTicket: boolean('stornierenTicket'),
  storniertGesamt: boolean('storniertGesamt'),
  bezahleBuchung: boolean('bezahleBuchung'),
  terminExportieren: boolean('terminExportieren'),
  erinnereUser: boolean('erinnereUser'),
  staticGetPreisabschlag: text('staticGetPreisabschlag')
});

export const ticket = pgTable('Ticket', {
  id: text('id').primaryKey(),
  zustand: text('zustand'),
  art: text('art'),
  vorstellungsId: text('vorstellungsId'),
  validerern: boolean('validerern'),
  loeschen: boolean('loeschen'),
  stornieren: boolean('stornieren'),
  generierteQRCode: text('generierteQRCode'),
  berechnePreis: text('berechnePreis')
});

export const benutzer = pgTable('Benutzer', {
  id: text('id').primaryKey(),
  name: text('name'),
  vorname: text('vorname'),
  adresse: text('adresse'),
  email: text('email'),
  username: text('username'),
  password: text('password'),
  anmelden: boolean('anmelden'),
  abmelden: boolean('abmelden'),
  registrieren: boolean('registrieren')
});

export const buchung = pgTable('Buchung', {
  id: text('id').primaryKey(),
  datum: date('datum'),
  uhrzeit: time('uhrzeit'),
  gesamtpreis: decimal('gesamtpreis'),
  berechneGesPercentsprei: decimal('berechneGesPercentsprei'),
  stornierenTicket: boolean('stornierenTicket'),
  storniertGesamt: boolean('storniertGesamt'),
  bezahleBuchung: boolean('bezahleBuchung'),
  terminExportieren: boolean('terminExportieren'),
  erinnereUser: boolean('erinnereUser'),
  getPreisabschlag: text('getPreisabschlag'),
  getBezahlmethode: text('getBezahlmethode'),
  benutzerID: text('benutzerID')
});

export const sitzKategorie = pgTable('SitzKategorie', {
  id: text('id').primaryKey(),
  vorne: boolean('vorne'),
  mitte: boolean('mitte'),
  hinten: boolean('hinten'),
  buchbar: boolean('buchbar'),
  premium: boolean('premium')
});

export const zustand = pgTable('Zustand', {
  id: text('id').primaryKey(),
  reserviert: boolean('reserviert'),
  gebucht: boolean('gebucht'),
  validiert: boolean('validiert'), 
  widerrufn: boolean('widerrufn')
});