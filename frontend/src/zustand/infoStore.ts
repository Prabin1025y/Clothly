import type { ShippingAddressType } from '@/type/shippingAddress'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Define types for state & actions
interface InfoStore {
    currentShippingAddress: ShippingAddressType | null,
    setCurrentShippingAddress: (address: ShippingAddressType | null) => void
}

// Create store using the curried form of `create`
export const useInfoStore = create<InfoStore>()(
    devtools((set) => ({
        currentShippingAddress: null,
        setCurrentShippingAddress: (address) => {
            set(() => ({ currentShippingAddress: address }))
        },
    }), { name: "infoStore" })
)