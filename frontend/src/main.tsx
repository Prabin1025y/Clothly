import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import NavBar from './components/NavBar.tsx'
import Home from './pages/Home.tsx'
import Footer from './components/Footer.tsx'
import ProductListing from './pages/ProductListing.tsx'
import ProductPage from './pages/ProductDisplay.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/shop' element={<ProductListing />} />
        <Route path='/product' element={<ProductPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
)
