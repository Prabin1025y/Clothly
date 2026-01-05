import { axiosClient, handleApiError } from "@/lib/axios";
import type { AxiosProgressEvent } from "axios";
import { toast } from "sonner";

export const IMAGE_CONSTRAINTS = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: [ 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif' ],
    ALLOWED_EXTENSIONS: [ '.jpg', '.jpeg', '.png', '.webp', '.gif' ]
} as const;

export const validateImage = (file: File): { valid: boolean, error?: string } => {
    if (!file)
        return { valid: false, error: "No file selected!" }

    if (!IMAGE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as any))
        return { valid: false, error: `Unsupported file type.  Only ${IMAGE_CONSTRAINTS.ALLOWED_EXTENSIONS.join(', ')} are allowed.` }

    if (file.size > IMAGE_CONSTRAINTS.MAX_SIZE)
        return { valid: false, error: `File size too big. Max 5 mb file is allowed.` }

    return { valid: true };
}

export const uploadImage = async (
    file: File,
    onProgress?: (progressPercent: number) => void
) => {
    const validation = validateImage(file);
    if (!validation.valid)
        throw new Error(validation.error);

    const formData = new FormData();
    formData.append("image", file);

    try {
        const { data } = await axiosClient.post(
            "/api/images/disk-upload",
            formData,
            {
                headers: {
                    "Content-Type": 'multipart/form-data'
                },
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const progressPercent = (progressEvent.loaded * 100) / progressEvent.total;
                        onProgress(Math.round(progressPercent))
                    }
                }
            }
        )

        return data;
    } catch (error) {
        console.error(error);
        toast.error(handleApiError(error));
    }
}
