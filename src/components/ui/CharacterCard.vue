<template>
  <div class="character-card" :class="[rarityClass, { 'is-hero': character.isHero, 'is-compact': compact, 'is-owned': owned }]">
    <div class="card-header">
      <h3 class="card-title" :style="{ color: character.rarityColor }">{{ character.name }}</h3>
      <div class="card-level-rarity">
        <div class="card-level">Lv.{{ character.level }}</div>
        <div class="card-rarity" :style="{ backgroundColor: character.rarityColor }">
          {{ character.rarityName }}
        </div>
      </div>
    </div>
    
    <!-- 非紧凑模式下的详细信息 -->
    <div class="card-info" v-if="!compact && !owned">
      <div class="traits">
        <span class="trait">{{ character.race }}</span>
        <span class="trait">{{ character.class }}</span>
      </div>
      <p class="description">{{ character.description }}</p>
    </div>
    
    <!-- 紧凑模式下的信息（商店英雄） -->
    <div class="compact-info" v-else-if="compact && !owned">
      <div class="compact-traits">
        <span class="trait">{{ character.race }}</span>
        <span class="trait">{{ character.class }}</span>
      </div>
      
      <!-- 显示全部技能，不再截断 -->
      <div class="compact-skills" v-if="character.skills && character.skills.length > 0">
        <div v-for="(skill, index) in character.skills" :key="index" 
          class="compact-skill"
          @mouseover="showSkillTooltip(skill, $event)"
          @mouseleave="hideSkillTooltip"
        >
          <span class="skill-name" :class="getSkillClass(skill)">
            {{ skill.name || skill }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- 已拥有英雄的精简布局 -->
    <div class="owned-info" v-else-if="owned">
      <div class="owned-header">
        <div class="owned-traits">
          <span class="trait">{{ character.race }}</span>
          <span class="trait">{{ character.class }}</span>
        </div>
      </div>
      
      <!-- 已拥有英雄的精简技能显示 -->
      <div class="owned-skills" v-if="character.skills && character.skills.length > 0">
        <div v-for="(skill, index) in character.skills" :key="index" 
          class="owned-skill"
          @mouseover="showSkillTooltip(skill, $event)"
          @mouseleave="hideSkillTooltip"
        >
          <span class="skill-name" :class="getSkillClass(skill)">
            {{ skill.name || skill }}
          </span>
        </div>
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
        <li v-for="(skill, index) in character.skills" :key="index" class="skill"
          @mouseover="showSkillTooltip(skill, $event)"
          @mouseleave="hideSkillTooltip"
        >
          <span class="skill-name" :class="getSkillClass(skill)">
            {{ skill.name || skill }}
          </span>
          <span v-if="skill.type" class="skill-type">{{ getSkillTypeLabel(skill.type) }}</span>
        </li>
      </ul>
    </div>
    
    <!-- 技能提示框 -->
    <div v-if="activeSkillTooltip" class="skill-tooltip" :style="tooltipStyle">
      <div class="tooltip-title" :class="getSkillClass(activeSkillTooltip)">
        {{ activeSkillTooltip.name }}
      </div>
      <div class="tooltip-description">{{ activeSkillTooltip.description || '无描述' }}</div>
      <div v-if="activeSkillTooltip.effects && activeSkillTooltip.effects.length > 0" class="tooltip-effects">
        <div v-for="(effect, index) in activeSkillTooltip.effects" :key="index" class="tooltip-effect">
          {{ effect }}
        </div>
      </div>
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
    },
    owned: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      activeSkillTooltip: null,
      tooltipStyle: {}
    };
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
    },
    
    showSkillTooltip(skill, event) {
      this.activeSkillTooltip = skill;
      this.tooltipStyle = {
        left: `${event.clientX + 10}px`,
        top: `${event.clientY + 10}px`
      };
      
      // Emit event to parent component to show tooltip
      this.$emit('show-skill-tooltip', skill, event);
    },
    
    hideSkillTooltip() {
      this.activeSkillTooltip = null;
      
      // Emit event to parent component to hide tooltip
      this.$emit('hide-skill-tooltip');
    },
    
    getSkillClass(skill) {
      if (!skill || typeof skill === 'string') return '';
      return `skill-type-${skill.type || 'default'}`;
    },
    
    getSkillTypeLabel(type) {
      const types = {
        'attack': '攻击',
        'heal': '治疗',
        'buff': '增益',
        'debuff': '减益',
        'fire': '火焰',
        'ice': '冰霜',
        'light': '光明',
        'dark': '暗影',
        'lightning': '雷电'
      };
      
      return types[type] || '特殊';
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
  height: auto;
  min-height: 300px;
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

.compact-skills {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.compact-skill {
  padding: 4px 6px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
  cursor: pointer;
  font-size: 12px;
  text-align: center;
}

.compact-skill:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.compact-skill-more {
  font-size: 11px;
  text-align: center;
  color: var(--color-text-light);
  margin-top: 2px;
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
  padding: 5px 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  margin-bottom: 6px;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.skill-name {
  font-weight: 500;
}

.skill-type {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.2);
}

/* 技能类型样式 */
.skill-type-attack {
  color: #f56565;
}

.skill-type-heal {
  color: #48bb78;
}

.skill-type-buff {
  color: #4299e1;
}

.skill-type-debuff {
  color: #9f7aea;
}

.skill-type-fire {
  color: #ed8936;
}

.skill-type-ice {
  color: #90cdf4;
}

.skill-type-light {
  color: #ecc94b;
}

.skill-type-dark {
  color: #805ad5;
}

.skill-type-lightning {
  color: #4fd1c5;
}

/* 工具提示样式 */
.skill-tooltip {
  position: fixed;
  z-index: 1000;
  background-color: var(--color-bg-light);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  max-width: 280px;
  pointer-events: none;
}

.tooltip-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tooltip-description {
  font-size: 0.9rem;
  margin-bottom: 8px;
  color: var(--color-text);
  line-height: 1.4;
}

.tooltip-effects {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tooltip-effect {
  font-size: 0.85rem;
  padding: 4px 8px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  color: #a0aec0;
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

/* 已拥有英雄卡片的独特样式 */
.is-owned {
  min-height: 280px;
  height: auto;
  max-width: 220px;
  box-shadow: 0 0 0 2px var(--color-primary);
  background: linear-gradient(to bottom, var(--color-bg-light), var(--color-bg));
}

.is-owned:hover {
  transform: translateY(-4px);
  box-shadow: 0 0 0 2px var(--color-primary), 0 6px 12px rgba(0, 0, 0, 0.15);
}

.owned-info {
  margin-bottom: 8px;
}

.owned-header {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.owned-traits {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.owned-skills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  margin: 8px 0;
}

.owned-skill {
  font-size: 12px;
  padding: 3px 6px;
  border-radius: 4px;
  background-color: var(--color-bg-light);
  cursor: pointer;
  transition: all 0.2s;
  margin: 2px;
}

.owned-skill:hover {
  background-color: var(--color-primary-light);
  transform: translateY(-2px);
}
</style> 