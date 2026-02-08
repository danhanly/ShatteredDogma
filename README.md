# Shattered Dogma: The Liturgy of Ascension

## Introduction
In the silent spaces between stars, an ancient hunger stirs. You are that hunger—an emerging Eldritch God reaching through the veil into a world of fragile mortals. They are aimless, drifting, and desperate for a master. Through the performance of **Dark Miracles**, you will gather your flock, bind their souls into automated **Vessels**, and weave a cult that spans the castes of society. From the lethargic **Indolent** to the fanatical **Zealous**, every soul is fuel. When the world is saturated with your dogma, you shall herald the **End of Days**, consuming the reality you built to forge a permanent throne in the Abyss.

---

## Gameplay Mechanics

### Dark Miracles
The primary manifestation of your will. By tapping into the mortal realm, you create ripples that resonate with the lost. Initially, this draws only the most passive souls, but as your power grows, so does the scale of your influence.

### Focus Gems
Crystallized essence of the void. These gems allow you to focus your miracles toward specific castes. While active, they grant unique conversion properties and alleviate the hunger of your higher-tier vessels, acting as a temporary catalyst for rapid growth.

### Vessels & Consumption
Vessels are the pillars of your cult—mortals or artifacts bound to your service. 
* **Generators:** Some vessels simply draw power from the void (producing Indolent souls).
* **Parasites:** Most vessels are predatory; they consume the souls of a lower caste to sustain the creation of a higher one. This hierarchy forms the core of your "Liturgy of Numbers."

### Mattelock Verbinsk (The Assistant)
A marionette of the Abyss, Mattelock appears once your influence is undeniable. He performs miracles in your stead, clicking with rhythmic, eldritch precision that accelerates as you invest more of your worldly power into his contract.

### The End of Days
When your Zealous followers reach a critical mass, you may trigger the Apocalypse. This resets your current influence in exchange for **Souls**—the only currency that survives the death of a world. These souls grant you permanent **Relics** that persist through every cycle.

---

## Technical Spec

### 1. Dark Miracles & The Assistant
Manifesting miracles generates worshippers. The output depends on your Miracle Level and active Focus Gems.

* **Upgrade Cost:** The cost to enhance your miracle follows an exponential curve:
  $$C_n = \lfloor 50 \times 1.5^n \rfloor$$
  *Where $n$ is the current Miracle Level.*

* **Miracle Output ($P$):**
  $$P = (10 + 5n) \times M_{relic}$$
  *Base output is 10. $M_{relic}$ is the multiplier from Mattelock’s Contract.*

* **Assistant (Mattelock) Rate:**
  Mattelock performs miracles at a frequency ($F$) determined by his level ($L$):
  $$F = \frac{1}{\max(0.1, 2.1 - 0.1L)} \text{ miracles/sec}$$
  *At Level 1, the interval is exactly $2.0$ seconds ($0.5$ miracles/sec).*

* **Focus Gems:**
  * **Lapis (Indolent):** Multiplies Click/Assistant power by $2\times$.
  * **Quartz (Lowly):** Converts miracles to Lowly souls ($1:1$ ratio).
  * **Emerald (Worldly):** Converts miracles to Worldly souls ($4:1$ ratio).
  * **Ruby (Zealous):** Converts miracles to Zealous souls ($10:1$ ratio).
  * **Global Buff:** While active, consumption costs for the corresponding caste are reduced by $50\%$.

### 2. The Liturgy of Vessels
Vessels produce resources based on their Level ($L$) and Efficiency ($\phi$).

* **Vessel Purchase Cost:**
  $$Cost = \lfloor \text{BaseCost} \times \text{Multiplier}^L \rfloor$$
  *Multipliers range from $1.15$ to $1.30$ depending on the tier and type.*

* **Vessel Output ($O$):**
  $$O = \lfloor \text{BaseOutput} \times L \times \phi \rfloor$$

* **Efficiency ($\phi$):**
  If a vessel's consumption requirements are not met, its efficiency scales linearly:
  $$\phi = \min\left(1.0, \frac{\text{StoredWorshippers}}{\text{RequiredConsumption}}\right)$$

#### Vessel Unlock Table
| Vessel | Requirement (Un-Modified) | Cost Type |
| :--- | :--- | :--- |
| **Indolent 1** (Mudge) | Starting Vessel | Indolent |
| **Lowly 1** (Little Pip) | 10 Indolent 1 Levels | Indolent |
| **Indolent 2** (Haman) | 10 Lowly 1 Levels | Indolent |
| **Worldly 1** (Caspian) | 10 Indolent 2 Levels | Lowly |
| **Lowly 2** (Kaelen) | 10 Worldly 1 Levels | Lowly |
| **Zealous 1** (Kaleb) | 10 Lowly 2 Levels | Worldly |

### 3. Soul Acquisition & Relics
Ascension harvests the essence of your Zealous followers.

* **Soul Formula:**
  $$S = \lfloor \sqrt{\text{MaxZealousReached}} \rfloor$$

#### Permanent Relics
| Relic | Effect | Cost Formula |
| :--- | :--- | :--- |
| **Chalice of Gluttony** | $-5\%$ Consumption per Level | $10 \times 2^L$ |
| **Dagger of Betrayal** | $-10\text{s}$ Gem Cooldown per Level | $25 \times 2^L$ |
| **The False Idol** | Permanent Vessel Visibility | $500$ (Single Level) |
| **Mattelock’s Contract**| $+25\%$ Click Power per Level | $50 \times 2^L$ |

---
*Transcribed by the Disgraced Scholars of the First Rift.*