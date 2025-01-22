import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { db } from '$lib/server/db';
import { film, cinema, cinemaHall, priceSet, showing } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';

// Mocking dependencies
vi.mock('$lib/server/db', () => ({
db: {
select: vi.fn().mockReturnValue({
from: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]),
}),
}),
insert: vi.fn().mockReturnValue({
values: vi.fn().mockResolvedValue(undefined),
}),
delete: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue(undefined),
}),
},
}));

vi.mock('@sveltejs/kit', async () => {
const actual = await vi.importActual('@sveltejs/kit');
return {
...actual,
fail: vi.fn((status, data) => ({ status, data })),
};
});

vi.mock('$lib/utils/languageAware.js', () => ({
languageAwareRedirect: vi.fn().mockReturnValue({ status: 302, headers: { Location: '/mock-redirect' } }),
}));

describe('Page Server Functions', () => {
beforeEach(() => {
vi.clearAllMocks();
});

describe('load function', () => {
it('should load film, cinemas, halls, and price sets', async () => {
const mockEvent = { params: { id: '1' } };
const result = await load(mockEvent as any);

expect(db.select).toHaveBeenCalledTimes(4);
expect(result).toHaveProperty('selectedFilm');
expect(result).toHaveProperty('cinemas');
expect(result).toHaveProperty('halls');
expect(result).toHaveProperty('priceSets');
});
});

describe('actions', () => {
    describe('getTimeWindows', () => {
        it('should return available time windows', async () => {
        const mockRequest = {
        formData: vi.fn().mockResolvedValue({
        get: (key: string) => ({
        hallId: '1',
        date: '2023-01-01',
        duration: '120',
        cinemaId: '1',
        }[key]),
        }),
        };
        
        // Mock the cinema query
        vi.mocked(db.select().from().where).mockResolvedValueOnce([{ opentime: '10:00', closeTime: '22:00' }]);
        
        // Mock the existing showings query
        vi.mocked(db.select().from().where).mockResolvedValueOnce([]);
        
        const result = await actions.getTimeWindows({ request: mockRequest } as any);
        
        if ('status' in result && 'data' in result) {
        // If it's an error response
        fail(`Expected success, but got error: ${JSON.stringify(result)}`);
        } else {
        expect(result).toHaveProperty('success', true);
        expect(result).toHaveProperty('timeWindows');
        expect(Array.isArray(result.timeWindows)).toBe(true);
        }
        });
        });

describe('getTimes', () => {
it('should return possible times within a time window', async () => {
const mockRequest = {
formData: vi.fn().mockResolvedValue({
get: (key: string) => ({
windowStart: '10:00',
windowEnd: '22:00',
totalDuration: '120',
}[key]),
}),
};

const result = await actions.getTimes({ request: mockRequest } as any);
expect(result).toHaveProperty('success', true);
expect(result).toHaveProperty('times');
});
});

describe('saveShowing', () => {
it('should save a new showing', async () => {
const mockRequest = {
formData: vi.fn().mockResolvedValue({
get: (key: string) => ({
filmId: '1',
hallId: '1',
startTime: '10:00',
endTime: '12:00',
priceSet: '1',
date: '2023-01-01',
isRecurring: 'false',
}[key]),
}),
};

const result = await actions.saveShowing({ request: mockRequest } as any);
expect(db.insert).toHaveBeenCalled();
expect(result).toHaveProperty('status', 302);
});

it('should handle recurring showings', async () => {
const mockRequest = {
formData: vi.fn().mockResolvedValue({
get: (key: string) => ({
filmId: '1',
hallId: '1',
startTime: '10:00',
endTime: '12:00',
priceSet: '1',
date: '2023-01-01',
isRecurring: 'true',
repeatEvery: '1',
repeatUnit: 'Woche',
endDate: '2023-02-01',
}[key]),
}),
};

vi.mocked(db.select().from().where).mockResolvedValue([]);

const result = await actions.saveShowing({ request: mockRequest } as any);
expect(db.insert).toHaveBeenCalled();
if ('status' in result) {
expect(result.status).toBe(302);
} else {
expect(result).toHaveProperty('success', true);
expect(result).toHaveProperty('conflicts');
expect(result).toHaveProperty('successfulShows');
}
});
});
});
});