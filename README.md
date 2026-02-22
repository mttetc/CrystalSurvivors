# Crystal Survivors

Jeu de type Vampire Survivors en pixel art, construit avec **Phaser 3** et **TypeScript**.

Survivez a des vagues d'ennemis de plus en plus dangereuses en collectant des armes, des jobs et des ameliorations puissantes.

## Features

### 15 Jobs
Paladin, Dark Knight, Dragoon, Ninja, Monk, Berserker, Ranger, Bard, Black Mage, White Mage, Summoner, Time Mage, Alchemist, Geomancer, Samurai. Chaque job a 3 skills et un passif unique.

### 15 Armes
Une arme par job : Hunter's Bow, Sacred Shield, Fire Rod, Dark Claymore, War Harp, Shuriken, Katana, Battle Axe, War Lance, Flask Throw, Holy Rod, Ether Rod, Iron Fists, Chrono Rod, Earth Rod.

### Awakening
A partir du niveau 11, choisis entre prendre un 3e/4e job ou **eveiller** tes 2 jobs existants pour debloquer des passifs puissants, +1 a toutes les competences et +1 au niveau des armes.

### 8 Enchantements
Burning, Freezing, Vampiric, Piercing, Chain, Explosive, Toxic, Critical. Chaque enchantement a 3 tiers.

### 6 Elements
Feu, Glace, Foudre, Poison, Sacre, Ombre. Chaque element a un effet de base et 3 branches d'ameliorations. Coexiste avec les enchantements.

### 10 Synergies
Des combos de 2 jobs activent des bonus passifs automatiques (Holy Knight, Blood Warrior, Shadow Blade, etc.).

### 15 Cartes Malus (Trade-offs)
Des ameliorations puissantes avec un cout : Glass Cannon (+40% degats, -30% HP), Overcharge (+50% degats, +40% cooldowns), etc.

### Scaling Visuel
Les ameliorations de range grossissent visuellement les armes et projectiles.

### 20 Vagues
Ennemis varies (Shambler, Sprinter, Brute, Splitter, Necromancer, etc.), elites, et 2 boss (Gorehound, Hivemind).

## Stack

- **Phaser 3** - moteur de jeu 2D
- **TypeScript** - typage statique
- **Vite** - build tool

## Demarrage

```bash
npm install
npm run dev
```

Le jeu se lance sur `http://localhost:5173`.

## Build

```bash
npm run build
```

Les fichiers de production sont generes dans `dist/`.

## Architecture

```
src/
  constants.ts          # Enums, config, events
  types/                # Interfaces TypeScript
  entities/             # Player, Enemy, Projectile, Pickup, Chest
  weapons/              # 15 armes (BaseWeapon + implementations)
  systems/              # Managers (Combat, Wave, XP, Enchant, Element, Enhancement, etc.)
  data/                 # Definitions (jobs, weapons, enchants, elements, synergies, malus, etc.)
  scenes/               # Phaser scenes (Game, HUD, LevelUp, Title, etc.)
  ui/                   # Composants UI (DamageNumbers, EnhancementCard, WaveBanner)
```
