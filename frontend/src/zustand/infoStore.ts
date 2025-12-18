import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Define types for state & actions
interface InfoStore {
    currentShippingAddressId: number | null,
    setCurrentShippingAddressId: (id: number | null) => void
}

// Create store using the curried form of `create`
export const useInfoStore = create<InfoStore>()(
    devtools((set) => ({
        currentShippingAddressId: null,
        setCurrentShippingAddressId: (id) => {
            set(() => ({ currentShippingAddressId: id }))
        },
    }), { name: "infoStore" })
)