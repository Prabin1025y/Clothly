import { handleApiError } from "@/lib/axios";
import { cartItemsServices } from "@/service/cartItemsService";
import type { addItemToCartDto, CartItemType, EditCartItemDto, GetCartItemsResponseType } from "@/type/cart";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const cartItemKeys = {
    all: [ 'cart-items' ] as const,

    details: () => [ ...cartItemKeys.all, 'detail' ] as const,
    detail: (cartItemId: string) => [ ...cartItemKeys.details(), cartItemId ] as const,
}

//Fetch all Cart items of a use
export function useCartItems() {
    return useQuery({
        queryKey: cartItemKeys.all,
        queryFn: () => cartItemsServices.getCartItems(),
        staleTime: 5 * 60 * 1000
    })
}

//Add item to cart
export function useAddItemToCart() {
    const queryClient = useQueryClient();
    const { isSignedIn } = useUser();

    return useMutation({
        mutationFn: cartItemsServices.addItemToCart,

        onMutate: async (newItem: addItemToCartDto) => {
            if (!isSignedIn)
                throw new Error("Please sign in first!!");
            await queryClient.cancelQueries({ queryKey: cartItemKeys.all });

            const previousCartItems = queryClient.getQueriesData({ queryKey: cartItemKeys.all });

            //Optimistically add item to cart
            queryClient.setQueriesData<GetCartItemsResponseType>(
                { queryKey: cartItemKeys.all },
                (old) => {
                    if (!old) return old;

                    const optimisticCartItem: CartItemType = {
                        id: Date.now(),
                        added_at: new Date(),
                        updated_at: new Date(),
                        quantity: newItem.quantity,
                        variant_id: Number(newItem.variantId),
                        price_snapshot: newItem.price,
                        product_image_alt_text: newItem.alt_text,
                        product_image_url: newItem.url,
                        product_name: newItem.name,
                        product_slug: newItem.slug
                    }

                    return {
                        ...old,
                        data: {
                            ...old.data,
                            items: [ ...old.data.items, optimisticCartItem ],
                            total_price: (Number(old.data.total_price) + optimisticCartItem.price_snapshot).toString()
                        }
                    };
                }
            );

            toast.info("Item added to cart!");

            return { previousCartItems, newItem }
        },

        onError: (error, _variables, context) => {
            // Rollback to previous data
            if (context?.previousCartItems) {
                context.previousCartItems.forEach(([ queryKey, data ]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast.error(handleApiError(error));
        },

        onSuccess: () => {
            toast.success("success: item added to cart.");
        },

        onSettled: (_data) => {
            queryClient.invalidateQueries({ queryKey: cartItemKeys.all })
        }
    })
}

//Delete a cart item based on variantId
export function useDeleteCartItems() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cartItemsServices.deleteCartItem,

        onMutate: async (variantId: string) => {
            await queryClient.cancelQueries({ queryKey: cartItemKeys.all });

            const previousItemInCart = queryClient.getQueriesData({ queryKey: cartItemKeys.all });

            //Optimistically remove cart item from list.
            queryClient.setQueryData<GetCartItemsResponseType>(cartItemKeys.all, (old) => {
                if (!old) return old;

                const deletedItemPrice = old.data.items.find((value) => value.variant_id === Number(variantId))?.price_snapshot ?? 0

                return {
                    ...old,
                    data: {
                        ...old.data,
                        items: old.data.items.filter(item => item.variant_id !== Number(variantId)),
                        total_price: (Number(old.data.total_price) - deletedItemPrice).toString()
                    }
                };
            });

            return { previousItemInCart, variantId };
        },

        onError: (error, _variables, context) => {
            if (context?.previousItemInCart) {
                context.previousItemInCart.forEach(([ queryKey, data ]) => {
                    queryClient.setQueryData(queryKey, data);
                })
            }
            toast.error(handleApiError(error));
        },

        onSuccess: () => {
            toast.success("Item removed from the cart!!");
        },

        onSettled: (_data) => {
            queryClient.invalidateQueries({ queryKey: cartItemKeys.all });
        }

    })
}

//Get cart item info by its variant id
export function useCartInfoFromVariantId(cartItemId: string) {
    return useQuery({
        queryKey: cartItemKeys.detail(cartItemId),
        queryFn: () => cartItemsServices.getCartInfoByVariantId(cartItemId),
        staleTime: 10 * 60 * 1000
    })
}

//Edit cart item
export function useEditCartItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cartItemsServices.editCartItem,

        onMutate: async (updatedInfo: EditCartItemDto) => {

        }
    })
}