# VESTA — Imagina. Descobre. Veste.

Interactive MVP prototype of a fashion-discovery platform that connects inspiration (text or image) to products in **nearby physical stores**, with store-level reported availability. Interface in European Portuguese (pt-PT), EUR pricing, Portuguese cities.

> **Prototype notice.** Every brand, store, product, stock level, metric and partnership is fictional. No AI model, retailer API, map provider, auth or payment provider is connected. All simulated features are labelled in the UI and listed in `/sobre`.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build → dist/
npm run preview    # serve the build
```

Requires Node 20+. Uses React 19, TypeScript, Vite 7, Tailwind CSS v4, React Router 7, Lucide icons. No other runtime dependencies.

When deploying the build as a static site, configure an SPA fallback (all routes → `index.html`), because the app uses `BrowserRouter`.

## Screens & routes

| Route | Screen |
|---|---|
| `/` | Discover: editorial hero, search, categories, products available nearby, looks, stores, recommendations, recently viewed |
| `/pesquisar` | Smart search: text description or visual search (inspiration images / upload), filters, results grid, simulated map |
| `/produto/:id` | Product detail: gallery, colours/sizes with availability nearby, store list with status + timestamp + source, looks, similar items, purchase registration |
| `/produto/:id/looks`, `/looks/:id` | Outfit builder: swap/remove/add pieces, budget, alternative combinations, total price, stores to visit, save |
| `/looks` | Editorial looks |
| `/lojas`, `/lojas/:id` | Nearby stores (city + radius 2–50 km, list/map), store detail with hours, directions, products by status |
| `/guardados` | Wishlist: items, looks, side-by-side comparison |
| `/guarda-roupa` | Digital wardrobe with category filters and manual items (optional photo) |
| `/compras` | Purchase history (“Registar compra”) |
| `/perfil`, `/entrar` | Profile and preferences, simulated sign-in/registration |
| `/premium`, `/premium/mystery-box` | VESTA+ plans (€4.99/mo, €47.90/yr) and Mystery Box, both simulated |
| `/parceiros` | Retailer partner portal (demonstration analytics) |
| `/sobre` | What is simulated |

## Architecture

```
src/
  config/brand.ts        provisional brand name and tagline (rename here)
  i18n/                  pt-PT + es-ES UI strings (chrome only for now)
  data/                  mock entities: products (37), brands (9), stores (11),
                         inventory (generated), outfits (9), plans, inspirations
  services/
    inventory.ts         availability rules and status model
    search/              SearchEngine interface, rule-based engine, URL query codec, visual search
    outfits.ts           rule-based outfit composer
    stores.ts, geo.ts    opening hours, distance, directions links
    adapters.ts          integration interfaces for production providers
  state/                 app state persisted to localStorage, toasts
  components/            design-system primitives and product components
  pages/                 screens
```

**Inventory model.** Each record is `productId × storeId × size × colour` and carries `status`, `quantity`, `lastUpdatedAt`, `source` and `verification`. Shown statuses are *Disponível segundo a loja*, *Últimas unidades*, *Disponibilidade por confirmar* and *Sem stock nesta loja*. A positive record older than 72 h is shown as *por confirmar*, never as available.

**Search.** `services/search/ruleEngine.ts` implements `SearchEngine` and pulls category, colour, style, budget, size, city and “available now” out of pt-PT text using a transparent vocabulary in `data/taxonomy.ts`. When few results match exactly, it relaxes colour and price and shows the extra items separately. The full query lives in the URL, so it survives back navigation and can be shared. An embedding/LLM service can replace the engine behind the same interface.

**Visual search.** Inspiration images come with pre-annotated attributes. For uploaded photos, only the dominant colours are analysed, on-device with `<canvas>`, and the user picks the garment type. Images never leave the browser.

**Persistence.** Favourites, wardrobe, purchases, saved looks, preferences, subscription and location are stored in `localStorage` (`vesta:state:v1`). Use *Perfil → Repor dados de demonstração* to reset them.

**Images.** Editorial and product photos load from the Unsplash CDN (all listed in `data/images.ts`). If one fails to load, it is replaced by a tinted line illustration of the garment.

## Simulated vs. required integrations

| Simulated now | Needed for production |
|---|---|
| Fictional catalogue & stores | Retailer product feeds (Merchant XML, Shopify/WooCommerce, CSV) |
| Generated store inventory | POS/ERP inventory APIs or partner-portal uploads, with freshness SLAs |
| Rule-based NL search | Query understanding (LLM) + embedding retrieval |
| Colour-only image analysis | Visual embedding / garment detection service |
| Illustrative map | Mapbox / Google Maps; directions already deep-link to Google Maps |
| Simulated auth | OIDC provider (e.g. Auth0, Cognito, Supabase Auth) |
| Simulated VESTA+ billing | Stripe / Adyen with SCA; no card data in the client |
| Local analytics no-op | Privacy-first analytics; affiliate attribution (Awin/CJ) |
| localStorage persistence | Backend API + database with user accounts and GDPR tooling |

## Roadmap (prioritised)

1. **Real supply in one city.** Sign 10–20 Lisbon or Porto stores, ingest their catalogues via CSV/partner portal, and add a stock-confirmation workflow and freshness SLAs.
2. **Backend & accounts.** API, database, real auth, server-side wardrobe/favourites, GDPR consent and data export.
3. **Search quality.** LLM query parsing, text/image embeddings, relevance evaluation set in pt-PT.
4. **Maps & reservations.** Real map provider, “reserve to try on” requests to stores, opening hours from partners.
5. **Retailer monetisation.** Partner plans, campaign tooling, attribution through visit codes, and real analytics.
6. **VESTA+.** Payments, price-drop and saved-search alerts (push/email), then the Mystery Box pilot with clear terms.
7. **Spain.** Complete es-ES localisation of content, Madrid/Barcelona supply.
8. **Quality.** Automated E2E tests for the nine core flows, performance budgets, accessibility audit (WCAG 2.2 AA).
