// src/lib/utils/generateQR.ts
import QRCode from 'qrcode';

export async function generateQRCodeBase64(ticketToken: string): Promise<string> {
	try {
		const qrCode = await QRCode.toDataURL(ticketToken, {
			width: 200,
			margin: 2,
			color: {
				dark: '#000000',
				light: '#ffffff'
			}
		});
		return qrCode;
	} catch (error) {
		console.error('Fehler bei der QR-Code Generierung:', error);
		throw error;
	}
}
