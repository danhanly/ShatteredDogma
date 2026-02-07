# Shattered Dogma: The Liturgy of Numbers

*A definitive guide to the mechanics governing the ascension.*

## I. Game Overview

**Shattered Dogma** is a dark fantasy idle/clicker game where you embody an emerging Eldritch God. Your goal is to amass a cult of worshippers to fuel your eventual ascension through the End of Days.

---

## II. The Flock (Resources)

Your power is measured by **Worshippers**. There are four distinct castes:

1.  **Indolent (Blue):** The passive biomass. The most common type, required for initial momentum.
2.  **Lowly (Grey):** The broken and destitute. Hardworking foundation of the cult.
3.  **Worldly (Green):** The wealthy and ambitious. Used for mid-tier influence.
4.  **Zealous (Red):** The fanatical vanguard. Required for the most potent rituals and the End Times.

---

## III. Core Mechanics

### 1. Dark Miracles (Active Clicking)
Manifesting miracles attracts Indolent worshippers.
*   **Base Power:** `1 + MiracleLevel` (modified by multipliers).
*   **Rounding Up:** When purchasing bulk upgrades (x5, x10, etc.), the first purchase rounds your level up to the next multiple of that increment.
*   **Soul Bonus:** Each Soul owned provides a permanent **+1%** bonus to click power.

### 2. The Liturgy of Vessels (Passive Income)
Vessels are permanent anchors in reality that generate Worshippers automatically every second.
*   **Consumption:** Higher castes consume the souls of lower castes to sustain themselves.
    *   **Lowly** consume **Indolent**.
    *   **Worldly** consume **Lowly**.
    *   **Zealous** consume **Indolent, Lowly, and Worldly**.
*   **Starvation:** If a resource is exhausted, the caste consuming it will "Halt" production until a surplus is restored.
*   **Rounding Up:** Vessel upgrades also round to the next increment multiple on the first purchase.

### 3. Focus Gems
Focus Gems allow your Dark Miracles to resonate with higher castes.
*   **Unlock:** Milestones in Miracle Level or Vessel Level unlock specific gems.
*   **Effect:** Activating a gem targets a specific caste (e.g. Ruby for Zealous) for 30 seconds, followed by a cooldown.

---

## IV. The End of Days (Prestige)

**Unlock Threshold:** 100,000 Zealous Worshippers.

Triggering the Apocalypse resets the world to forge a stronger one.
*   **RESET:** Worshippers, Miracle Levels, Vessel Levels, Unlocked Gems.
*   **KEPT:** Souls, Historical Stats (Max Worshippers).

### Souls
Souls are the prestige currency representing your permanent divine presence.
**Formula:**
$$Souls = \lfloor 10 + 0.01 \times \sqrt[3]{MaxZealous - 100,000} \rfloor$$

**Current Soul Benefit:**
Every Soul acquired gives a flat **+1%** bonus to:
*   **WPC (Worshippers Per Click)**
*   **WPS (Worshippers Per Second)**

---

## V. The Mathematics of Ascension

### 1. Miracle Upgrade Cost
$$Cost = \lfloor 25 \times 1.15^{CurrentLevel-1} \rfloor$$
*Note: Costs double every 10th level.*

### 2. Vessel Costs
Vessel costs scale based on Tier:
$$Cost = Base \times Multiplier^{Level}$$
*Multipliers range from 1.15 (Tier 1) to 1.2 (Tier 4).*

### 3. Output Calculation
$$Output = (BaseOutput \times Level) \times (1 + Souls \times 0.01)$$

### 4. Click Power Calculation
$$Power = (CurrentLevel \times 1.15^{\lfloor Level/10 \rfloor}) \times (1 + Souls \times 0.01)$$

---
*Documented by the Disgraced Scholars of the First Rift.*