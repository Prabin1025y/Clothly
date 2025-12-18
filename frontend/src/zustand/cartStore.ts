import { create } from 'zustand'

// Define types for state & actions
interface CartStore {
    cartItemsState: "none" | "updating" | "deleting",
    setCartItemsState: (state: "none" | "updating" | "deleting") => void,
    currentShippingAddressId: number | null
}

// Create store using the curried form of `create`
export const useCartItemStore = create<CartStore>()((set) => ({
    cartItemsState: "none",
    setCartItemsState: (state) => {
        set(() => ({ cartItemsState: state }))
    },
    currentShippingAddressId: null
}))