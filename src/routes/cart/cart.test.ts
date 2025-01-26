import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server'; // Adjust the import path as needed
import { db } from '$lib/server/db';
import * as languageAwareModule from '$lib/utils/languageAware';
import { fail } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

// Mock the database
vi.mock('$lib/server/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    innerJoin: vi.fn(() => ({
                        where: vi.fn()
                    }))
                }))
            }))
        })),
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn()
            }))
        })),
        delete: vi.fn(() => ({
            where: vi.fn()
        }))
    }
}));

// Mock languageAwareRedirect
vi.mock('$lib/utils/languageAware', () => ({
    languageAwareRedirect: vi.fn()
}));

describe('load function', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should redirect if user is not logged in', async () => {
        const mockLocals = { user: null };
        await load({ locals: mockLocals } as any);
        expect(languageAwareModule.languageAwareRedirect).toHaveBeenCalledWith(301, '/login');
    });

    it('should return empty data if no active booking is found', async () => {
        const mockLocals = { user: { id: 1 } };
        vi.mocked(db.select).mockReturnValueOnce({
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue([])
        } as any);

        const result = await load({ locals: mockLocals } as any);
        expect(result).toEqual({
            booking: null,
            tickets: [],
            prices: {
                basePrice: 0,
                discount: null,
                discountedAmount: 0,
                giftCodeAmount: 0,
                vatRate: 0.19,
                vatAmount: 0,
                total: 0
            },
            giftCodes: []
        });
    });

    it('should return booking data, tickets, prices, and gift codes for an active booking', async () => {
        const mockLocals = { user: { id: 1 } };
        const mockBooking = { id: 1, status: 'pending', basePrice: '100', finalPrice: '90', discountValue: '10', items: 2 };
        const mockTickets = [{ ticket: {}, seat: {}, showing: {}, film: {} }];
        const mockGiftCodes = [{ id: 1, amount: 10, description: 'Test Gift Code' }];

        vi.mocked(db.select)
            .mockReturnValueOnce({
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockResolvedValue([mockBooking])
            } as any)
            .mockReturnValueOnce({
                from: vi.fn().mockReturnThis(),
                innerJoin: vi.fn().mockReturnThis(),
                where: vi.fn().mockResolvedValue(mockTickets)
            } as any)
            .mockReturnValueOnce({
                from: vi.fn().mockReturnThis(),
                innerJoin: vi.fn().mockReturnThis(),
                where: vi.fn().mockResolvedValue(mockGiftCodes)
            } as any);

        const result = await load({ locals: mockLocals } as any);
        expect(result).toHaveProperty('booking', mockBooking);
        expect(result).toHaveProperty('tickets', mockTickets);
        expect(result).toHaveProperty('prices');
        expect(result).toHaveProperty('giftCodes', mockGiftCodes);
    });
});

describe('actions', () => {
    describe('discount action', () => {
        it('should apply a valid discount', async () => {
            const mockRequest = {
                formData: vi.fn().mockResolvedValue({
                    get: vi.fn().mockReturnValue('VALIDCODE')
                })
            };
            const mockLocals = { user: { id: 1 } };

            vi.mocked(db.select)
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnThis(),
                    where: vi.fn().mockResolvedValue([{ id: 1 }])
                } as any)
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnThis(),
                    leftJoin: vi.fn().mockReturnThis(),
                    where: vi.fn().mockResolvedValue([{ priceDiscount: { id: 1, value: 10 } }])
                } as any)
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnThis(),
                    innerJoin: vi.fn().mockReturnThis(),
                    where: vi.fn().mockResolvedValue([])
                } as any)
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnThis(),
                    innerJoin: vi.fn().mockReturnThis(),
                    where: vi.fn().mockResolvedValue([])
                } as any);

            const result = await actions.discount({ request: mockRequest, locals: mockLocals } as any);
            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('discount');
            expect(result).toHaveProperty('prices');
        });

        it('should fail if discount is not found', async () => {
            const mockRequest = {
                formData: vi.fn().mockResolvedValue({
                    get: vi.fn().mockReturnValue('INVALIDCODE')
                })
            };
            const mockLocals = { user: { id: 1 } };

            vi.mocked(db.select)
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnThis(),
                    where: vi.fn().mockResolvedValue([{ id: 1 }])
                } as any)
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnThis(),
                    leftJoin: vi.fn().mockReturnThis(),
                    where: vi.fn().mockResolvedValue([])
                } as any);

            const result = await actions.discount({ request: mockRequest, locals: mockLocals } as any);
            expect(result).toEqual(fail(400, { error: m.discount_not_found({}) }));
        });
    });

    describe('delete action', () => {
        it('should delete a ticket', async () => {
            const mockRequest = {
                formData: vi.fn().mockResolvedValue({
                    get: vi.fn().mockImplementation((key) => key === 'ticketId' ? '1' : null)
                })
            };
            const mockLocals = { user: { id: 1 } };

            const result = await actions.delete({ request: mockRequest, locals: mockLocals } as any);
            expect(result).toEqual({ success: `${m.ticket({})} ${m.deleted({})}` });
        });

        it('should delete a gift code', async () => {
            const mockRequest = {
                formData: vi.fn().mockResolvedValue({
                    get: vi.fn().mockImplementation((key) => key === 'giftCodeId' ? '1' : null)
                })
            };
            const mockLocals = { user: { id: 1 } };

            const result = await actions.delete({ request: mockRequest, locals: mockLocals } as any);
            expect(result).toEqual({ success: `${m.gift_code({})} ${m.deleted({})}` });
        });

        it('should fail if no valid ID is provided', async () => {
            const mockRequest = {
                formData: vi.fn().mockResolvedValue({
                    get: vi.fn().mockReturnValue(null)
                })
            };
            const mockLocals = { user: { id: 1 } };

            const result = await actions.delete({ request: mockRequest, locals: mockLocals } as any);
            expect(result).toEqual(fail(400, { error: m.no_valid_id({}) }));
        });
    });
});