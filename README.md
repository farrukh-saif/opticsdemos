# Welcome to Optics

An interactive educational web app demonstrating light absorption and scattering in tissue-like materials.

![Screenshot](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Three.js](https://img.shields.io/badge/Three.js-r186-black?logo=three.js)

## Features

- **Interactive 3D visualization** of photon transport through a tissue-like slab
- **Real-time Monte Carlo simulation** with adjustable optical properties
- **2D/3D view toggle** for different perspectives
- **Adjustable parameters:**
  - Absorption coefficient (μₐ)
  - Scattering coefficient (μₛ)
  - Photon rate
  - Tissue thickness
  - Anisotropy factor (g)
- **Live statistics** showing transmitted, absorbed, and scattered photon counts
- **Mobile-friendly** responsive design

## Physics Background

This simulation demonstrates two key phenomena in tissue optics:

### Absorption (Beer-Lambert Law)
Light intensity decreases exponentially as it passes through an absorbing medium:
```
I = I₀ × e^(-μₐ × d)
```
Higher absorption coefficients (μₐ) mean more light energy is converted to heat.

### Scattering
Photons change direction when interacting with particles in the medium. The scattering coefficient (μₛ) determines how frequently this occurs. The anisotropy factor (g) controls the scattering direction preference:
- g = 0: Isotropic (equal probability in all directions)
- g ~ 0.9: Forward-directed (typical for biological tissue)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Deployment

This app is ready for deployment on Vercel:

```bash
npx vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **3D Graphics:** Three.js with React Three Fiber
- **Styling:** Tailwind CSS
- **Deployment:** Vercel-ready

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main page component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── OpticsScene.tsx   # 3D canvas and scene setup
│   ├── TissueSlab.tsx    # Tissue visualization
│   ├── PhotonPaths.tsx   # Photon trajectory rendering
│   ├── ControlPanel.tsx  # UI controls and sliders
│   ├── Legend.tsx        # Color legend
│   └── InfoPanel.tsx     # Physics explanations
├── hooks/
│   └── usePhotonSimulation.ts  # Monte Carlo simulation logic
└── types/
    └── optics.ts         # TypeScript type definitions
```

## MVP Scope

### Included
- 3D tissue slab visualization with 2D toggle
- Absorption and scattering coefficient controls
- Photon rate control
- Monte Carlo photon path simulation
- Real-time statistics display
- Tissue thickness control
- Anisotropy (g factor) control
- Responsive mobile layout

### Deferred for Future
- Wavelength-dependent optical properties
- Multi-layer tissue models
- Fluence rate / irradiance heat maps
- Export simulation data
- Preset tissue types (skin, muscle, etc.)
- Advanced photon density visualization

## License

MIT
