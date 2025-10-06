import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import NavBar from './components/NavBar.tsx'
import Home from './pages/Home.tsx'
import Footer from './components/Footer.tsx'
import ProductListing from './pages/ProductListing.tsx'
import ProductPage from './pages/ProductDisplay.tsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <NavBar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/shop' element={<ProductListing />} />
          <Route path='/product' element={<ProductPage />} />
        </Routes>
        <Footer />
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
)
