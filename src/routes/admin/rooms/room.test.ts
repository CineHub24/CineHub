import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '$lib/server/db';
import { cinemaHall } from '$lib/server/db/schema';
import type { RequestEvent } from '@sveltejs/kit';
import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { load, actions } from './+page.server';

// Mock the database
vi.mock('$lib/server/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn().mockResolvedValue([])
        })),
        delete: vi.fn(() => ({
            where: vi.fn().mockResolvedValue([{ id: 1 }]) // Mock successful deletion
        }))
    }
}));

// Mock both error and fail functions
vi.mock('@sveltejs/kit', () => {
    return {
        error: vi.fn((status, message) => {
            throw { status, message };
        }),
        fail: vi.fn((status, data) => {
            return { status, data };
        }),
        redirect: vi.fn()
    };
});

describe('+page.server.ts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('load function', () => {
        it('should load cinema halls', async () => {
            // Mock data returned from the database
            const mockCinemaHalls = [
                { id: 1, name: 'Hall 1', capacity: 100 },
                { id: 2, name: 'Hall 2', capacity: 200 }
            ];
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockResolvedValueOnce(mockCinemaHalls)
            });

            const result = await load();

            expect(db.select).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ cinemaHalls: mockCinemaHalls });
        });

    });

    describe('actions.deleteCinemaHall', () => {
        const mockRequestEvent = (formData: any): RequestEvent =>
            ({
                request: {
                    formData: () => Promise.resolve(formData)
                },
                locals: {
                    user: { email: 'test@example.com', id: 1 }
                }
            }) as unknown as RequestEvent;

        // it('should delete a cinema hall with a valid hallId', async () => {
        //     const mockFormData = {
        //         get: (key: string) => (key === 'hallId' ? '1' : null)
        //     };

        //     const result = await actions.deleteCinemaHall(mockRequestEvent(mockFormData));

        //     expect(db.delete).toHaveBeenCalledWith(cinemaHall);
        //     expect(db.delete().where).toHaveBeenCalledWith(eq(cinemaHall.id, 1));
        //     expect(result).toEqual({
        //         status: 200,
        //         body: { success: true, message: 'Cinema hall deleted successfully!' }
        //     });
        // });

        it('should handle missing hallId in the form data', async () => {
            const mockFormData = {
                get: () => null
            };

            const result = await actions.deleteCinemaHall(mockRequestEvent(mockFormData));

            expect(result).toEqual({
                status: 500,
                body: { error: new Error('No hall id provided') }
            });
        });

        it('should handle database errors during deletion', async () => {
            vi.mocked(db.delete).mockImplementationOnce(() => {
                throw new Error('Database deletion error');
            });

            const mockFormData = {
                get: (key: string) => (key === 'hallId' ? '1' : null)
            };

            const result = await actions.deleteCinemaHall(mockRequestEvent(mockFormData));

            expect(result).toEqual({
                status: 500,
                body: { error: new Error('Database deletion error') }
            });
        });
    });
});
