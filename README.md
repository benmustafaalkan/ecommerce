# Tekstil AI Studio

Tekstil AI Studio is an AI-assisted product photography workflow for textile e-commerce teams. It turns a single product photo into calibrated, scene-aware marketing visuals through a guided flow built with React on the frontend and Cloudflare Pages Functions on the backend.

## What It Does

- Upload a source product photo
- Calibrate white balance from the brightest reference point
- Choose product form, scene style, aspect ratio, and output quality
- Upload the calibrated asset through a backend proxy
- Generate e-commerce and lifestyle variations with Fal.ai
- Review, download, and reuse generated outputs within the same session

## Product Workflow

1. Upload a product image.
2. Calibrate the image by selecting a bright white or neutral point.
3. Configure generation settings and review the generated prompt.
4. Send the calibrated asset to the upload proxy.
5. Submit the uploaded asset and prompt to the generation endpoint.
6. Review generated images and download the preferred results.

## Stack

- React 19
- TypeScript
- Vite 8
- Zustand
- Tailwind CSS 4
- Cloudflare Pages Functions
- Fal.ai image generation APIs

## Local Development

Requirements:

- Node.js 20 or newer
- npm 10 or newer

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run quality checks:

```bash
npm run lint
npm run build
```

## Environment

The backend requires the following secret in Cloudflare Pages:

- `FAL_KEY`: Fal.ai API key used by the Pages Functions proxies

For local frontend-only iteration, `npm run dev` is enough. For end-to-end testing of upload and generation flows, run the project in a Cloudflare Pages-compatible environment with `FAL_KEY` configured.

## Repository Structure

```text
src/
  components/   Step-based UI and shared interface pieces
  constants/    Prompt and endpoint configuration
  hooks/        Generation flow orchestration
  store/        Zustand application state
  utils/        Calibration and file helpers
functions/api/
  generate.ts   Fal.ai generation proxy
  upload.ts     Fal CDN upload proxy
```

## Deployment Notes

- Production assets are built into `dist/`.
- `wrangler.toml` is configured for Cloudflare Pages deployment.
- `FAL_KEY` must stay server-side and must not be exposed to the frontend.
- GitHub Actions CI runs `npm ci`, `npm run lint`, and `npm run build` for pull requests and pushes to `main`.

## Current Scope

This repository currently focuses on the image preparation and generation workflow. It does not yet include catalog management, user authentication, billing, or production analytics.
