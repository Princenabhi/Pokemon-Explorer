# Pokémon Explorer

A responsive React + Vite project that uses the public [PokéAPI](https://pokeapi.co/).

## Features
- Loads Pokémon in batches of 20.
- Uses `IntersectionObserver` for automatic lazy loading as you scroll.
- Click a Pokémon card to open its details, including types, height, weight, abilities, and base stats.
- Search loaded Pokémon by name.
- Responsive layout for desktop, tablet, and mobile.

## Run the project

1. Install [Node.js](https://nodejs.org/) (LTS version).
2. Open a terminal inside this folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed in the terminal (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

No API key is required. An internet connection is needed to access PokéAPI and load the Pokémon images.
