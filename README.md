

# YGO Tallymaster

**YGO Tallymaster** is your all-in-one desktop companion for Yu-Gi-Oh! card enthusiasts! Built with Electron and Vue 3, this app makes managing your collection fun, fast, and flexible.

## ✨ Features

- 🗂️ **Organize your cards** in Collections and Sets (use them directly in Deck creation!)
- 🏗️ **Create and manage Decks** for any playstyle
- 🔍 **Browse and search** the entire Yu-Gi-Oh! card database (data from [YGOProDecks](https://ygoprodeck.com/api-guide/))
- 🏆 **Banlists for all formats** – always up-to-date, so you can check card legality for any official format
- 🧩 **Explore all Card Archetypes** – discover, filter, and learn about every archetype in the game
- 🖼️ **Images stored locally** after first download for fast, offline browsing
- ⚡ Modern, responsive UI powered by Electron + Vue 3

## 💾 Data & Storage

- Card and set data is fetched from YGOProDecks API
- **Images and API data** are stored locally after the initial fetch
- Up to **2.5GB** of storage may be used for images and card data

## 🚀 Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the app in development mode:**
   ```sh
   npm run dev
   ```
3. **Build the app for production:**
   ```sh
   npm run build
   ```

## 🛠️ Tech Stack

- [Electron](https://www.electronjs.org/) (desktop app framework)
- [Vue 3](https://vuejs.org/) (frontend framework)
- [Vite](https://vitejs.dev/) (build tool)

---
Card and image data provided by [YGOProDecks](https://ygoprodeck.com/api-guide/).
