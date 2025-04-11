<script>
import CharacterCard from './components/ui/CharacterCard.vue';
import HeroShop from './components/game/HeroShop.vue';
import BattleScreen from './components/battle/BattleScreen.vue';
import { generateEnemies } from './utils/characterGenerator';
import { generateArtifactChoices, getArtifactRarityInfo } from './utils/artifactSystem';

export default {
  name: 'App',
  
  components: {
    CharacterCard,
    HeroShop,
    BattleScreen
  },
  
  data() {
    return {
      gameStage: 'title', // title, prepare, battle, reward, gameover
      gold: 100,
      level: 1,
      health: 100,
      maxHealth: 100,
      heroes: [],
      enemies: [],
      maxHeroes: 5,
      shopRefreshCost: 2,
      artifacts: [],
      artifactChoices: [],
      lastGoldReward: 0,
      defeatedEnemies: 0,
      totalGoldEarned: 0,
      darkMode: false
    };
  },
  
  computed: {
    canStartBattle() {
      return this.heroes.length > 0;
    }
  },
  
  mounted() {
    // 检查用户偏好或本地存储的主题设置
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      this.enableDarkMode();
    } else if (storedTheme === 'light') {
      this.disableDarkMode();
    } else {
      // 检查系统偏好
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.enableDarkMode();
      }
    }
  },
  
  methods: {
    startGame() {
      this.gameStage = 'prepare';
      this.resetGameState();
    },
    
    resetGameState() {
      this.gold = 100;
      this.level = 1;
      this.health = 100;
      this.maxHealth = 100;
      this.heroes = [];
      this.enemies = [];
      this.artifacts = [];
      this.artifactChoices = [];
      this.lastGoldReward = 0;
      this.defeatedEnemies = 0;
      this.totalGoldEarned = 0;
    },
    
    refreshShop() {
      this.gold -= this.shopRefreshCost;
    },
    
    buyHero(hero) {
      if (this.gold >= hero.cost && this.heroes.length < this.maxHeroes) {
        this.gold -= hero.cost;
        this.heroes.push(hero);
      }
    },
    
    sellHero(hero) {
      const index = this.heroes.findIndex(h => h === hero);
      if (index !== -1) {
        this.gold += Math.floor(hero.cost / 2);
        this.heroes.splice(index, 1);
      }
    },
    
    startBattle() {
      this.gameStage = 'battle';
      
      // 生成敌人
      const enemyCount = Math.min(5, Math.max(1, Math.ceil(this.level / 5) + 1));
      this.enemies = generateEnemies(this.level, enemyCount);
    },
    
    handleBattleEnd(result) {
      if (result.result === 'victory') {
        // 胜利
        this.lastGoldReward = result.goldReward;
        this.gold += result.goldReward;
        this.totalGoldEarned += result.goldReward;
        this.level += 1;
        this.defeatedEnemies += this.enemies.length;
        
        // 生成神器选择
        if (this.level % 3 === 0) { // 每3层提供神器选择
          this.artifactChoices = generateArtifactChoices(
            this.level, 
            3, 
            this.artifacts.map(a => a.id)
          );
        } else {
          this.artifactChoices = [];
        }
        
        this.gameStage = 'reward';
      } else {
        // 失败
        this.health -= 10;
        
        if (this.health <= 0) {
          this.gameStage = 'gameover';
        } else {
          this.gameStage = 'prepare';
        }
      }
    },
    
    selectArtifact(artifact) {
      this.artifacts.push(artifact);
      this.artifactChoices = [];
    },
    
    continueAdventure() {
      this.gameStage = 'prepare';
    },
    
    restartGame() {
      this.gameStage = 'title';
    },
    
    getArtifactColor(rarity) {
      return getArtifactRarityInfo(rarity).color;
    },
    
    getArtifactRarityName(rarity) {
      return getArtifactRarityInfo(rarity).name;
    },
    
    getArtifactEmoji(artifact) {
      // 根据神器类型返回表情符号
      if (artifact.type === 'passive') return '🔮';
      if (artifact.type === 'active') return '⚡';
      if (artifact.type === 'conditional') return '🎯';
      if (artifact.type === 'transformative') return '✨';
      if (artifact.type === 'meta') return '💎';
      return '🔮';
    },
    
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      if (this.darkMode) {
        this.enableDarkMode();
      } else {
        this.disableDarkMode();
      }
    },
    
    enableDarkMode() {
      document.documentElement.classList.add('dark-mode');
      this.darkMode = true;
      localStorage.setItem('theme', 'dark');
    },
    
    disableDarkMode() {
      document.documentElement.classList.remove('dark-mode');
      this.darkMode = false;
      localStorage.setItem('theme', 'light');
    }
  }
}
</script>

<template>
  <div class="app-container">
    <button class="theme-toggle" @click="toggleDarkMode">
      <span class="theme-toggle-icon">{{ darkMode ? '☀️' : '🌙' }}</span>
      {{ darkMode ? '浅色模式' : '深色模式' }}
    </button>
    
    <header class="app-header">
      <h1 class="app-title">文字爬塔 TFT</h1>
      <div class="player-stats">
        <div class="stat gold">
          <span class="stat-icon">💰</span>
          <span class="stat-value">{{ gold }}</span>
        </div>
        <div class="stat level">
          <span class="stat-icon">🏔️</span>
          <span class="stat-value">第{{ level }}层</span>
        </div>
        <div class="stat health">
          <span class="stat-icon">❤️</span>
          <span class="stat-value">{{ health }}/{{ maxHealth }}</span>
        </div>
      </div>
    </header>
    
    <main class="app-content">
      <!-- 游戏阶段 -->
      <div v-if="gameStage === 'title'" class="title-screen">
        <h2 class="title-heading">文字爬塔</h2>
        <p class="title-subheading">随机、爬塔、英雄与怪物的无尽冒险</p>
        <button class="btn-start" @click="startGame">开始游戏</button>
      </div>
      
      <div v-else-if="gameStage === 'prepare'" class="prepare-screen">
        <div class="hero-roster">
          <div class="section-header">
            <h2 class="section-title">我的英雄 ({{ heroes.length }}/{{ maxHeroes }})</h2>
          </div>
          <div class="heroes-grid">
            <character-card 
              v-for="hero in heroes" 
              :key="hero.id || hero.name" 
              :character="hero"
              :is-owned="true"
              :owned="true"
              @sell="sellHero"
              class="hero-card"
            />
          </div>
          
          <div v-if="heroes.length === 0" class="empty-roster">
            <p>你还没有英雄。从商店中购买英雄来组建队伍！</p>
          </div>
        </div>
        
        <div class="shop-container">
          <hero-shop 
            :level="level"
            :gold="gold"
            :refresh-cost="shopRefreshCost"
            :owned-heroes="heroes"
            @refresh="refreshShop"
            @buy="buyHero"
          />
        </div>
        
        <div class="battle-controls">
          <button 
            class="btn-battle"
            @click="startBattle"
            :disabled="!canStartBattle"
          >
            开始战斗
          </button>
        </div>
      </div>
      
      <div v-else-if="gameStage === 'battle'" class="battle-screen-container">
        <battle-screen
          :level="level"
          :player-heroes="heroes"
          :enemies="enemies"
          @battle-end="handleBattleEnd"
        />
      </div>
      
      <div v-else-if="gameStage === 'reward'" class="reward-screen">
        <div class="section-header">
          <h2 class="section-title">战斗奖励</h2>
        </div>
        
        <div class="rewards-container">
          <div class="reward gold-reward">
            <span class="reward-icon">💰</span>
            <div class="reward-info">
              <h3 class="reward-title">金币奖励</h3>
              <p class="reward-value">+{{ lastGoldReward }}</p>
            </div>
          </div>
          
          <div class="artifact-choices" v-if="artifactChoices.length > 0">
            <h3 class="reward-heading">选择一个神器</h3>
            <div class="artifacts-grid">
              <div 
                v-for="artifact in artifactChoices" 
                :key="artifact.id"
                class="artifact-card"
                :class="`rarity-${artifact.rarity.toLowerCase()}`"
                @click="selectArtifact(artifact)"
              >
                <div class="artifact-header">
                  <span class="artifact-emoji">{{ getArtifactEmoji(artifact) }}</span>
                  <h4 class="artifact-name">{{ artifact.name }}</h4>
                  <p class="artifact-rarity" 
                    :style="{ color: getArtifactColor(artifact.rarity) }">
                    {{ getArtifactRarityName(artifact.rarity) }}
                  </p>
                </div>
                <p class="artifact-desc">{{ artifact.description }}</p>
                <p class="artifact-flavor">{{ artifact.flavor }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <button class="btn-continue" @click="continueAdventure">
          继续冒险
        </button>
      </div>
      
      <div v-else-if="gameStage === 'gameover'" class="gameover-screen">
        <div class="gameover-content">
          <h2 class="gameover-title">游戏结束</h2>
          <div class="gameover-stats-container">
            <p class="gameover-stats">
              你达到了第 <span class="stat-value">{{ level }}</span> 层
              <br>
              击败了 <span class="stat-value">{{ defeatedEnemies }}</span> 个敌人
              <br>
              获得了 <span class="stat-value">{{ totalGoldEarned }}</span> 金币
            </p>
          </div>
          <button class="btn-restart" @click="restartGame">重新开始</button>
        </div>
      </div>
    </main>
    
    <footer class="app-footer">
      <div class="artifacts-bar" v-if="artifacts.length > 0">
        <div 
          v-for="artifact in artifacts" 
          :key="artifact.id"
          class="artifact-icon"
          :title="artifact.name + ': ' + artifact.description"
          :style="{ borderColor: getArtifactColor(artifact.rarity) }"
        >
          {{ getArtifactEmoji(artifact) }}
        </div>
      </div>
      <p class="copyright">文字爬塔 - 融合Roguelike与自走棋的放置类游戏</p>
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Roboto+Mono:wght@400;500;700&display=swap');

/* 将App.vue中的样式也转换为普通CSS，保持与全局样式的一致性 */
body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: 'Roboto Mono', monospace;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 1440px;
  margin: 0 auto;
}

.app-header {
  background-color: var(--color-bg-light);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border-bottom: 4px solid var(--color-primary-dark);
  position: sticky;
  top: 0;
  z-index: 50;
}

@media (min-width: 768px) {
  .app-header {
    flex-direction: row;
  }
}

.app-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 16px;
  font-family: 'Press Start 2P', cursive;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

@media (min-width: 768px) {
  .app-title {
    margin-bottom: 0;
  }
}

.player-stats {
  display: flex;
  gap: 24px;
  background-color: var(--color-bg-lighter);
  border-radius: 8px;
  padding: 12px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.gold {
  background: linear-gradient(to right, rgba(255, 213, 79, 0.1), transparent);
  border-left: 3px solid #ffd54f;
}

.level {
  background: linear-gradient(to right, rgba(103, 232, 249, 0.1), transparent);
  border-left: 3px solid #67e8f9;
}

.health {
  background: linear-gradient(to right, rgba(248, 113, 113, 0.1), transparent);
  border-left: 3px solid #f87171;
}

.stat-icon {
  font-size: 20px;
}

.stat-value {
  font-weight: bold;
}

.app-content {
  flex: 1;
  padding: 16px;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}

@media (min-width: 768px) {
  .app-content {
    padding: 24px;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-primary);
  position: relative;
}

.section-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100px;
  height: 2px;
  background-color: var(--color-secondary);
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--color-text);
  letter-spacing: 1px;
}

.prepare-screen {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.hero-roster {
  background-color: var(--color-bg-light);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-border);
  box-sizing: border-box;
  overflow: hidden;
}

.heroes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  width: 100%;
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .heroes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .heroes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .heroes-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.empty-roster {
  text-align: center;
  padding: 48px 0;
  color: var(--color-text-light);
  background-color: var(--color-bg-lighter);
  border-radius: 8px;
  border: 1px dashed var(--color-border);
}

/* Style for hero cards in the roster */
.hero-card {
  max-width: 200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.shop-container {
  margin-top: 32px;
}

.battle-controls {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.btn-battle {
  background-color: var(--color-primary);
  color: white;
  font-size: 18px;
  padding: 12px 32px;
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
  transition: all 0.3s;
  cursor: pointer;
}

.btn-battle:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.btn-battle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #a0aec0;
  box-shadow: none;
}

.battle-screen-container {
  margin-bottom: 24px;
}

.title-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 96px 0;
  text-align: center;
  min-height: 70vh;
}

.title-heading {
  font-size: 36px;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 24px;
  font-family: 'Press Start 2P', cursive;
  text-shadow: 2px 2px 0 var(--color-primary-dark);
  letter-spacing: 3px;
  animation: float 3s ease-in-out infinite;
}

@media (min-width: 768px) {
  .title-heading {
    font-size: 48px;
  }
}

.title-subheading {
  font-size: 18px;
  color: var(--color-text-light);
  margin-bottom: 48px;
  max-width: 600px;
  line-height: 1.6;
}

@media (min-width: 768px) {
  .title-subheading {
    font-size: 20px;
  }
}

.btn-start {
  background-color: var(--color-primary);
  color: white;
  font-size: 20px;
  padding: 16px 40px;
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
  transition: all 0.3s;
  cursor: pointer;
}

.btn-start:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.reward-screen {
  max-width: 768px;
  margin: 0 auto;
  background-color: var(--color-bg-light);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-border);
}

.rewards-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-bottom: 32px;
}

.reward {
  display: flex;
  align-items: center;
  background-color: var(--color-bg-lighter);
  padding: 24px;
  border-radius: 12px;
  border-left: 4px solid #f6e05e;
  transition: transform 0.2s ease;
}

.reward:hover {
  transform: translateX(5px);
}

.reward-icon {
  font-size: 32px;
  margin-right: 24px;
}

.reward-info {
  flex: 1;
}

.reward-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text);
}

.reward-value {
  font-size: 24px;
  font-weight: bold;
  color: #f6e05e;
}

.reward-heading {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-primary);
}

.artifacts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .artifacts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.artifact-card {
  background-color: var(--color-bg-light);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  min-height: 250px;
  display: flex;
  flex-direction: column;
}

.artifact-card:hover {
  transform: scale(1.03);
  border-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.artifact-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.artifact-emoji {
  font-size: 24px;
  margin-right: 8px;
}

.artifact-name {
  font-size: 18px;
  font-weight: bold;
  flex: 1;
}

.artifact-rarity {
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 9999px;
  background-color: var(--color-bg-lighter);
}

.artifact-desc {
  font-size: 14px;
  margin-bottom: 16px;
  padding: 12px;
  background-color: var(--color-bg-lighter);
  border-radius: 8px;
}

.artifact-flavor {
  font-size: 12px;
  color: var(--color-text-light);
  font-style: italic;
  margin-top: auto;
  padding: 8px;
  border-top: 1px solid var(--color-border);
}

.btn-continue {
  background-color: var(--color-primary);
  color: white;
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 500;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
  transition: all 0.3s;
  cursor: pointer;
  display: block;
  margin: 0 auto;
}

.btn-continue:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.gameover-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  min-height: 60vh;
}

.gameover-content {
  max-width: 400px;
  background-color: var(--color-bg-light);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  border: 2px solid #f56565;
}

.gameover-title {
  font-size: 24px;
  font-weight: bold;
  color: #f56565;
  margin-bottom: 24px;
  text-align: center;
  letter-spacing: 2px;
}

.gameover-stats-container {
  background-color: var(--color-bg-lighter);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
  border-left: 4px solid var(--color-border-dark);
}

.gameover-stats {
  font-size: 18px;
  line-height: 2;
}

.gameover-stats .stat-value {
  font-size: 20px;
  color: var(--color-primary);
  margin-left: 8px;
}

.btn-restart {
  background-color: #f56565;
  width: 100%;
  color: white;
  padding: 12px 0;
  border-radius: 12px;
  font-size: 18px;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
  transition: all 0.3s;
  cursor: pointer;
}

.btn-restart:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.app-footer {
  background-color: var(--color-bg-light);
  padding: 16px;
  border-top: 1px solid var(--color-border);
  position: relative;
}

.app-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--color-primary-light, rgba(108, 92, 231, 0.5)), transparent);
}

.artifacts-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 16px;
  padding: 8px;
  background-color: var(--color-bg-lighter);
  border-radius: 8px;
}

.artifact-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-lighter);
  border-radius: 9999px;
  border: 2px solid;
  font-size: 18px;
  cursor: help;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.artifact-icon:hover {
  transform: scale(1.2);
  box-shadow: 0 0 12px rgba(108, 92, 231, 0.3);
}

.copyright {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-light);
  margin-top: 8px;
}

/* 稀有度样式 */
.rarity-common {
  border-color: var(--color-rarity-common);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.rarity-uncommon {
  border-color: var(--color-rarity-uncommon);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.rarity-rare {
  border-color: var(--color-rarity-rare);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.rarity-epic {
  border-color: var(--color-rarity-epic);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.rarity-legendary {
  border-color: var(--color-rarity-legendary);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
}

.rarity-mythic {
  border-color: var(--color-rarity-mythic);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>

