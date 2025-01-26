import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';
import { db } from '$lib/server/db';
import { cinema, cinemaHall, film, showing } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';

// Mock the database
vi.mock('$lib/server/db', () => ({
db: {
select: vi.fn(() => ({
from: vi.fn(() => ({
where: vi.fn(),
orderBy: vi.fn(),
innerJoin: vi.fn(() => ({
where: vi.fn(),
orderBy: vi.fn()
}))
}))
}))
}
}));

describe('load function', () => {
beforeEach(() => {
vi.clearAllMocks();
});

const mockCookies = {
get: vi.fn().mockReturnValue('1') // Mock preferredCinema cookie
};

it('should return movie and shows data when successful', async () => {
const mockMovie = [
{
id: 1,
title: 'Test Movie',
// ... other movie properties
}
];
const mockShows = [
{
id: 1,
date: '2023-06-01',
time: '10:00:00',
endTime: '12:00:00',
filmid: 1,
hallid: 1,
cancelled: false,
hallName: 'Hall 1'
}
];

const mockFilmWhere = vi.fn().mockResolvedValue(mockMovie);
const mockShowingWhere = vi.fn().mockReturnThis();
const mockShowingOrderBy = vi.fn().mockResolvedValue(mockShows);

vi.mocked(db.select).mockImplementation(
() => ({
from: vi.fn().mockImplementation((table) => {
if (table === film) {
return {
where: mockFilmWhere
};
} else if (table === showing) {
return {
innerJoin: vi.fn().mockReturnThis(),
where: mockShowingWhere,
orderBy: mockShowingOrderBy
};
}
return {};
})
}) as any
);

const result = await load({ url: new URL('http://localhost/movies/1'), cookies: mockCookies });

expect(result).toEqual({
movie: mockMovie[0],
shows: mockShows
});

expect(mockFilmWhere).toHaveBeenCalledTimes(1);
expect(mockShowingWhere).toHaveBeenCalledTimes(1);
expect(mockShowingOrderBy).toHaveBeenCalledTimes(1);
});

it('should handle missing preferredCinema cookie', async () => {
const mockCookiesWithoutPreferredCinema = {
get: vi.fn().mockReturnValue(undefined)
};

const mockCinemas = [{ id: 1, name: 'Cinema 1' }];
const mockMovie = [{ id: 1, title: 'Test Movie' }];
const mockShows = [{ id: 1, date: '2023-06-01', time: '10:00:00' }];

vi.mocked(db.select).mockImplementation(
() => ({
from: vi.fn().mockImplementation((table) => {
if (table === cinema) {
return {
orderBy: vi.fn().mockResolvedValue(mockCinemas)
};
} else if (table === film) {
return {
where: vi.fn().mockResolvedValue(mockMovie)
};
} else if (table === showing) {
return {
innerJoin: vi.fn().mockReturnThis(),
where: vi.fn().mockReturnThis(),
orderBy: vi.fn().mockResolvedValue(mockShows)
};
}
return {};
})
}) as any
);

const result = await load({ url: new URL('http://localhost/movies/1'), cookies: mockCookiesWithoutPreferredCinema });

expect(result).toEqual({
movie: mockMovie[0],
shows: mockShows
});
});

it('should return a fail response when an error occurs', async () => {
vi.mocked(db.select).mockImplementation(
() => ({
from: vi.fn().mockImplementation(() => {
throw new Error('Database error');
})
}) as any
);

const result = await load({ url: new URL('http://localhost/movies/1'), cookies: mockCookies });

expect(result).toEqual(fail(500, { error: 'Failed to load film' }));
});

it('should handle invalid id in URL', async () => {
const result = await load({ url: new URL('http://localhost/movies/invalid'), cookies: mockCookies });

expect(result).toEqual(fail(500, { error: 'Failed to load film' }));
});
});