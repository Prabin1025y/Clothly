import type { ModifiedProductVariant, ProductVariant } from "@/type/product";

export function shallowEqual(objA: Record<string, any>, objB: Record<string, any>) {
    if (objA === objB) return true;
    if (!objA || !objB) return false;

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) return false;

    for (let key of keysA) {
        const valA = objA[ key ];
        const valB = objB[ key ];

        // compare primitive values and shallow arrays
        if (Array.isArray(valA) && Array.isArray(valB)) {
            if (valA.length !== valB.length) return false;
            for (let i = 0; i < valA.length; i++) {
                if (valA[ i ] !== valB[ i ]) return false;
            }
        } else if (valA !== valB) {
            return false;
        }
    }

    return true;
}

export const groupProductVariants = (variants: ProductVariant[]): ModifiedProductVariant[] => {
    if (!Array.isArray(variants)) {
        return []
    }

    const map = new Map<
        string,
        { color: string; hex_color: string; sizes: { sku: string; size: string; available: number; variant_id: string }[] }
    >();

    for (const v of variants) {
        if (!map.has(v.color)) {
            map.set(v.color, {
                color: v.color,
                hex_color: v.hex_color,
                sizes: []
            });
        }

        map.get(v.color)!.sizes.push({
            sku: v.sku,
            size: v.size,
            available: v.available,
            variant_id: v.variant_id.toString()
        });
    }

    return Array.from(map.values());
}
