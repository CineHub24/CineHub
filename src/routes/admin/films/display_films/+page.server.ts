// src/routes/films/+page.server.ts
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

export const load = async () => {
    const films = await db.select({
        id: table.film.id,
        title: table.film.title,
        genre: table.film.genre,
        director: table.film.director,
        poster: table.film.poster,
    }).from(table.film);

    return { films };
};