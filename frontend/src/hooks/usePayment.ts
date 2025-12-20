import { handleApiError } from "@/lib/axios";
import { paymentServices } from "@/service/paymentService";
import type { GeneralPostResponseType } from "@/type";
import type { GenerateSignatureDto } from "@/type/payment";
import { useMutation, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { orderKeys } from "./useOrders";
import { orderServices } from "@/service/orderService";

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

export function useGetPaymentSuccess(transactionUuid: string) {

    const paymentSuccessQuery = useQuery({
        queryKey: [ "payment-success", transactionUuid ],
        staleTime: "static",
        queryFn: () => paymentServices.getOrderSuccessData(transactionUuid),
        enabled: !!transactionUuid
    });

    const orderQuery = useQuery({
        queryKey: orderKeys.list(transactionUuid),
        queryFn: () => orderServices.getOrderByTransactionId(transactionUuid),
        staleTime: Infinity,
        enabled: !!paymentSuccessQuery.data
    });

    const isLoading =
        paymentSuccessQuery.isLoading ||
        (paymentSuccessQuery.data && orderQuery.isLoading);

    const isError = paymentSuccessQuery.isError || orderQuery.isError;

    const error = paymentSuccessQuery.error || orderQuery.error;

    return {
        data: orderQuery.data,
        isLoading,
        isError,
        error
    }

}