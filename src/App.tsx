import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from '@/state/AppState';
import { ToastProvider } from '@/state/Toast';
import { AppShell } from '@/components/layout/AppShell';
import Home from '@/pages/Home';

const Search = lazy(() => import('@/pages/search/Search'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const OutfitBuilder = lazy(() => import('@/pages/OutfitBuilder'));
const Looks = lazy(() => import('@/pages/Looks'));
const Stores = lazy(() => import('@/pages/Stores'));
const StoreDetail = lazy(() => import('@/pages/StoreDetail'));
const Saved = lazy(() => import('@/pages/Saved'));
const Wardrobe = lazy(() => import('@/pages/Wardrobe'));
const Purchases = lazy(() => import('@/pages/Purchases'));
const Profile = lazy(() => import('@/pages/Profile'));
const Auth = lazy(() => import('@/pages/Auth'));
const Premium = lazy(() => import('@/pages/Premium'));
const MysteryBox = lazy(() => import('@/pages/MysteryBox'));
const Partner = lazy(() => import('@/pages/Partner'));
const About = lazy(() => import('@/pages/About'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function Loading() {
  return <div className="mx-auto mt-24 size-6 animate-spin rounded-full border-2 border-line-strong border-t-ink" role="status" aria-label="A carregar" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppStateProvider>
        <ToastProvider>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<Home />} />
                <Route path="pesquisar" element={<Search />} />
                <Route path="produto/:id" element={<ProductDetail />} />
                <Route path="produto/:id/looks" element={<OutfitBuilder />} />
                <Route path="looks" element={<Looks />} />
                <Route path="looks/:outfitId" element={<OutfitBuilder />} />
                <Route path="lojas" element={<Stores />} />
                <Route path="lojas/:id" element={<StoreDetail />} />
                <Route path="guardados" element={<Saved />} />
                <Route path="guarda-roupa" element={<Wardrobe />} />
                <Route path="compras" element={<Purchases />} />
                <Route path="perfil" element={<Profile />} />
                <Route path="entrar" element={<Auth />} />
                <Route path="premium" element={<Premium />} />
                <Route path="premium/mystery-box" element={<MysteryBox />} />
                <Route path="parceiros" element={<Partner />} />
                <Route path="sobre" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </ToastProvider>
      </AppStateProvider>
    </BrowserRouter>
  );
}
