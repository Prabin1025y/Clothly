import { handleApiError } from "@/lib/axios";
import { paymentServices } from "@/service/paymentService";
import type { GeneralPostResponseType } from "@/type";
import type { GenerateSignatureDto } from "@/type/payment";
import { useMutation, useQuery, type UseQueryOptions } from "@tanstack/react-query";
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

export function useGetPaymentSuccess(transactionUuid: string, options?: Omit<UseQueryOptions<GeneralPostResponseType>, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: [ "payment-success", transactionUuid ],
        staleTime: "static",
        queryFn: () => paymentServices.getOrderSuccessData(transactionUuid),
        enabled: !!transactionUuid
    })
}