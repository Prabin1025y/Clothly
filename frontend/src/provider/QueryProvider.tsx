// providers/QueryProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
    const [ queryClient ] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Data stays fresh for 5 minutes
                        staleTime: 5 * 60 * 1000,

                        // Cache inactive data for 10 minutes
                        gcTime: 10 * 60 * 1000,

                        // Retry failed queries twice
                        retry: 2,

                        // Exponential backoff retry delay
                        retryDelay: (attemptIndex) =>
                            Math.min(1000 * 2 ** attemptIndex, 30000),

                        // Only refetch on window focus in production
                        refetchOnWindowFocus: false, //TODO true in production

                        // Do not refetch on mount if cached data is still fresh
                        // refetchOnMount: false,
                    },

                    mutations: {
                        // Retry failed mutations once
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
