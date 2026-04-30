

# YGO Tallymaster

**YGO Tallymaster** is a all-in-one desktop companion for Yu-Gi-Oh! Built with Electron and Vue 3, this app makes managing your collection fast, and flexible.

## ✨ Features

- 🗂️ **Organize your cards** in Collections and Sets (use them directly in Deck creation!)
- 💖 **Mark Owned Cards** for Deck Creation and Collection Management
- 🏗️ **Create and manage Decks** with exports to various formats
- 🧪 **Test your Decks** with an interactive, drag-and-drop play area
- 🔍 **Browse and search** the entire Yu-Gi-Oh! card database (data from [YGOProDecks](https://ygoprodeck.com/api-guide/))
- 🏆 **Banlists for all formats** - always up-to-date, so you can check card legality for any official format
- 🧩 **Explore all Card Archetypes** - discover, filter, and learn about every archetype in the game
- 📆 **Explore Cards by Release** - browse most releases, and see what cards they brought
- 🗄️ **Import & Export** your deckst and sets to and from various formats
- 💲 **Card Prices** - Check Cardmarket and TCGPlayer prices for your cards, decks and sets
- 📊 **Collection Statistics** - View detailed statistics about your collection, ranging from By Release Year to Archetype Breakdowns
- 🖼️ **Images stored locally** after first download for fast, offline browsing
- ⚡ Modern, responsive UI powered by Electron + Vue 3

## 🎮 Controls
### Owned Cards
* Click the "owned card" heart-icon (visible in most card grids on hover, or on the right in card lists) to mark how many copies of a card are owned
* Right-Clicking the icon decreases the owned number by one

### Decks/Sets
* You can right-click a deck/set to delete/rename/copy
---
* You can add a Card to the side-deck, by shift-clicking the card inside the card-list
* Right-click a card to remove it from the deck/set
* You can shift-click a card inside the card grid to search for cards within the clicked cards Archetype, or name if not applicable
* When hovering a card, you can shift-scroll to scroll the Card Description panel instead

### Add Cards to Set
* You can right-click a card in most views (excluding the card grid in deck/set editors, but including the rightmost card-list in those tabs) and select one of your sets to add the card to

## 💾 Data & Storage

- Card and set data is fetched from YGOProDecks API
- **Images and API data** are stored locally after the initial fetch
- Up to **3 GB** of storage may be used for images and card data

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

- [Electron](https://www.electronjs.org/)
- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
  
## ♥️ Support
If you have more disposable income than you know what to do with, you can support me on ☕[ko-fi](https://ko-fi.com/mistereosc), to help me continue working on this project, and many more Video- and Boardgame related Apps!

---
Card and image data provided by [YGOProDecks](https://ygoprodeck.com/api-guide/).
---

# Images
## Card Database
![Database Filters](https://i.imgur.com/8rso4AQ.png)
![Card Details](https://i.imgur.com/R1YiFjV.png)
## Card Archetypes
![Card Archetypes](https://i.imgur.com/XBrzskr.png)
## Banlist
![Banlists](https://i.imgur.com/TKIg8yO.png)
## Decks
![Deck List](https://i.imgur.com/ittLo5b.png)
![Deck Creation](https://i.imgur.com/5FlpQB0.png)
![Deck Tester](https://i.imgur.com/dGBmmh0.png)
![Deck Exports](https://i.imgur.com/SDKpxlo.png)
## Collections
![Collections](https://i.imgur.com/AuNM82d.png)
![Statistics](https://i.imgur.com/c0CVFVn.png)
## Settings
![Settings](https://i.imgur.com/RjIJdUt.png)
