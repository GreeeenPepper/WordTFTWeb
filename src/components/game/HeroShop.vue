<template>
  <div class="hero-shop">
    <div class="shop-header">
      <h2 class="shop-title">英雄商店</h2>
      <div class="shop-actions">
        <button 
          class="btn-refresh" 
          @click="refreshShop" 
          :disabled="!canRefresh"
        >
          刷新 ({{ refreshCost }}金币)
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="shop-loading">
      <p>正在准备英雄...</p>
    </div>
    
    <div v-else-if="heroes.length === 0" class="shop-empty">
      <p>英雄商店暂无可用英雄，请刷新。</p>
    </div>
    
    <div v-else class="shop-display">
      <character-card 
        v-for="hero in heroes" 
        :key="hero.id || hero.name" 
        :character="hero"
        :is-owned="false"
        :compact="true"
        class="shop-card"
        @buy="buyHero"
        @show-skill-tooltip="showSkillTooltip"
        @hide-skill-tooltip="hideSkillTooltip"
      />
    </div>
    
    <!-- 技能提示框 -->
    <div v-if="activeTooltip" class="skill-tooltip" :style="tooltipStyle">
      <div class="tooltip-title" :class="getSkillClass(activeTooltip)">
        {{ activeTooltip.name }}
      </div>
      <div class="tooltip-description">{{ activeTooltip.description || '无描述' }}</div>
      <div v-if="activeTooltip.effects && activeTooltip.effects.length > 0" class="tooltip-effects">
        <div v-for="(effect, index) in activeTooltip.effects" :key="index" class="tooltip-effect">
          {{ effect }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CharacterCard from '../ui/CharacterCard.vue';
import { generateHeroShop } from '../../utils/characterGenerator';

export default {
  name: 'HeroShop',
  
  components: {
    CharacterCard
  },
  
  props: {
    level: {
      type: Number,
      default: 1
    },
    gold: {
      type: Number,
      required: true
    },
    refreshCost: {
      type: Number,
      default: 2
    },
    ownedHeroes: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      heroes: [],
      loading: false,
      activeTooltip: null,
      tooltipStyle: {}
    };
  },
  
  computed: {
    canRefresh() {
      return this.gold >= this.refreshCost;
    },
    
    heroCount() {
      // 根据层级决定商店中显示的英雄数量
      return Math.min(8, Math.max(5, Math.floor(this.level / 10) + 5));
    }
  },
  
  watch: {
    level: {
      handler: 'generateShop',
      immediate: true
    }
  },
  
  methods: {
    generateShop() {
      this.loading = true;
      
      // 模拟异步加载
      setTimeout(() => {
        // 生成随机英雄
        this.heroes = generateHeroShop(this.level, this.heroCount);
        this.loading = false;
      }, 500);
    },
    
    refreshShop() {
      if (this.canRefresh) {
        this.$emit('refresh');
        this.generateShop();
      }
    },
    
    buyHero(hero) {
      if (this.gold >= hero.cost) {
        this.$emit('buy', hero);
        
        // 从商店中移除这个英雄
        const index = this.heroes.findIndex(h => h === hero);
        if (index !== -1) {
          this.heroes.splice(index, 1);
        }
      }
    },
    
    // 添加技能提示框功能
    showSkillTooltip(skill, event) {
      // 确保我们使用的是技能对象，如果不是对象则创建一个
      let skillObj = skill;
      if (typeof skill === 'string') {
        // 将字符串技能转换为对象
        skillObj = {
          name: skill,
          type: this.inferSkillType(skill)
        };
      }
      
      // 确保即使数据不完整也能显示合理的描述
      const description = skillObj.description || this.getSkillDefaultDescription(skillObj);
      const effects = skillObj.effects || this.getSkillDefaultEffects(skillObj);
      
      this.activeTooltip = {
        name: skillObj.name || '技能',
        description: description,
        type: skillObj.type || 'attack',
        effects: effects
      };
      
      this.tooltipStyle = {
        left: `${event.clientX + 10}px`,
        top: `${event.clientY + 10}px`
      };
    },
    
    hideSkillTooltip() {
      this.activeTooltip = null;
    },
    
    // 根据技能名称推断类型
    inferSkillType(skillName) {
      if (!skillName) return 'attack';
      
      const name = skillName.toLowerCase();
      
      // 攻击类技能
      if (name.includes('斩') || name.includes('劈') || name.includes('击') || 
          name.includes('砍') || name.includes('刺') || name.includes('剑术')) {
        return 'attack';
      }
      
      // 魔法攻击
      if (name.includes('法术') || name.includes('魔法') || name.includes('咒语')) {
        return 'magic';
      }
      
      // 火系技能
      if (name.includes('火') || name.includes('炎') || name.includes('烈') || 
          name.includes('燃') || name.includes('灼热')) {
        return 'fire';
      }
      
      // 冰系技能
      if (name.includes('冰') || name.includes('霜') || name.includes('寒') || 
          name.includes('冻') || name.includes('凝霜')) {
        return 'ice';
      }
      
      // 治疗技能
      if (name.includes('治') || name.includes('愈') || name.includes('复') || 
          name.includes('疗') || name.includes('生命')) {
        return 'heal';
      }
      
      // 增益技能
      if (name.includes('强化') || name.includes('增强') || name.includes('提升') || 
          name.includes('祝福') || name.includes('激励')) {
        return 'buff';
      }
      
      // 减益技能
      if (name.includes('削弱') || name.includes('减益') || name.includes('降低') || 
          name.includes('诅咒') || name.includes('虚弱')) {
        return 'debuff';
      }
      
      // 其他情况，默认为物理攻击
      return 'attack';
    },
    
    // 根据技能名称和类型生成默认描述
    getSkillDefaultDescription(skill) {
      const name = skill.name || '';
      const type = skill.type || '';
      
      // 根据技能类型生成默认描述
      if (type === 'attack') {
        return `对敌人造成物理伤害。伤害基于角色的攻击力。`;
      } else if (type === 'magic') {
        return `对敌人造成魔法伤害。伤害基于角色的魔法攻击力。`;
      } else if (type === 'fire') {
        return `向敌人发射火球，造成火属性魔法伤害。`;
      } else if (type === 'ice') {
        return `对敌人释放冰霜魔法，造成冰属性魔法伤害并有几率减速。`;
      } else if (type === 'heal') {
        return `恢复友方单位生命值。恢复量基于角色的魔法攻击力。`;
      } else if (type === 'buff') {
        return `增强友方单位的属性，提高战斗能力。`;
      } else if (type === 'debuff') {
        return `降低敌方单位的属性，削弱战斗能力。`;
      }
      
      // 根据技能名称关键词生成默认描述
      if (name.includes('斩击') || name.includes('劈砍')) {
        return `对敌人进行强力劈砍，造成物理伤害。`;
      } else if (name.includes('治愈') || name.includes('恢复')) {
        return `治愈友方单位，恢复生命值。`;
      } else if (name.includes('火球') || name.includes('烈焰')) {
        return `向敌人发射火球，造成火属性魔法伤害。`;
      } else if (name.includes('冰霜') || name.includes('寒冰')) {
        return `对敌人释放冰霜魔法，造成冰属性魔法伤害并有几率减速。`;
      } else if (name.includes('强化') || name.includes('增益')) {
        return `增强友方单位的战斗能力，提高属性。`;
      } else if (name.includes('削弱') || name.includes('虚弱')) {
        return `降低敌方单位的战斗能力，减少属性。`;
      }
      
      return `使用${name || '技能'}攻击敌人或辅助队友。`;
    },
    
    // 根据技能类型生成默认效果
    getSkillDefaultEffects(skill) {
      const type = skill.type || '';
      const name = skill.name || '';
      const effects = [];
      
      if (type === 'attack') {
        effects.push('基础伤害：100% 攻击力');
        effects.push('暴击几率：取决于角色暴击属性');
      } else if (type === 'magic') {
        effects.push('基础伤害：120% 魔法攻击力');
        effects.push('忽视目标部分魔法抗性');
      } else if (type === 'fire') {
        effects.push('基础伤害：130% 魔法攻击力');
        effects.push('有几率造成灼烧效果');
      } else if (type === 'ice') {
        effects.push('基础伤害：110% 魔法攻击力');
        effects.push('有几率减少目标速度');
      } else if (type === 'heal') {
        effects.push('基础治疗：150% 魔法攻击力');
        effects.push('对生命值低的目标效果更好');
      } else if (type === 'buff') {
        effects.push('增加目标 20% 攻击力');
        effects.push('持续2回合');
      } else if (type === 'debuff') {
        effects.push('降低目标 20% 防御力');
        effects.push('持续2回合');
      }
      
      // 根据技能名称添加特殊效果
      if (name.includes('暴击') || name.includes('致命')) {
        effects.push('暴击率提高 30%');
      } else if (name.includes('连击') || name.includes('连续')) {
        effects.push('有 50% 几率追加一次攻击');
      } else if (name.includes('穿透') || name.includes('贯穿')) {
        effects.push('无视目标 30% 防御力');
      } else if (name.includes('沉默') || name.includes('封印')) {
        effects.push('使目标无法使用技能 1 回合');
      }
      
      return effects;
    },
    
    getSkillClass(skill) {
      if (!skill || typeof skill === 'string') return '';
      return `skill-type-${skill.type || 'default'}`;
    }
  }
}
</script>

<style scoped>
.hero-shop {
  width: 100%;
  background: var(--color-bg-light);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-border);
  position: relative;
  box-sizing: border-box; /* Ensure padding is included in width */
  overflow: hidden; /* Ensure nothing extends beyond the shop panel */
}

@media (min-width: 1280px) {
  .hero-shop {
    max-width: 1280px;
    margin: 0 auto;
    padding: 24px;
  }
}

.hero-shop::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, transparent, var(--color-primary), transparent);
}

.shop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.shop-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--color-text);
}

.shop-actions {
  display: flex;
  gap: 8px;
}

.btn-refresh {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: white;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.shop-loading, .shop-empty {
  padding: 24px 0;
  text-align: center;
  color: var(--color-text-light);
}

/* 横向商店布局 */
.shop-display {
  display: grid;
  /* Calculate available space more precisely */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 8px 0;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box; /* Ensure padding is included in width */
}

/* Add media queries to control the number of columns more precisely */
@media (min-width: 768px) {
  .shop-display {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .shop-display {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1280px) {
  .shop-display {
    grid-template-columns: repeat(5, 1fr);
  }
}

.shop-display::-webkit-scrollbar {
  height: 8px;
}

.shop-display::-webkit-scrollbar-track {
  background-color: var(--color-bg-lighter);
  border-radius: 4px;
}

.shop-display::-webkit-scrollbar-thumb {
  background-color: var(--color-primary);
  border-radius: 4px;
}

.shop-card {
  transition: transform 0.2s;
  margin: 0 auto;
  width: 100%;
  display: flex;
  justify-content: center;
  max-width: 200px; /* Reduce max-width to fit better */
}

.shop-card:hover {
  transform: translateY(-4px);
}

/* 技能提示框样式 */
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

/* Remove the gradient shadow since we're no longer scrolling */
/* .shop-display::after {
  content: '';
  position: absolute;
  right: 0;
  top: 70px;
  bottom: 12px;
  width: 30px;
  background: linear-gradient(to right, transparent, var(--color-bg-light, rgba(255, 255, 255, 0.9)));
  pointer-events: none;
  opacity: 0.8;
} */
</style> 