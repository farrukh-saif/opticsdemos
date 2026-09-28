# PhotonLab

Educational optics simulations for learning about light-tissue interactions.

## Light Attenuation Demo

Interactive Monte Carlo simulation showing how light absorbs and scatters in tissue.

### Features

- 3D visualization with top-down beam geometry
- Adjustable optical properties (μₐ, μₛ, g, thickness)
- Real-time photon path rendering
- Live transmission/absorption/scattering statistics

### Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

### Deploy

Ready for Vercel:

```bash
npx vercel
```

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Three.js / React Three Fiber
- Tailwind CSS

## Physics

**Absorption**: I = I₀ · e^(-μₐ · d)

**Scattering**: Photons change direction based on μₛ and anisotropy g.

**Monte Carlo**: Each photon path is simulated statistically.

## Future

PhotonLab is designed to grow into a hub of educational optics demos. This is the first simulation.

## License

MIT
