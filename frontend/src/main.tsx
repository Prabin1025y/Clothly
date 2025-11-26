import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Route, Routes } from 'react-router'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import NavBar from './components/NavBar.tsx'
import Home from './pages/Home.tsx'
import Footer from './components/Footer.tsx'
import ProductListing from './pages/ProductListing.tsx'
import ProductPage from './pages/ProductDisplay.tsx'
import { ShieldUser } from 'lucide-react'
import AdminHome from './pages/admin/AdminHome.tsx'
import AdminLayout from './pages/admin/AdminLayout.tsx'
import AdminProducts from './pages/admin/AdminProducts.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const queryClient = new QueryClient()

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <QueryClientProvider client={queryClient}>
          <NavBar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/shop' element={<ProductListing />} />
            <Route path='/product/:productId' element={<ProductPage />} />
            <Route path="/admin" element={<AdminLayout />} >
              <Route path='/admin' element={<AdminHome />} />
              <Route path='/admin/products' element={<AdminProducts />} />
            </Route>
          </Routes>
          <Link to='/admin'>
            <button className='fixed right-10 bottom-10 p-4 text-secondary bg-foreground rounded-full aspect-square shadow-[0px_0px_35px_-11px_white] cursor-pointer group'>
              <ShieldUser className='group-hover:scale-105' />
            </button>
          </Link>
          <Footer />
        </QueryClientProvider>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
)
