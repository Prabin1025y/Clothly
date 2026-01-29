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
import { Toaster } from "@/components/ui/sonner"
import CheckoutPage from './pages/CheckoutPage.tsx'
import { QueryProvider } from './provider/QueryProvider.tsx'
import OrderSuccessPage from './pages/OrderSuccess.tsx'
import OrderFailedPage from './pages/OrderFailed.tsx'
import OrdersPage from './pages/Orders.tsx'
import ScrollToTop from './components/ScrollToTop.tsx'
import { RequireAdmin } from './components/RequireAdmin.tsx'
import AddProductPage from './pages/admin/AddProduct.tsx'
import EditProductPage from './pages/admin/UpdateProduct.tsx'
import ProductDisplay from './pages/admin/AdminProductDetail.tsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <QueryProvider>
          <NavBar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/shop' element={<ProductListing />} />
            <Route path='/product/:productId' element={<ProductPage />} />
            <Route path='/checkout' element={<CheckoutPage />} />
            <Route path='/order-success' element={<OrderSuccessPage />} />
            <Route path='/orders' element={<OrdersPage />} />
            <Route path='/order-failure' element={<OrderFailedPage />} />
            <Route path="/admin" element={
              // <RequireAdmin>
              <AdminLayout />
              // </RequireAdmin>
            } >
              <Route path='/admin' element={<AdminHome />} />
              <Route path='/admin/products' element={<AdminProducts />} />
              <Route path='/admin/products/new' element={<AddProductPage />} />
              <Route path='/admin/products/edit/:slug' element={<EditProductPage />} />
              <Route path='/admin/products/detail/:slug' element={<ProductDisplay />} />
            </Route>
          </Routes>
          <Link to='/admin'>
            <button className='fixed right-10 bottom-10 p-4 text-secondary bg-foreground rounded-full aspect-square shadow-[0px_0px_35px_-11px_white] cursor-pointer group'>
              <ShieldUser className='group-hover:scale-105' />
            </button>
          </Link>
          <Footer />
          <Toaster richColors position='top-right' theme='light' />
        </QueryProvider>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
)
