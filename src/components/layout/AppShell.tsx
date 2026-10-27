import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { Compass, Search, Heart, Shirt, User, MapPin, ChevronDown, Sparkles } from 'lucide-react';
import { useApp } from '@/state/AppState';
import { BRAND } from '@/config/brand';
import { cx } from '@/lib/format';
import { LocationSheet } from '../product/LocationSheet';
import { Logo } from './Logo';

export function AppShell() {
  const { t } = useApp();
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const items = [
    { to: '/', label: t.nav.discover, icon: Compass, end: true },
    { to: '/pesquisar', label: t.nav.search, icon: Search },
    { to: '/guardados', label: t.nav.saved, icon: Heart },
    { to: '/guarda-roupa', label: t.nav.wardrobe, icon: Shirt },
    { to: '/perfil', label: t.nav.profile, icon: User },
  ];

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[80] focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-ivory">
        Saltar para o conteúdo
      </a>
      <DesktopNav />
      <main id="main" className="pb-[calc(84px+env(safe-area-inset-bottom))] lg:pb-16">
        <Outlet />
      </main>
      <Footer />
      <nav aria-label="Navegação principal" className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-line bg-ivory/95 shadow-nav backdrop-blur lg:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-5 px-2 pt-1.5 pb-1">
          {items.map(({ to, label, icon: Icon, end }) => {
            const isSearch = to === '/pesquisar';
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cx('flex flex-col items-center gap-0.5 rounded-md py-1.5 text-[10.5px] font-medium transition-colors', isActive ? 'text-ink' : 'text-muted')
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={cx('grid h-8 w-12 place-items-center rounded-chip transition-colors', isSearch ? (isActive ? 'bg-clay text-white' : 'bg-ink text-ivory') : isActive && 'bg-ink/[0.06]')}>
                        <Icon size={19} strokeWidth={isActive ? 2.1 : 1.7} />
                      </span>
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function DesktopNav() {
  const { t, originLabel, state, isPlus } = useApp();
  const [locOpen, setLocOpen] = useState(false);
  const links = [
    { to: '/', label: t.nav.discover, end: true },
    { to: '/pesquisar', label: t.nav.search },
    { to: '/lojas', label: t.nav.stores },
    { to: '/looks', label: t.nav.looks },
    { to: '/guardados', label: t.nav.saved },
    { to: '/guarda-roupa', label: t.nav.wardrobe },
  ];
  return (
    <header className="sticky top-0 z-40 hidden border-b border-line bg-ivory/90 backdrop-blur lg:block">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center gap-8 px-8">
        <Link to="/" aria-label={`${BRAND.name} — início`}>
          <Logo />
        </Link>
        <nav aria-label="Navegação principal" className="flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => cx('rounded-chip px-3 py-1.5 text-[14px] transition-colors', isActive ? 'bg-ink/[0.06] font-semibold text-ink' : 'text-ink-soft hover:text-ink')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setLocOpen(true)} className="flex h-9 items-center gap-1.5 rounded-chip border border-line-strong bg-paper px-3 text-[13px] hover:border-ink">
            <MapPin size={14} /> {originLabel} · {state.location.radiusKm} km <ChevronDown size={14} />
          </button>
          <NavLink to="/premium" className="flex h-9 items-center gap-1.5 rounded-chip px-3 text-[13px] font-semibold text-clay-deep hover:bg-clay-soft">
            <Sparkles size={14} /> {isPlus ? 'VESTA+ ativo' : 'VESTA+'}
          </NavLink>
          <NavLink to="/perfil" aria-label={t.nav.profile} className="grid size-9 place-items-center rounded-full bg-sage-soft font-display text-[15px] text-ink hover:bg-sage">
            {state.profile.name.charAt(0)}
          </NavLink>
        </div>
      </div>
      <LocationSheet open={locOpen} onClose={() => setLocOpen(false)} />
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-paper/50 px-4 pt-10 pb-[calc(100px+env(safe-area-inset-bottom))] text-[13px] text-muted md:px-8 lg:pb-10">
      <div className="mx-auto grid max-w-[1360px] gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs font-display text-lg text-ink italic">{BRAND.promise['pt-PT']}</p>
          <p className="max-w-sm text-xs leading-relaxed">
            Protótipo de demonstração. Lojas, marcas, produtos e níveis de stock são fictícios e não representam parcerias comerciais reais.
          </p>
        </div>
        <FooterCol title="Explorar" links={[['/', 'Descobrir'], ['/pesquisar', 'Pesquisar'], ['/lojas', 'Lojas perto de ti'], ['/looks', 'Looks']]} />
        <FooterCol title="A tua conta" links={[['/guardados', 'Guardados'], ['/guarda-roupa', 'Guarda-roupa'], ['/compras', 'Compras registadas'], ['/perfil', 'Perfil']]} />
        <FooterCol title="VESTA" links={[['/premium', 'VESTA+'], ['/premium/mystery-box', 'Mystery Box'], ['/parceiros', 'Para lojas parceiras'], ['/sobre', 'Sobre o protótipo']]} />
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow mb-3">{title}</p>
      <ul className="space-y-2">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="hover:text-ink">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
