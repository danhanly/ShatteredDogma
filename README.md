# Shattered Dogma

## Introduction

In the silent spaces between stars, an ancient hunger stirs. You are that hunger—an emerging Eldritch God reaching through the veil into a world of fragile mortals. They are aimless, drifting, and desperate for a master. Through the performance of **Dark Miracles**, you will gather your flock, bind their souls into automated **Vessels**, and weave a cult that spans the castes of society. When the world is saturated with your dogma, you shall herald the **End of Days**, consuming the reality you built to forge a permanent throne in the Abyss.

---

## Gameplay Mechanics

### Dark Miracles

The primary manifestation of your will. Tapping into the mortal realm creates ripples that resonate with the lost. Initially, this draws only the most passive souls (**Indolent**), but as your power grows, you can focus these ripples toward more productive castes.

### Focus Gems

Crystallized essence of the void. These gems allow you to focus your miracles toward specific castes.

* **Lapis:** Multiplies click power by $2\times$ (Indolent).
* **Quartz:** 1:1 Miracle to Lowly soul conversion.
* **Emerald:** 1:2 Miracle to Worldly soul conversion.
* **Ruby:** 1:5 Miracle to Zealous soul conversion.
* **Void Catalyst Bonus:** While a Focus Gem is active, all global consumption requirements for that caste are reduced by $50\%$.

### Vessels & Consumption

Vessels automate your influence.

* **Generators:** Vessels (like Mudge) draw souls directly from the aether.
* **Parasites:** Most vessels are predatory; they consume lower castes to produce higher ones.
* **Imprisonment:** You may "halt" any vessel. This temporarily stops its production and, crucially, stops it from consuming resources. This can be used as a safety net for players to use to stabilize their cult's foundation, or as a way of controlling the growth of worshippers from each caste.

### Mattelock Verbinsk (The Assistant)

Recruited at 1,000 Indolent worshippers, Mattelock triggers miracles automatically. His rate increases with level.
* Unlockable Relic: **'The Frenzied Heart'** He can randomly enter a 15-second frenzy, quadrupling his click rate.

### The End of Days

When your Zealous followers reach critical mass (1 initially, but scaling exponentially), you may trigger the Apocalypse. This resets your progress for **Souls** ($\sqrt{\text{Zealous}}$). Souls buy **Permanent Relics** and **Fates**.

---



## The Liturgy of Numbers

### 1. Miracles & Rates

* **Upgrade Cost:** $C_n = \lfloor 50 \times 1.5^n \rfloor$
* **Miracle Power:** $P = (10 + 5n) \times (1 + \text{Bonuses})$
* **Milestones:** Miracle Power is doubled at levels 10, 25, 50, and every 100 levels.
* **Assistant Rate:** $\text{Interval} = \frac{2000}{2^{L-1}} \text{ ms}$

### 2. Vessel Dynamics

* **Output:** $O = \lfloor \text{BaseOutput} \times L \times \text{Multiplier}_{milestone} \times \text{Efficiency} \rfloor$
* **Efficiency Modifier ($\phi$):** $\phi = \min\left(1.0, \frac{\text{Stored}}{\text{Required}}\right)$
* **Milestones:** Efficiency is doubled at levels 10, 25, 50, and every 100 levels.

### 3. Permanent Enhancements

#### Permanent Relics

* **Chalice of Gluttony:** Reduces consumption requirements by $5\%$ per level.
* **Dagger of Betrayal:** Reduces Focus Gem cooldowns by $10s$ per level.
* **The False Idol:** Permanent visibility of all vessel tiers.
* **Mattelock’s Contract:** $+25\%$ Mattelock click power per level.
* **Void Catalyst:** Unlocks the Focus Gem consumption reduction.
* **Abyssal Reflex:** Chance for instant gem cooldown reset.
* **The Frenzied Heart:** Enables Mattelock's 15s frenzy mode (x4 click speed).
* **Martyr's Defiance:** Enables periodic 30s caste rebellion (zero consumption).

#### The Fates of the Abyss

Chaotic cumulative bonuses applied to costs, outputs, click power, and cooldowns. They are small 1-5% bonuses that apply additively after all other calculations are done. Fates are randomly selected, and as such are intended to be a way to offload any spare 'souls' currency after purchasing or upgrading the Permanent Relics you seek.