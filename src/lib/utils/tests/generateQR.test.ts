import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateQRCodeBase64 } from '$lib/utils/generateQR';
import QRCode from 'qrcode';

// Mock the QRCode module
vi.mock('qrcode', () => ({
	default: {
		toDataURL: vi.fn()
	}
}));

describe('generateQRCodeBase64', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should generate a QR code as base64 string', async () => {
		const mockQRCode = 'data:image/png;base64,mockQRCodeData';
		(QRCode.toDataURL as jest.Mock).mockResolvedValue(mockQRCode);

		const ticketToken = 'test-ticket-token';
		const result = await generateQRCodeBase64(ticketToken);

		expect(result).toBe(mockQRCode);
		expect(QRCode.toDataURL).toHaveBeenCalledWith(ticketToken, {
			width: 200,
			margin: 2,
			color: {
				dark: '#000000',
				light: '#ffffff'
			}
		});
	});

	it('should throw an error if QR code generation fails', async () => {
		const mockError = new Error('QR code generation failed');
		(QRCode.toDataURL as jest.Mock).mockRejectedValue(mockError);

		const ticketToken = 'test-ticket-token';
		await expect(generateQRCodeBase64(ticketToken)).rejects.toThrow('QR code generation failed');
	});
});
