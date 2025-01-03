import { generateQRCodeBase64 } from "$lib/utils/generateQR";

export const load = async ({  }) => {

    const qrCode = await generateQRCodeBase64("1234");

    return {
        code: qrCode
    }
}