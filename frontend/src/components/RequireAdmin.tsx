import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Loader } from 'lucide-react';
import { type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router'

export function RequireAdmin({ children }: { children: ReactNode }) {
    const navigate = useNavigate()
    const { data, isLoading } = useCurrentUser();

    if (isLoading)
        return (
            <div className='bg-white absolute inset-0 flex items-center justify-center'>
                <Loader className='size-10 text-accent animate-spin' />
            </div>
        )

    if (data?.isAdmin) {
        return <>{children}</>
    }
    else {
        return <Navigate to={"/"} />
    }
}
