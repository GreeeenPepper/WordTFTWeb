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
      />
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
      loading: false
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