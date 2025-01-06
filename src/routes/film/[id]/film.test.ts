import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';
import { db } from '$lib/server/db';
import { film, showing } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';

// Mock the database
vi.mock('$lib/server/db', () => ({
db: {
select: vi.fn(() => ({
from: vi.fn(() => ({
where: vi.fn(),
})),
})),
},
}));

describe('load function', () => {
beforeEach(() => {
vi.clearAllMocks();
});

it('should return movie and shows data when successful', async () => {
const mockMovie = [{
id: 1,
title: 'Test Movie',
imdbID: '1',
tmdbID: '1',
backdrop: "https://image.tmdb.org/t/p/original/8s4h9friP6Ci3adRGahHARVd76E.jpg",
genres: ["Action", "Adventure", "Fantasy"],
director: "James Cameron",
runtime: 162,
ageRating: "PG-13",
poster: "https://image.tmdb.org/t/p/original/8s4h9friP6Ci3adRGahHARVd76E.jpg",
description: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.",
year: '2009',
}];
const mockShows = [{
id: 1,
filmid: 1,
date: '2023-06-01T10:00:00Z',
hallid: 1,
priceSetId: 1,
time: '10:00:00',
endTime: '12:42:00',
language: 'English',
dimension: '2D',
cancelled: false,
soldTickets: 0,
}];

const mockFilmWhere = vi.fn().mockResolvedValue(mockMovie);
const mockShowingWhere = vi.fn().mockReturnThis();
const mockShowingOrderBy = vi.fn().mockResolvedValue(mockShows);

vi.mocked(db.select).mockImplementation(() => ({
from: vi.fn().mockImplementation((table) => ({
where: table === film ? mockFilmWhere : mockShowingWhere,
orderBy: mockShowingOrderBy,
})),
} as any));

const result = await load({ url: new URL('http://localhost/movies/1') });

expect(result).toEqual({
movie: mockMovie[0],
shows: mockShows,
});

expect(mockFilmWhere).toHaveBeenCalledTimes(1);
expect(mockShowingWhere).toHaveBeenCalledTimes(1);
expect(mockShowingOrderBy).toHaveBeenCalledTimes(1);
});

it('should return a fail response when an error occurs', async () => {
vi.mocked(db.select).mockImplementation(() => ({
from: vi.fn().mockImplementation(() => ({
where: vi.fn().mockRejectedValue(new Error('Database error')),
})),
} as any));

const result = await load({ url: new URL('http://localhost/movies/1') });

expect(result).toEqual(fail(500, { error: 'Failed to load film' }));
});

it('should handle invalid id in URL', async () => {
const result = await load({ url: new URL('http://localhost/movies/invalid') });

expect(result).toEqual(fail(500, { error: 'Failed to load film' }));
});
});