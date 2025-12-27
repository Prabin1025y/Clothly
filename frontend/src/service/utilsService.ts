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
