import { handleApiError } from "@/lib/axios";
import { cartItemsServices } from "@/service/cartItemsService";
import type { addItemToCartDto, CartItemType, EditCartItemDto, GetCartItemDetailResponseType, GetCartItemsResponseType } from "@/type/cart";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const cartItemKeys = {
    all: [ 'cart-items' ] as const,

    lists: () => [ ...cartItemKeys.all, 'list' ] as const,

    details: () => [ ...cartItemKeys.all, 'detail' ] as const,
    detail: (cartItemId: string) => [ ...cartItemKeys.details(), cartItemId ] as const,
}

//Fetch all Cart items of a use
export function useCartItems() {
    return useQuery({
        queryKey: cartItemKeys.lists(),
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
            await queryClient.cancelQueries({ queryKey: cartItemKeys.lists() });

            const previousCartItems = queryClient.getQueriesData({ queryKey: cartItemKeys.lists() });

            //Optimistically add item to cart
            queryClient.setQueriesData<GetCartItemsResponseType>(
                { queryKey: cartItemKeys.lists() },
                (old) => {
                    if (!old) return old;
                    console.log(old)

                    const optimisticCartItem: CartItemType = {
                        cart_item_id: Date.now(),
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
                            total_price: (Number(old.data.total_price) + optimisticCartItem.price_snapshot * optimisticCartItem.quantity).toString()
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
            queryClient.invalidateQueries({ queryKey: cartItemKeys.lists() })
        }
    })
}

//Delete a cart item based on variantId
export function useDeleteCartItems() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cartItemsServices.deleteCartItem,

        onMutate: async (variantId: string) => {
            await queryClient.cancelQueries({ queryKey: cartItemKeys.lists() });

            const previousItemInCart = queryClient.getQueriesData({ queryKey: cartItemKeys.lists() });

            //Optimistically remove cart item from list.
            queryClient.setQueryData<GetCartItemsResponseType>(cartItemKeys.lists(), (old) => {
                if (!old) return old;

                const deletedItem = old.data.items.find((value) => value.variant_id === Number(variantId))
                const deletedItemPrice = (deletedItem?.price_snapshot ?? 0) * (deletedItem?.quantity ?? 0)

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
            queryClient.invalidateQueries({ queryKey: cartItemKeys.lists() });
        }

    })
}

//Get cart item info by its variant id
export function useCartItemDetail(cartItemId: string) {
    return useQuery({
        queryKey: cartItemKeys.detail(cartItemId),
        queryFn: () => cartItemsServices.getCartItemDetail(cartItemId),
        staleTime: 10 * 60 * 1000,
        enabled: cartItemId !== "-1"
    })
}

//Edit cart item
export function useEditCartItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cartItemsServices.editCartItem,

        onMutate: async (updatedInfo: EditCartItemDto) => {
            const cartItemId = updatedInfo.cart_item_id.toString();
            await queryClient.cancelQueries({ queryKey: cartItemKeys.detail(cartItemId) });

            const previousCartItemDetail = queryClient.getQueriesData({ queryKey: cartItemKeys.detail(cartItemId) });

            //Optimistically edit cart item info and cartItems as well.
            queryClient.setQueriesData<GetCartItemDetailResponseType>(
                { queryKey: cartItemKeys.detail(cartItemId) },
                (old) => {
                    if (!old) return old;

                    return {
                        ...old,
                        cart_quantity: updatedInfo.quantity,
                        variant_id: updatedInfo.variant_id.toString(),
                        color: updatedInfo.color,
                        size: updatedInfo.size,
                    };
                }
            );

            queryClient.setQueriesData<GetCartItemsResponseType>(
                { queryKey: cartItemKeys.lists() },
                (old) => {
                    if (!old) return old;

                    console.log("old", old);
                    let oldItemQuantity: number = 0;
                    const itemsArrayModified: CartItemType[] = old?.data?.items.map(item => {
                        if (item.variant_id === updatedInfo.old_variant_id) {
                            oldItemQuantity = item.quantity;
                            return {
                                ...item,
                                quantity: updatedInfo.quantity,
                                updated_at: new Date(),
                                variant_id: updatedInfo.variant_id
                            };
                        }
                        else {
                            return item;
                        }
                    })

                    return {
                        ...old,
                        data: {
                            ...old.data,
                            items: itemsArrayModified,
                            total_price: (Number(old.data.total_price) - (oldItemQuantity * updatedInfo.current_price) + (updatedInfo.quantity * updatedInfo.current_price)).toFixed(2)
                        }
                    }
                }
            )

            toast.info("Edit in progress!!");

            return { previousCartItemDetail, updatedInfo };
        },

        onError: (error, _variables, context) => {
            if (context?.previousCartItemDetail) {
                context.previousCartItemDetail.forEach(([ queryKey, data ]) => {
                    queryClient.setQueryData(queryKey, data);
                })
            }

            toast.error(handleApiError(error));
        },

        onSuccess: () => {
            toast.success("Edit Successful!");
        },

        onSettled: (_data, _error, _variables, onMutateResult) => {
            if (onMutateResult?.updatedInfo.cart_item_id)
                queryClient.invalidateQueries({ queryKey: cartItemKeys.detail(onMutateResult?.updatedInfo.cart_item_id.toString()) })

            queryClient.invalidateQueries({ queryKey: cartItemKeys.lists() })
        }
    })
}