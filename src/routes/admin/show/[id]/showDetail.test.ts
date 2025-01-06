import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import * as dbModule from '$lib/server/db';
import { showing, film, cinemaHall, priceSet } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';
import { eq, and, ne, or } from 'drizzle-orm';
import { conflictingShowings } from '$lib/utils/timeSlots.js';
import { languageAwareRedirect } from '$lib/utils/languageAware.js';
import { EmailService } from '$lib/utils/emailService';

// Mock the modules
vi.mock('$lib/server/db', () => {
const mockDb = {
select: vi.fn(),
update: vi.fn(),
delete: vi.fn(),
insert: vi.fn(),
};
return { db: mockDb };
});

vi.mock('@sveltejs/kit', () => ({
fail: vi.fn((status, data) => ({ status, data })),
redirect: vi.fn((status, location) => ({ status, location }))
}));

vi.mock('$lib/utils/timeSlots.js', () => ({
conflictingShowings: vi.fn().mockResolvedValue([])
}));

vi.mock('$lib/utils/languageAware.js', () => ({
languageAwareRedirect: vi.fn((status, location) => ({ status, location }))
}));

vi.mock('$lib/utils/emailService', () => ({
EmailService: vi.fn().mockImplementation(() => ({
sendCancelationConfirmation: vi.fn().mockResolvedValue({})
}))
}));

describe('load function', () => {
it('should load show and price sets', async () => {
const mockShow = {
id: 1,
filmId: 1,
hallId: 1,
date: '2023-01-01',
time: '20:00',
endTime: '22:00',
priceSetId: 1,
cancelled: false,
language: 'en',
dimension: '2D',
film: { title: 'Test Movie' },
cinemaHall: { name: 'Hall 1' }
};
const mockPriceSets = [{ id: 1, name: 'Standard' }];

vi.mocked(dbModule.db.select).mockReturnValueOnce({
from: vi.fn().mockReturnValue({
leftJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([mockShow])
})
})
})
} as any);

vi.mocked(dbModule.db.select).mockReturnValueOnce({
from: vi.fn().mockResolvedValue(mockPriceSets)
} as any);

const result = await load({ url: new URL('http://localhost/shows/1') } as any);

expect(result).toEqual({ show: mockShow, priceSets: mockPriceSets });
});
});

describe('actions', () => {
describe('update', () => {
it('should update a showing', async () => {
const mockRequest = {
formData: vi.fn().mockResolvedValue(new Map([
['date', '2023-01-01'],
['time', '20:00'],
['priceSet', '1']
]))
};
const mockUrl = new URL('http://localhost/shows/1');

vi.mocked(dbModule.db.update).mockReturnValue({
set: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([{}])
})
} as any);

await actions.update({ request: mockRequest, url: mockUrl } as any);

expect(dbModule.db.update).toHaveBeenCalledWith(showing);
expect(vi.mocked(dbModule.db.update(showing).set)).toHaveBeenCalledWith({
date: '2023-01-01',
time: '20:00',
priceSetId: '1',
cancelled: false
});
});
});

describe('delete', () => {
it('should delete a showing', async () => {
const mockRequest = {
formData: vi.fn().mockResolvedValue(new Map([['filmId', '1']]))
};
const mockUrl = new URL('http://localhost/shows/1');

vi.mocked(dbModule.db.delete).mockReturnValue({
where: vi.fn().mockResolvedValue([{}])
} as any);

await actions.delete({ request: mockRequest, url: mockUrl } as any);

expect(dbModule.db.delete).toHaveBeenCalledWith(showing);
expect(vi.mocked(dbModule.db.delete(showing).where)).toHaveBeenCalled();
expect(languageAwareRedirect).toHaveBeenCalledWith(302, '/admin/film/1');
});
});

describe('cancel', () => {
it('should cancel a showing', async () => {
const mockRequest = {
formData: vi.fn().mockResolvedValue(new Map([['showId', '1']]))
};

vi.mocked(dbModule.db.update).mockReturnValue({
set: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([{}])
})
} as any);

await actions.cancel({ request: mockRequest } as any);

expect(dbModule.db.update).toHaveBeenCalledWith(showing);
expect(vi.mocked(dbModule.db.update(showing).set)).toHaveBeenCalledWith({ cancelled: true });
});
});

describe('uncancel', () => {
it('should uncancel a showing if no conflicts', async () => {
const mockRequest = {
formData: vi.fn().mockResolvedValue(new Map([
['showId', '1'],
['hallId', '1'],
['date', '2023-01-01'],
['time', '20:00'],
['endTime', '22:00']
]))
};

vi.mocked(dbModule.db.update).mockReturnValue({
set: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([{}])
})
} as any);

await actions.uncancel({ request: mockRequest } as any);

expect(dbModule.db.update).toHaveBeenCalledWith(showing);
expect(vi.mocked(dbModule.db.update(showing).set)).toHaveBeenCalledWith({ cancelled: false });
});
});

// describe('reschedule', () => {
//     it('should reschedule a showing if no conflicts', async () => {
//     const mockRequest = {
//     formData: vi.fn().mockResolvedValue(new Map([
//     ['showId', '1'],
//     ['date', '2023-01-01'],
//     ['time', '20:00'],
//     ['endTime', '22:00'],
//     ['hallId', '1']
//     ]))
//     };
    
//     const mockExistingShow = {
//     id: 1,
//     hallid: 1,
//     date: '2023-01-01',
//     time: '20:00',
//     endTime: '22:00',
//     filmid: 1,
//     priceSetId: 1,
//     cancelled: false,
//     language: 'en',
//     dimension: '2D'
//     };
    
//     const updateMock = vi.fn().mockReturnValue({
//     set: vi.fn().mockReturnValue({
//     where: vi.fn().mockResolvedValue([mockExistingShow])
//     })
//     });
//     vi.mocked(dbModule.db.update).mockImplementation(updateMock);
    
//     const insertMock = vi.fn().mockReturnValue({
//     values: vi.fn().mockReturnValue({
//     returning: vi.fn().mockResolvedValue([{ id: 2 }])
//     })
//     });
//     vi.mocked(dbModule.db.insert).mockImplementation(insertMock);
    
//     const result = await actions.reschedule({ request: mockRequest } as any);
    
//     expect(updateMock).toHaveBeenCalledWith(showing);
//     expect(updateMock().set).toHaveBeenCalledWith(expect.objectContaining({
//     date: '2023-01-01',
//     time: '20:00',
//     endTime: '22:00',
//     hallid: 1,
//     cancelled: false
//     }));
    
//     // Log the calls to understand what's happening
//     console.log('Update mock calls:', updateMock.mock.calls);
//     console.log('Insert mock calls:', insertMock.mock.calls);
    
//     expect(result).toEqual({
//     rescheduled: true,
//     message: m.show_rescheduled({}),
//     newId: expect.any(Number)
//     });
//     });
//     });
// });
});