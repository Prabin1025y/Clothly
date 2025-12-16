import { axiosClient } from "@/lib/axios";
import type { GenerateSignatureDto, GenerateSignatureResponseType } from "@/type/payment";

export const paymentServices = {
    generateSignature: async (transactionInfo: GenerateSignatureDto): Promise<GenerateSignatureResponseType> => {
        const { data } = await axiosClient.post("/api/payment/generate-signature", transactionInfo);
        return data;
    }
}