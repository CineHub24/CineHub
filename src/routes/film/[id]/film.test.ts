import { db } from '$lib/server/db';
import { load } from './+page.server';
import { describe, it, expect, vi } from 'vitest';
import { error } from '@sveltejs/kit';

// Mock der Datenquelle
const mockMovies = [
    {
        id: 123,
        title: 'Sample Movie'
    }
];

const mockShows = [
    {
        id: 1,
        time: '10:00 AM'
    },
    {
        id: 2,
        time: '2:00 PM'
    }
];

// Mock der Datenbankabfragen
vi.mock('$lib/server/db', () => ({
    db: {
        select: vi.fn()
            .mockImplementationOnce(() => ({
                from: () => ({
                    where: () => Promise.resolve([mockMovies[0]])
                })
            }))
            .mockImplementationOnce(() => ({
                from: () => ({
                    where: () => Promise.resolve(mockShows)
                })
            }))
    }
}));

describe('load', () => {
    it('should load movie and shows from the database', async () => {
        const mockUrl = { pathname: '/film/123' };

        const result = await load({ url: mockUrl });

        expect(result.movie).toEqual(mockMovies[0]);
        expect(result.shows).toEqual(mockShows);
    });

    //ToDo: Fix this test

    // it('should throw an error if there is an error in the database query', async () => {
    //     const mockUrl = { pathname: '/film/123' };
    //     const mockError = error(500, 'Internal Server Error DB');

    //     // Mock der Datenbankabfrage, um einen Fehler zu werfen
    //     (db.select as jest.Mock).mockImplementationOnce(() => ({
    //         from: () => ({
    //             where: () => Promise.reject(mockError)
    //         })
    //     }));

    //     await expect(load({ url: mockUrl })).rejects.toThrow(mockError);
    // });
});