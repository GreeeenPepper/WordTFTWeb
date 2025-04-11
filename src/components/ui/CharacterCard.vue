<template>
  <div class="character-card" :class="[rarityClass, { 'is-hero': character.isHero, 'is-compact': compact }]">
    <div class="card-header">
      <h3 class="card-title" :style="{ color: character.rarityColor }">{{ character.name }}</h3>
      <div class="card-level-rarity">
        <div class="card-level">Lv.{{ character.level }}</div>
        <div class="card-rarity" :style="{ backgroundColor: character.rarityColor }">
          {{ character.rarityName }}
        </div>
      </div>
    </div>
    
    <div class="card-info" v-if="!compact">
      <div class="traits">
        <span class="trait">{{ character.race }}</span>
        <span class="trait">{{ character.class }}</span>
      </div>
      <p class="description">{{ character.description }}</p>
    </div>
    
    <div class="compact-info" v-else>
      <div class="compact-traits">
        <span class="trait">{{ character.race }}</span>
        <span class="trait">{{ character.class }}</span>
      </div>
    </div>
    
    <div class="card-stats" :class="{ 'compact-stats': compact }">
      <div class="stat">
        <span class="stat-icon">❤️</span>
        <span class="stat-value">{{ formatStat(character.stats.hp) }}</span>
      </div>
      <div class="stat">
        <span class="stat-icon">⚔️</span>
        <span class="stat-value">{{ formatStat(character.stats.atk) }}</span>
      </div>
      <div class="stat">
        <span class="stat-icon">🛡️</span>
        <span class="stat-value">{{ formatStat(character.stats.def) }}</span>
      </div>
      <div class="stat">
        <span class="stat-icon">⚡</span>
        <span class="stat-value">{{ formatStat(character.stats.spd) }}</span>
      </div>
      <div class="stat" v-if="!compact">
        <span class="stat-icon">🎯</span>
        <span class="stat-value">{{ formatStat(character.stats.crit) }}%</span>
      </div>
    </div>
    
    <div class="card-skills" v-if="!compact">
      <p class="skills-title">技能</p>
      <ul class="skills-list">
        <li v-for="(skill, index) in character.skills" :key="index" class="skill">
          {{ skill }}
        </li>
      </ul>
    </div>
    
    <div v-if="character.isHero && showActions" class="card-actions">
      <button v-if="!isOwned" class="btn-buy" @click="buyHero">
        购买 ({{ character.cost }}金币)
      </button>
      <button v-else class="btn-sell" @click="sellHero">
        出售 ({{ Math.floor(character.cost / 2) }}金币)
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CharacterCard',
  
  props: {
    character: {
      type: Object,
      required: true
    },
    isOwned: {
      type: Boolean,
      default: false
    },
    showActions: {
      type: Boolean,
      default: true
    },
    compact: {
      type: Boolean,
      default: false
    }
  },
  
  computed: {
    rarityClass() {
      return `rarity-${this.character.rarity}`;
    }
  },
  
  methods: {
    formatStat(value) {
      return Math.round(value);
    },
    
    buyHero() {
      this.$emit('buy', this.character);
    },
    
    sellHero() {
      this.$emit('sell', this.character);
    }
  }
}
</script>

<style scoped>
.character-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 280px;
  min-height: 430px;
  background: linear-gradient(to bottom, var(--color-bg-lighter), var(--color-bg-light));
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  margin: 0 auto;
  box-sizing: border-box;
}

.is-compact {
  min-height: unset !important;
  height: 300px;
  width: 100%;
  max-width: 200px;
  align-self: center;
  box-sizing: border-box;
}

.character-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary);
}

.character-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, transparent, currentColor, transparent);
  opacity: 0.5;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
  position: relative;
  flex-wrap: wrap;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  margin-bottom: 8px;
  text-shadow: none;
}

.card-level-rarity {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}

.card-level {
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: var(--color-bg-lighter);
  color: var(--color-text-light);
}

.card-rarity {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  letter-spacing: 1px;
  box-shadow: none;
}

.traits, .compact-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.compact-traits {
  justify-content: center;
}

.trait {
  font-size: 12px;
  background-color: var(--color-bg-lighter);
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  color: var(--color-text-light);
  box-shadow: none;
}

.description {
  font-size: 14px;
  color: var(--color-text-light);
  font-style: italic;
  margin-bottom: 16px;
  padding: 12px;
  background-color: var(--color-bg-lighter);
  border-radius: 4px;
  border-left: 2px solid var(--color-primary);
}

.compact-info {
  margin-bottom: 8px;
}

.card-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px;
  background-color: var(--color-bg-lighter);
  border-radius: 4px;
}

.compact-stats {
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: 12px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  background-color: var(--color-bg-light);
  transition: all 0.2s ease;
}

.stat:hover {
  background-color: rgba(108, 92, 231, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 18px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 14px;
  font-weight: 500;
}

.card-skills {
  margin-top: auto;
  background-color: var(--color-bg-lighter);
  padding: 12px;
  border-radius: 4px;
}

.skills-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-primary);
}

.skills-list {
  list-style-type: disc;
  list-style-position: inside;
  margin: 0;
  padding: 0;
}

.skill {
  font-size: 14px;
  padding: 4px 4px 4px 16px;
  position: relative;
  color: var(--color-text-light);
}

.skill::before {
  content: '•';
  color: var(--color-primary);
  display: inline-block;
  width: 16px;
  margin-left: -16px;
}

.card-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.btn-buy {
  background-color: var(--color-primary);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  border: none;
  box-shadow: none;
  transition: all 0.2s ease;
  cursor: pointer;
  width: 100%;
  max-width: 180px;
}

.btn-buy:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-sell {
  background-color: var(--color-secondary);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  border: none;
  box-shadow: none;
  transition: all 0.2s ease;
  cursor: pointer;
  width: 100%;
  max-width: 180px;
}

.btn-sell:hover {
  background-color: var(--color-secondary-dark);
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rarity-common {
  border-color: var(--color-rarity-common);
}

.rarity-common::before {
  background: linear-gradient(to right, transparent, var(--color-rarity-common), transparent);
}

.rarity-uncommon {
  border-color: var(--color-rarity-uncommon);
}

.rarity-uncommon::before {
  background: linear-gradient(to right, transparent, var(--color-rarity-uncommon), transparent);
}

.rarity-rare {
  border-color: var(--color-rarity-rare);
}

.rarity-rare::before {
  background: linear-gradient(to right, transparent, var(--color-rarity-rare), transparent);
}

.rarity-epic {
  border-color: var(--color-rarity-epic);
}

.rarity-epic::before {
  background: linear-gradient(to right, transparent, var(--color-rarity-epic), transparent);
}

.rarity-legendary {
  border-color: var(--color-rarity-legendary);
}

.rarity-legendary::before {
  background: linear-gradient(to right, transparent, var(--color-rarity-legendary), transparent);
}

.rarity-mythic {
  border-color: var(--color-rarity-mythic);
}

.rarity-mythic::before {
  background: linear-gradient(to right, transparent, var(--color-rarity-mythic), transparent);
}

.is-hero {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.is-hero::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.05), transparent);
  pointer-events: none;
}

:global(.dark-mode) .character-card {
  background: linear-gradient(to bottom, var(--color-bg-lighter), var(--color-bg-light));
}

:global(.dark-mode) .trait {
  background-color: var(--color-bg-light);
}
</style> 