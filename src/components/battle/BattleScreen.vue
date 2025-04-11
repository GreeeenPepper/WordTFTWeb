<template>
  <div class="battle-screen">
    <div class="battle-header">
      <h2 class="battle-title">第{{ level }}层 - 战斗</h2>
      <div class="battle-controls">
        <button 
          class="btn-speed" 
          @click="toggleSpeed"
          :class="{ 'active': battleSpeed > 1 }"
        >
          {{ battleSpeed > 1 ? '2x' : '1x' }}
        </button>
        <button 
          class="btn-auto" 
          @click="toggleAutoBattle"
          :class="{ 'active': isAutoBattle }"
        >
          {{ isAutoBattle ? '暂停' : '自动战斗' }}
        </button>
      </div>
    </div>
    
    <div class="battle-area">
      <div class="team player-team">
        <h3 class="team-title">我方队伍</h3>
        <div class="characters">
          <div 
            v-for="(hero, index) in playerTeam" 
            :key="`hero-${index}`"
            class="character"
            :class="{ 
              'active': isFighting(hero), 
              'dead': isDead(hero),
              'taking-action': isCurrentFighter(hero)
            }"
          >
            <div class="character-portrait">
              <div class="character-icon">{{ getCharacterEmoji(hero) }}</div>
              <div class="character-health-bar">
                <div 
                  class="health-fill" 
                  :style="{ 
                    width: `${getHealthPercentage(hero)}%`,
                    backgroundColor: getHealthColor(hero)
                  }"
                ></div>
              </div>
            </div>
            <div class="character-info">
              <div class="character-name">{{ hero.name }}</div>
              <div class="character-health">
                {{ Math.round(hero.currentHp) }}/{{ Math.round(hero.stats.hp) }}
              </div>
            </div>
            
            <div class="buffs-container">
              <div 
                v-for="(buff, buffIndex) in hero.buffs" 
                :key="`buff-${buffIndex}`"
                class="buff"
                :title="buff.name"
              >
                +
              </div>
              <div 
                v-for="(debuff, debuffIndex) in hero.debuffs" 
                :key="`debuff-${debuffIndex}`"
                class="debuff"
                :title="debuff.name"
              >
                -
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="battle-log">
        <h3 class="log-title">战斗日志</h3>
        <div class="log-container" ref="logContainer">
          <div 
            v-for="(entry, index) in battleLogOrdered" 
            :key="`log-${index}`"
            class="log-entry"
            :class="`type-${entry.type}`"
          >
            <span class="log-turn" v-if="entry.type === 'turn'">[回合 {{ entry.turn }}]</span>
            <span class="log-message">{{ entry.message }}</span>
          </div>
        </div>
      </div>
      
      <div class="team enemy-team">
        <h3 class="team-title">敌方队伍</h3>
        <div class="characters">
          <div 
            v-for="(enemy, index) in enemyTeam" 
            :key="`enemy-${index}`"
            class="character"
            :class="{ 
              'active': isFighting(enemy), 
              'dead': isDead(enemy),
              'taking-action': isCurrentFighter(enemy)
            }"
          >
            <div class="character-portrait">
              <div class="character-icon">{{ getCharacterEmoji(enemy) }}</div>
              <div class="character-health-bar">
                <div 
                  class="health-fill" 
                  :style="{ 
                    width: `${getHealthPercentage(enemy)}%`,
                    backgroundColor: getHealthColor(enemy)
                  }"
                ></div>
              </div>
            </div>
            <div class="character-info">
              <div class="character-name">{{ enemy.name }}</div>
              <div class="character-health">
                {{ Math.round(enemy.currentHp) }}/{{ Math.round(enemy.stats.hp) }}
              </div>
            </div>
            
            <div class="buffs-container">
              <div 
                v-for="(buff, buffIndex) in enemy.buffs" 
                :key="`buff-${buffIndex}`"
                class="buff"
                :title="buff.name"
              >
                +
              </div>
              <div 
                v-for="(debuff, debuffIndex) in enemy.debuffs" 
                :key="`debuff-${debuffIndex}`"
                class="debuff"
                :title="debuff.name"
              >
                -
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="battleResult" class="battle-result">
      <div class="result-container" :class="battleResult === 'victory' ? 'victory' : 'defeat'">
        <h2 class="result-title">{{ battleResult === 'victory' ? '胜利！' : '失败！' }}</h2>
        <p class="result-desc">
          {{ 
            battleResult === 'victory' 
            ? `你击败了所有敌人，获得了 ${goldReward} 金币！` 
            : '你的队伍被击败了...'
          }}
        </p>
        <button class="btn-continue" @click="continueBattle">
          {{ battleResult === 'victory' ? '继续冒险' : '返回准备' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { BattleManager } from '../../utils/battleSystem';

export default {
  name: 'BattleScreen',
  
  props: {
    level: {
      type: Number,
      required: true
    },
    playerHeroes: {
      type: Array,
      required: true
    },
    enemies: {
      type: Array,
      required: true
    }
  },
  
  data() {
    return {
      battleManager: null,
      playerTeam: [],
      enemyTeam: [],
      battleLog: [],
      battleState: {},
      animationFrame: null,
      lastUpdateTime: 0,
      updateInterval: 500, // 战斗更新间隔（毫秒）
      battleSpeed: 1,
      isAutoBattle: true,
      battleResult: null, // 'victory' 或 'defeat'
      goldReward: 0
    };
  },
  
  mounted() {
    this.initBattle();
  },
  
  beforeUnmount() {
    this.stopBattleLoop();
  },
  
  computed: {
    battleLogOrdered() {
      // 返回战斗日志，保持原始顺序（旧消息在上，新消息在下）
      return [...this.battleLog];
    }
  },
  
  methods: {
    initBattle() {
      // 创建战斗管理器
      this.battleManager = new BattleManager(
        this.playerHeroes,
        this.enemies
      );
      
      // 开始战斗
      const initialState = this.battleManager.startBattle();
      this.playerTeam = initialState.playerTeam;
      this.enemyTeam = initialState.enemyTeam;
      this.battleState = initialState.battleState;
      this.battleLog = initialState.battleState.battleLog;
      
      // 开始战斗循环
      this.startBattleLoop();
    },
    
    startBattleLoop() {
      this.lastUpdateTime = Date.now();
      this.animationFrame = requestAnimationFrame(this.battleLoop);
    },
    
    stopBattleLoop() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
    },
    
    battleLoop() {
      const currentTime = Date.now();
      const elapsedTime = currentTime - this.lastUpdateTime;
      
      // 如果已经结束战斗，不再更新
      if (this.battleResult) {
        return;
      }
      
      // 根据战斗速度和是否自动战斗决定更新频率
      if (this.isAutoBattle && elapsedTime >= this.updateInterval / this.battleSpeed) {
        this.lastUpdateTime = currentTime;
        this.updateBattle();
      }
      
      this.animationFrame = requestAnimationFrame(this.battleLoop);
    },
    
    updateBattle() {
      // 更新战斗状态
      const updatedState = this.battleManager.update();
      this.playerTeam = updatedState.playerTeam;
      this.enemyTeam = updatedState.enemyTeam;
      this.battleState = updatedState.battleState;
      this.battleLog = updatedState.battleState.battleLog;
      
      // 滚动日志到底部，因为新消息在底部显示
      this.$nextTick(() => {
        if (this.$refs.logContainer) {
          this.$refs.logContainer.scrollTop = this.$refs.logContainer.scrollHeight;
        }
      });
      
      // 检查战斗结果
      if (this.battleState.victoryState) {
        this.handleBattleEnd(this.battleState.victoryState);
      }
    },
    
    handleBattleEnd(result) {
      this.battleResult = result;
      
      if (result === 'victory') {
        // 计算胜利奖励
        this.goldReward = 10 + this.level * 5;
      }
    },
    
    continueBattle() {
      // 发送战斗结果事件
      this.$emit('battle-end', {
        result: this.battleResult,
        goldReward: this.battleResult === 'victory' ? this.goldReward : 0
      });
    },
    
    toggleSpeed() {
      this.battleSpeed = this.battleSpeed === 1 ? 2 : 1;
    },
    
    toggleAutoBattle() {
      this.isAutoBattle = !this.isAutoBattle;
      
      if (this.isAutoBattle) {
        this.lastUpdateTime = Date.now(); // 重置时间，立即触发一次更新
      }
    },
    
    getCharacterEmoji(character) {
      // 根据角色类型返回不同的表情符号
      if (character.isHero) {
        if (character.class.includes('战士')) return '⚔️';
        if (character.class.includes('法师')) return '🔮';
        if (character.class.includes('牧师')) return '✨';
        if (character.class.includes('盗贼')) return '🗡️';
        if (character.class.includes('游侠')) return '🏹';
        return '👤';
      } else {
        if (character.name.includes('哥布林')) return '👺';
        if (character.name.includes('骷髅')) return '💀';
        if (character.name.includes('巨魔')) return '👹';
        if (character.name.includes('恶魔')) return '👿';
        if (character.name.includes('元素')) return '🔥';
        return '👾';
      }
    },
    
    getHealthPercentage(character) {
      return Math.max(0, Math.min(100, (character.currentHp / character.stats.hp) * 100));
    },
    
    getHealthColor(character) {
      const healthPercent = this.getHealthPercentage(character);
      if (healthPercent > 60) return '#4CAF50';
      if (healthPercent > 30) return '#FFC107';
      return '#F44336';
    },
    
    isDead(character) {
      return character.currentHp <= 0;
    },
    
    isFighting(character) {
      return character.currentHp > 0;
    },
    
    isCurrentFighter(character) {
      return this.battleState.activeFighter === character;
    }
  }
}
</script>

<style scoped>
.battle-screen {
  width: 100%;
  background-color: var(--color-bg-light);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  min-height: 600px;
  border: 1px solid var(--color-border);
}

.battle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: var(--color-bg-lighter);
  border-bottom: 1px solid var(--color-border);
}

.battle-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
}

.battle-controls {
  display: flex;
  gap: 8px;
}

.btn-speed, .btn-auto {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-speed.active, .btn-auto.active {
  background-color: var(--color-primary);
  color: white;
}

.battle-area {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr; /* Left team, battle log, right team */
  gap: 16px;
  padding: 16px;
  min-height: 500px;
}

.team {
  background-color: var(--color-bg-lighter);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.team-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
  text-align: center;
}

.player-team .team-title {
  color: #4299e1; /* Blue for player team */
}

.enemy-team .team-title {
  color: #f56565; /* Red for enemy team */
}

.player-team {
  border-left: 4px solid #4299e1; /* Blue border for player team */
}

.enemy-team {
  border-right: 4px solid #f56565; /* Red border for enemy team */
}

.characters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.character {
  display: flex;
  align-items: center;
  background-color: var(--color-bg-light);
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  transition: all 0.3s;
  position: relative;
}

.character.active {
  border-color: var(--color-primary);
}

.character.dead {
  opacity: 0.6;
  filter: grayscale(100%);
}

.character.taking-action {
  border-color: var(--color-primary);
  background-color: var(--color-bg);
  box-shadow: 0 0 8px rgba(108, 92, 231, 0.4);
  animation: pulse 1.5s infinite alternate;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 8px rgba(108, 92, 231, 0.4);
  }
  100% {
    box-shadow: 0 0 16px rgba(108, 92, 231, 0.7);
  }
}

.character-portrait {
  position: relative;
  margin-right: 12px;
}

.character-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background-color: var(--color-bg-lighter);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.player-team .character-icon {
  background-color: rgba(66, 153, 225, 0.15); /* Blue tint for player */
}

.enemy-team .character-icon {
  background-color: rgba(245, 101, 101, 0.15); /* Red tint for enemy */
}

.character-health-bar {
  width: 40px;
  height: 6px;
  margin-top: 4px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 9999px;
  overflow: hidden;
}

.health-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.character-info {
  flex: 1;
}

.character-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.character-health {
  font-size: 0.8rem;
  color: var(--color-text-light);
}

.buffs-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-left: 4px;
  max-width: 60px;
}

.buff, .debuff {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.75rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.buff {
  background-color: rgba(72, 187, 120, 0.2);
  color: #48bb78;
}

.debuff {
  background-color: rgba(245, 101, 101, 0.2);
  color: #f56565;
}

.battle-log {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-bg-lighter);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.log-title {
  font-size: 1.25rem;
  font-weight: bold;
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-light);
  color: var(--color-text);
}

.log-container {
  padding: 12px;
  overflow-y: auto;
  flex: 1;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  max-height: 460px;
  display: flex;
  flex-direction: column;
}

.log-entry {
  margin-bottom: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  animation: fadeIn 0.3s ease-out;
  position: relative;
  line-height: 1.4;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.log-turn {
  font-weight: bold;
  color: #ecc94b;
  margin-right: 4px;
}

.type-info {
  color: var(--color-text);
  background-color: rgba(255, 255, 255, 0.05);
}

.type-damage {
  color: #f56565;
  background-color: rgba(245, 101, 101, 0.1);
}

.type-heal {
  color: #48bb78;
  background-color: rgba(72, 187, 120, 0.1);
}

.type-critical {
  color: #ed8936;
  font-weight: bold;
  background-color: rgba(237, 137, 54, 0.1);
}

.type-death {
  color: #a0aec0;
  background-color: rgba(160, 174, 192, 0.1);
}

.type-special {
  color: #9f7aea;
  background-color: rgba(159, 122, 234, 0.1);
}

.type-victory, .type-defeat {
  color: #ecc94b;
  font-weight: bold;
  background-color: rgba(236, 201, 75, 0.1);
}

.battle-result {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.result-container {
  background-color: var(--color-bg-light);
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.result-container.victory {
  border: 4px solid #48bb78;
}

.result-container.defeat {
  border: 4px solid #f56565;
}

.result-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 16px;
}

.victory .result-title {
  color: #48bb78;
}

.defeat .result-title {
  color: #f56565;
}

.result-desc {
  color: var(--color-text);
  margin-bottom: 24px;
}

.btn-continue {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-continue:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .battle-area {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  
  .log-container {
    max-height: 250px;
  }
}
</style> 