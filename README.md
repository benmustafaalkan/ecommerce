# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# Tekstil AI Studio

Tekstil AI Studio, tek bir urun fotografisini e-ticaret ve lifestyle sahnelerine donusturmek icin tasarlanmis bir React + Cloudflare Pages uygulamasidir. Akis; gorsel yukleme, beyaz dengesi kalibrasyonu, prompt tabanli sahne secimi ve Fal.ai uzerinden varyasyon uretiminden olusur.

## Ozellikler

- Surukle-birak veya dosya secici ile urun fotografisi yukleme
- Canvas tabanli zorunlu beyaz dengesi kalibrasyonu
- Urun formu, sahne stili, oran ve cozumurluk secimi
- Fal.ai proxy endpointleri uzerinden gorsel upload ve gorsel uretimi
- Uretilen varyasyonlar icin oturum gecmisi ve indirme aksiyonlari

## Teknoloji Yigini

- React 19 + TypeScript
- Vite 8
- Zustand
- Tailwind CSS 4
- Cloudflare Pages Functions
- Fal.ai Nano Banana Pro image edit modeli

## Gelistirme Ortami

Gereksinimler:

- Node.js 20+
- npm 10+

Kurulum:

```bash
npm install
```

Calistirma:

```bash
npm run dev
```

Kontroller:

```bash
npm run lint
npm run build
```

## Ortam Degiskenleri

Cloudflare Pages tarafinda asagidaki secret tanimli olmalidir:

- `FAL_KEY`: Fal.ai API anahtari

Yerelde sadece arayuz gelistirilecekse `npm run dev` yeterlidir. Pages Functions ile tam akisi denemek icin Cloudflare Pages / Wrangler ortami kullanilmalidir.

## Uygulama Akisi

1. Kullanici urun fotografisini yukler.
2. En acik renk noktasina tiklayarak beyaz dengesi kalibrasyonu yapar.
3. Sahne parametrelerini secer ve prompt onizlemesini gorur.
4. Kalibre edilmis gorsel once `/api/upload`, sonra prompt ile birlikte `/api/generate` endpointine gider.
5. Uretilen gorseller grid ve oturum gecmisi olarak sunulur.

## Proje Yapisi

```text
src/
  components/   Arayuz adimlari ve ortak UI bilesenleri
  constants/    Prompt ve endpoint sabitleri
  hooks/        Generation akisi
  store/        Zustand uygulama durumu
  utils/        Kalibrasyon ve dosya yardimcilari
functions/api/
  generate.ts   Fal.ai generation proxy
  upload.ts     Fal CDN upload proxy
```

## Deploy

- `wrangler.toml` Cloudflare Pages cikti klasoru olarak `dist` kullanir.
- Uygulamayi deploy etmeden once `npm run build` komutunun temiz gectigini dogrulayin.
- `FAL_KEY` secret'i Cloudflare dashboard uzerinden eklenmelidir; frontend koduna yazilmamalidir.
