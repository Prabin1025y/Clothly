import { axiosClient } from "@/lib/axios";
import type { GeneralPostResponseType } from "@/type";
import type { GenerateSignatureDto, GenerateSignatureResponseType } from "@/type/payment";

export const paymentServices = {
    generateSignature: async (transactionInfo: GenerateSignatureDto): Promise<GenerateSignatureResponseType> => {
        const { data } = await axiosClient.post("/api/payment/generate-signature", transactionInfo);
        return data;
    },

    getOrderSuccessData: async (transactionUuid: string): Promise<GeneralPostResponseType> => {
        const { data } = await axiosClient.get(`/api/payment/payment-success/${transactionUuid}`);
        return data;
    }
}