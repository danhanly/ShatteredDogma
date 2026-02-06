
# Shattered Dogma: The Liturgy of Numbers

*A definitive guide to the mechanics governing the ascension.*

## I. Game Overview

**Shattered Dogma** is an idle/clicker game where you embody an emerging Eldritch God. Your goal is to amass a cult of followers to fuel your ascension.

The core loop revolves around:
1.  **Manifesting Dark Miracles** (Active Clicking) to attract worshippers.
2.  **Bind Vessels** (Passive Income) to automate the gathering of souls.
3.  **Equipping Focus Gems** to manipulate the type of worshippers you attract.
4.  **Triggering The End of Days** (Prestige) to reset your cult in exchange for **Souls**, which purchase permanent artifacts (Relics).

---

## II. The Flock (Resources)

Your power is measured by **Worshippers**. However, not all souls are equal. The mortal coil is divided into four distinct castes, each serving as a currency for specific upgrades and vessels:

1.  **Indolent (Blue):** The passive biomass. Used for early-game vessels and bulk upgrades.
2.  **Lowly (Grey):** The broken and destitute. The foundation of your hierarchy.
3.  **Worldly (Green):** The wealthy and ambitious. Harder to acquire, used for mid-tier power.
4.  **Zealous (Red):** The fanatical vanguard. Rare and potent, required for apex vessels.

---

## III. Core Mechanics

### 1. Dark Miracles (Active Clicking)
Performing a miracle (tapping) grants Worshippers immediately.
*   **Base Gain:** `1 + MiracleLevel`
*   **RNG:** Each click randomly awards *one* specific type of Worshipper based on probability weights.
*   **Focus Gems:** Unlocked via milestones. Equipping a gem increases the probability weight of its favored Worshipper type (Base: 2x), allowing you to target specific resources. This effectiveness can be boosted by Relics.

### 2. The Liturgy of Vessels (Passive Income)
Vessels are permanent anchors in reality that generate Worshippers automatically every second.
*   There are **4 Tiers** of vessels.
*   Vessels cost the specific Worshipper type they belong to (e.g., *Mudge the Slumbering* costs Indolent followers).
*   **Output:** Vessels generate followers of their own type.

### 3. Milestones
Upgrading your Miracle Level hits a "Milestone" at levels 5, 10, 25, 50, 75, 100, etc.
*   **Cost:** Milestones cost significantly more and require a specific type of Worshipper to unlock.
*   **Milestone Multipliers:** The base cost is multiplied based on the soul type required:
    *   **Indolent:** 5x
    *   **Lowly:** 2.5x
    *   **Worldly:** 1.75x
    *   **Zealous:** 1.25x
*   **Reward:** Unlocking a milestone grants access to **Focus Gems**.

### 4. Influence of the Abyss
Unlocked after the first Zealous Milestone (Level 50). This mechanic allows you to forcibly evolve your flock, but comes at a grave cost.
*   **Mechanism:** Transition a lower tier of worshipper to the next tier (e.g., Indolent -> Lowly).
*   **Cost (Immediate):** Removes **ALL** worshippers of the source type and resets **ALL** vessel levels of that source type to **0** (unless preserved by Relics).
*   **Cost (Permanent):** Every time you Influence a worshipper type, the cost to upgrade their vessels increases by **+2%** cumulatively.
*   **Benefit:** You gain 50% of the sacrificed population as the higher tier.
    *   *Motivate the Torpid*: Indolent -> Lowly
    *   *Invest in the Poor*: Lowly -> Worldly
    *   *Stoke The Fires of Zeal*: Worldly -> Zealous

---

## IV. The End of Days (Prestige)

**Unlock Threshold:** 1,000,000 Total Worshippers.

Triggering the Apocalypse resets the world to forge a stronger one.
*   **RESET:** Worshippers, Miracle Levels, Vessel Levels, Unlocked Gems, Influence Penalties.
*   **KEPT:** Souls, Relics, Historical Stats (Max Worshippers).

### Souls
Souls are the prestige currency used to buy Relics.
**Formula:**
$$Souls = \lfloor 10 + 0.01 \times \sqrt[3]{TotalWorshippers - 1,000,000} \rfloor$$
*(You gain 10 Souls exactly at 1M worshippers, with diminishing returns thereafter.)*

### Relics
Permanent upgrades purchased with Souls. While the bonus provided by Relics is **additive (linear)** relative to their level, their cost grows **exponentially** to represent the strain of anchoring eternal artifacts.

**Influence Retention Relics:**
New relics now allow you to mitigate the devastation of the Abyss.
*   **Sigil of Stagnation:** Retains **1%** of Indolent Vessel levels per level when using *Motivate the Torpid*.
*   **Sigil of Servitude:** Retains **1%** of Lowly Vessel levels per level when using *Invest in the Poor*.
*   **Sigil of Hubris:** Retains **1%** of Worldly Vessel levels per level when using *Stoke The Fires of Zeal*.

**Standard Relics:**
1.  **Hand of the Void:** Increases Click Power by +5% per level.
2.  **Shepherd's Crook:** Increases Indolent Vessel output by +5% per level.
3.  **Chain of Binding:** Increases Lowly Vessel output by +5% per level.
4.  **Coin of Charon:** Increases Worldly Vessel output by +5% per level.
5.  **Blade of the Martyr:** Increases Zealous Vessel output by +5% per level.
6.  **Crown of Eternity:** Increases ALL Vessel output by +2% per level.
7.  **Hourglass of the Sleeper:** Increases max offline time by +5 minutes per level (Base: 30m).
8.  **Prism of Desire:** Focus Gems are +50% more effective at attracting their target per level.

---

## V. The Mathematics of Ascension

### 1. Miracle Upgrade Cost
$$Cost = \lfloor 25 \times 1.15^{CurrentLevel} \rfloor$$

### 2. Vessel Costs
Vessel costs scale exponentially based on their Tier.
$$Cost = Base \times Multiplier^{Level} \times (1 + InfluencePenalty)$$
*Influence Penalty is +0.02 per Influence usage on that specific worshipper type.*

### 3. Vessel Output Calculation (Linear Benefit)
$$Output = (BaseOutput \times Level) \times (1 + Relic_{Type} \times 0.05) \times (1 + Relic_{All} \times 0.02)$$

### 4. Click Power Calculation
$$Power = (1 + MiracleLevel) \times (1 + Relic_{Miracle} \times 0.05)$$

### 5. Relic Cost Scaling (Exponential)
$$RelicCost = \lfloor 10 \times 1.15^{Level} \rfloor$$

---
*Documented by the Disgraced Scholars of the First Rift.*
