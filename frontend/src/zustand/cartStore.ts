import { create } from 'zustand'

export interface CartItem {
    id: number;
    variant_id: number;
    quantity: number;
    price_snapshot: string;
    added_at: string;
    updated_at: string;
}

export interface CartWithItems {
    cart_id: number;
    user_id: number;
    type: string;
    total_price: string;
    cart_created_at: string;
    cart_updated_at: string;
    items: CartItem[];
}

// Define types for state & actions
interface CartStore {
    cartItems: CartWithItems;
    setCartItems: (cartItems: CartWithItems) => void
}

// Create store using the curried form of `create`
export const useBearStore = create<CartStore>()((set) => ({
    cartItems: {} as CartWithItems,
    setCartItems: (cartItems: CartWithItems) => set(() => ({ cartItems }))
}))