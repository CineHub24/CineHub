// import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
// import { fail, error } from '@sveltejs/kit';
// import { load, actions } from './+page.server';
// import { db } from '$lib/server/db';
// import { priceSet, seatCategory, ticketType } from '$lib/server/db/schema';
// import { eq } from 'drizzle-orm';

// // Create a more robust mock for Drizzle operations
// const createMockDrizzleQuery = <T>(mockResult: T[]) => ({
//     execute: vi.fn().mockResolvedValue(mockResult),
//     where: vi.fn().mockReturnThis(),
//     set: vi.fn().mockReturnThis(),
//     values: vi.fn().mockReturnThis(),
//     orderBy: vi.fn().mockReturnThis(),
//     from: vi.fn().mockReturnThis(),
// });

// // Mock the database and dependencies
// vi.mock('$lib/server/db', () => ({
//     db: {
//         select: vi.fn().mockReturnValue(createMockDrizzleQuery([])),
//         insert: vi.fn().mockReturnValue(createMockDrizzleQuery([])),
//         delete: vi.fn().mockReturnValue(createMockDrizzleQuery([])),
//         update: vi.fn().mockReturnValue(createMockDrizzleQuery([])),
//     }
// }));

// // Mock SvelteKit RequestEvent
// const createMockRequestEvent = (formData: FormData) => ({
//     request: {
//         formData: vi.fn().mockResolvedValue(formData)
//     },
//     cookies: {
//         get: vi.fn(),
//         set: vi.fn()
//     },
//     fetch: vi.fn(),
//     getClientAddress: vi.fn(),
//     locals: {},
//     params: {},
//     route: {},
//     url: new URL('http://localhost'),
//     isDataRequest: false
// });

// describe('Price Set Server Actions', () => {
//     // Restore mocks before each test
//     beforeEach(() => {
//         vi.resetAllMocks();
//     });

//     describe('load function', () => {
//         it('should fetch price sets, seat categories, and ticket types', async () => {
//             // Mock return values for database queries
//             const mockPriceSets = [{ id: 1, name: 'Set 1' }];
//             const mockSeatCategories = [{ id: 1, price: 100 }];
//             const mockTicketTypes = [{ id: 1, name: 'Adult' }];

//             // Setup mock implementations with execute method
//             (db.select as Mock).mockReturnValueOnce({
//                 from: vi.fn().mockReturnValue({
//                     orderBy: vi.fn().mockReturnValue({
//                         execute: vi.fn().mockResolvedValue(mockPriceSets)
//                     })
//                 })
//             });

//             (db.select as Mock).mockReturnValueOnce({
//                 from: vi.fn().mockReturnValue({
//                     orderBy: vi.fn().mockReturnValue({
//                         execute: vi.fn().mockResolvedValue(mockSeatCategories)
//                     })
//                 })
//             });

//             (db.select as Mock).mockReturnValueOnce({
//                 from: vi.fn().mockReturnValue({
//                     orderBy: vi.fn().mockReturnValue({
//                         execute: vi.fn().mockResolvedValue(mockTicketTypes)
//                     })
//                 })
//             });

//             // Call the load function
//             const result = await load({ url: new URL('http://localhost') });

//             // Assertions
//             expect(result).toEqual({
//                 priceSets: mockPriceSets,
//                 seatCategories: mockSeatCategories,
//                 ticketTypes: mockTicketTypes
//             });
//         });
//     });

//     describe('createPriceSet action', () => {
//         it('should create a new price set with valid data', async () => {
//             // Prepare form data
//             const formData = new FormData();
//             formData.append('name', 'Test Set');
//             formData.append('priceFactor', '1.5');
//             formData.append('seatCategoryPrices', '1');
//             formData.append('seatCategoryPrices', '2');
//             formData.append('ticketTypes', '3');
//             formData.append('ticketTypes', '4');

//             // Create mock request event
//             const mockEvent = createMockRequestEvent(formData);

//             // Mock database insert
//             const mockInsert = vi.fn().mockResolvedValue({});
//             (db.insert as Mock).mockReturnValue({
//                 values: mockInsert
//             });

//             // Call the action
//             const result = await actions.createPriceSet(mockEvent);

//             // Assertions
//             expect(result).toBeUndefined();
//             expect(mockInsert).toHaveBeenCalledWith({
//                 name: 'Test Set',
//                 priceFactor: '1.5',
//                 seatCategoryPrices: [1, 2],
//                 ticketTypes: [3, 4]
//             });
//         });

//         it('should fail if required inputs are missing', async () => {
//             // Prepare form data with missing inputs
//             const formData = new FormData();

//             // Create mock request event
//             const mockEvent = createMockRequestEvent(formData);

//             // Call the action
//             const result = await actions.createPriceSet(mockEvent);

//             // Assertions
//             expect(result).toEqual(fail(400, { message: 'Missing inputs' }));
//         });
//     });

//     describe('delete action', () => {
//         it('should delete a price set by id', async () => {
//             // Prepare form data
//             const formData = new FormData();
//             formData.append('priceSetId', '1');

//             // Create mock request event
//             const mockEvent = createMockRequestEvent(formData);

//             // Mock database delete
//             const mockDelete = vi.fn().mockResolvedValue({});
//             (db.delete as Mock).mockReturnValue({
//                 where: mockDelete
//             });

//             // Call the action
//             await actions.delete(mockEvent);

//             // Assertions
//             expect(mockDelete).toHaveBeenCalledWith(eq(priceSet.id, 1));
//         });
//     });

//     describe('updatePriceSet action', () => {
//         it('should update an existing price set', async () => {
//             // Prepare form data
//             const formData = new FormData();
//             formData.append('id', '1');
//             formData.append('name', 'Updated Set');
//             formData.append('priceFactor', '1.2');
//             formData.append('seatCategoryPrices', '1');
//             formData.append('ticketTypes', '2');

//             // Create mock request event
//             const mockEvent = createMockRequestEvent(formData);

//             // Mock database update
//             const mockUpdate = vi.fn().mockReturnValue({
//                 where: vi.fn().mockResolvedValue({})
//             });
//             (db.update as Mock).mockReturnValue({
//                 set: mockUpdate
//             });

//             // Call the action
//             const result = await actions.updatePriceSet(mockEvent);

//             // Assertions
//             expect(mockUpdate).toHaveBeenCalledWith({
//                 name: 'Updated Set', 
//                 priceFactor: '1.2', 
//                 seatCategoryPrices: [1], 
//                 ticketTypes: [2]
//             });
//         });

//         it('should throw an error if required inputs are missing', async () => {
//             // Prepare form data with missing inputs
//             const formData = new FormData();

//             // Create mock request event
//             const mockEvent = createMockRequestEvent(formData);

//             // Call the action and expect an error
//             await expect(actions.updatePriceSet(mockEvent))
//                 .rejects
//                 .toThrow('Missing inputs');
//         });
//     });
// });