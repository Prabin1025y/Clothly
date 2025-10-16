import { AnimatedBackground } from '@/components/AnimatedBg'
import { Sidebar } from '@/components/Sidebar'
import { Outlet } from 'react-router'

const AdminLayout = () => {
    return (
        <div className="min-h-screen">
            <AnimatedBackground />
            <div className='flex'>
                <Sidebar />
                <div className='flex-1 p-4'>
                    <Outlet />
                </div>
            </div>
            {/* <Sidebar />
            <Outlet /> */}
        </div>
    )
}

export default AdminLayout