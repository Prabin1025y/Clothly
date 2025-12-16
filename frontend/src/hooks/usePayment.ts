import { handleApiError } from "@/lib/axios";
import { paymentServices } from "@/service/paymentService";
import type { GenerateSignatureDto } from "@/type/payment";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useGenerateSignature() {
    return useMutation({
        mutationFn: paymentServices.generateSignature,

        onMutate: async (transactionInfo: GenerateSignatureDto) => {
            return { transactionInfo };
        },

        onError: (error) => {
            toast.error(handleApiError(error));
        }
    })
}