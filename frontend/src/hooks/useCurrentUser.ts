import { axiosClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
    return useQuery({
        queryKey: [ 'isAdmin' ],
        queryFn: () => useCurrentUserFn(),
        staleTime: 0,
        retry: 0
    })
}

const useCurrentUserFn = async () => {
    const { data } = await axiosClient.get<{ isAdmin: boolean }>("/api/isAdmin");
    return data;
}