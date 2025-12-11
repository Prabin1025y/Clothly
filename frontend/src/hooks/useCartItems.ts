import { cartItemsServices } from "@/service/cartItemsService";
import { useQuery } from "@tanstack/react-query";

//Fetch all Cart items of a use
export function useCartItems() {
    return useQuery({
        queryKey: [ 'cart-items' ],
        queryFn: () => cartItemsServices.getCartItems(),
        staleTime: 5 * 60 * 1000
    })

}