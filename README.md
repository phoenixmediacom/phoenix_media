# Phoenix Media

Full public website + admin dashboard for a cinematic production company, built per `DESIGN.md` ("Dark Obsidian Cinema").

## Setup

```
npm install
npm run dev
```

Admin dashboard: `/admin/login`
Demo credentials: `admin@phoenixmedia.com` / `phoenix2026`

## Scripts

- `npm run dev` — local dev server
- `npm run build` — type-check + production build
- `npm test` — runs the test suite (type-check, real render tests, admin auth flow, portfolio detail rendering)

## Architecture




```
phoenix_media
├─ index.html
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  ├─ logo.png
│  └─ phoenix-logo.svg
├─ README.md
├─ src
│  ├─ admin
│  │  ├─ components
│  │  │  ├─ GalleryItemsEditor.tsx
│  │  │  ├─ LogoCollectionAdmin.tsx
│  │  │  └─ PortfolioSectionEditor.tsx
│  │  ├─ layout
│  │  │  ├─ AdminLayout.tsx
│  │  │  ├─ AuthGuard.tsx
│  │  │  └─ Sidebar.tsx
│  │  └─ pages
│  │     ├─ AboutAdminPage.tsx
│  │     ├─ auth
│  │     │  ├─ AuthLayout.tsx
│  │     │  ├─ ForgotPasswordPage.tsx
│  │     │  ├─ LoginPage.tsx
│  │     │  └─ ResetPasswordPage.tsx
│  │     ├─ ClientsAdminPage.tsx
│  │     ├─ ContactAdminPage.tsx
│  │     ├─ DashboardPage.tsx
│  │     ├─ EquipmentAdminPage.tsx
│  │     ├─ HeroAdminPage.tsx
│  │     ├─ LanguageAdminPage.tsx
│  │     ├─ PortfolioAdminEditPage.tsx
│  │     ├─ PortfolioAdminListPage.tsx
│  │     ├─ SeoAdminPage.tsx
│  │     ├─ ServicesAdminPage.tsx
│  │     ├─ SettingsAdminPage.tsx
│  │     └─ SocialAdminPage.tsx
│  ├─ App.tsx
│  ├─ components
│  │  ├─ backgrounds
│  │  │  ├─ Lightfall.css
│  │  │  ├─ Lightfall.tsx
│  │  │  └─ Prism.tsx
│  │  ├─ layout
│  │  │  ├─ HeroProgressContext.tsx
│  │  │  ├─ LanguageSwitch.tsx
│  │  │  ├─ Nav.tsx
│  │  │  ├─ Section.tsx
│  │  │  ├─ SeoHead.tsx
│  │  │  ├─ SocialIcon.tsx
│  │  │  └─ SocialIcons.tsx
│  │  └─ ui
│  │     ├─ AsyncStates.tsx
│  │     ├─ Button.tsx
│  │     ├─ Card.tsx
│  │     ├─ Form.tsx
│  │     ├─ LogoLoop.tsx
│  │     ├─ MediaUploader.tsx
│  │     ├─ Modal.tsx
│  │     └─ ReorderList.tsx
│  ├─ hooks
│  │  ├─ useAsync.ts
│  │  ├─ useIdleTimer.ts
│  │  └─ useScrollProgress.ts
│  ├─ i18n
│  │  ├─ ar.ts
│  │  ├─ en.ts
│  │  └─ index.tsx
│  ├─ index.css
│  ├─ loader
│  │  ├─ engine
│  │  │  ├─ camera
│  │  │  │  ├─ camera.config.ts
│  │  │  │  ├─ camera.types.ts
│  │  │  │  ├─ CameraStage.tsx
│  │  │  │  └─ useCinematicCamera.ts
│  │  │  ├─ CinematicLoadingEngine.tsx
│  │  │  ├─ EngineErrorBoundary.tsx
│  │  │  ├─ sequence.defaults.ts
│  │  │  ├─ sequence.types.ts
│  │  │  ├─ stage
│  │  │  │  ├─ BodySlot.tsx
│  │  │  │  ├─ GlowSlot.tsx
│  │  │  │  ├─ IgnitionSlot.tsx
│  │  │  │  └─ TrailSlot.tsx
│  │  │  └─ useCinematicSequence.ts
│  │  ├─ hooks
│  │  │  ├─ useLoadingTimeout.ts
│  │  │  └─ usePrefersReducedMotion.ts
│  │  ├─ themes
│  │  │  └─ phoenix
│  │  │     ├─ assets
│  │  │     │  └─ phoenix.svg
│  │  │     ├─ components
│  │  │     │  ├─ PhoenixBody.tsx
│  │  │     │  ├─ PhoenixGlow.tsx
│  │  │     │  ├─ PhoenixIgnition.tsx
│  │  │     │  └─ PhoenixTrail.tsx
│  │  │     ├─ phoenix.config.ts
│  │  │     ├─ phoenix.theme.ts
│  │  │     ├─ phoenix.types.ts
│  │  │     └─ usePhoenixSequence.ts
│  │  └─ utils
│  │     └─ svgGeometry.ts
│  ├─ main.tsx
│  ├─ public-pages
│  │  ├─ HomePage.tsx
│  │  ├─ PortfolioEventPage.tsx
│  │  └─ sections
│  │     ├─ AboutSection.tsx
│  │     ├─ AnimatedBackground.tsx
│  │     ├─ BrandCorner.tsx
│  │     ├─ ClientsSection.tsx
│  │     ├─ ContactSection.tsx
│  │     ├─ EquipmentSection.tsx
│  │     ├─ HeroSection.tsx
│  │     ├─ Lightbox.tsx
│  │     ├─ PortfolioSection.tsx
│  │     ├─ ServicesSection.tsx
│  │     └─ VideoBackground.tsx
│  ├─ router.tsx
│  ├─ services
│  │  ├─ apiClient.ts
│  │  ├─ endpoints
│  │  │  ├─ about.ts
│  │  │  ├─ auth.ts
│  │  │  ├─ clients.ts
│  │  │  ├─ contact.ts
│  │  │  ├─ dashboard.ts
│  │  │  ├─ equipment.ts
│  │  │  ├─ hero.ts
│  │  │  ├─ language.ts
│  │  │  ├─ logoCollectionFactory.ts
│  │  │  ├─ portfolio.ts
│  │  │  ├─ seo.ts
│  │  │  ├─ services.ts
│  │  │  ├─ settings.ts
│  │  │  └─ social.ts
│  │  ├─ localStore.ts
│  │  └─ types.ts
│  ├─ utils
│  │  └─ slug.ts
│  └─ vite-env.d.ts
├─ tailwind.config.ts
├─ test
│  ├─ AdminAuth.test.tsx
│  ├─ App.smoke.test.tsx
│  ├─ PortfolioDetail.test.tsx
│  ├─ setup.ts
│  └─ testUtils.tsx
├─ tsconfig.app.json
├─ tsconfig.app.tsbuildinfo
├─ tsconfig.json
├─ tsconfig.node.json
├─ tsconfig.node.tsbuildinfo
├─ vercel.json
├─ vite-env.d.ts
├─ vite.config.ts
└─ vitest.config.ts

```
