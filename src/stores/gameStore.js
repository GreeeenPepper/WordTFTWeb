import { defineStore } from 'pinia'

/**
 * 游戏核心状态管理
 * 负责管理游戏的全局状态，包括金币、层数、英雄、怪物等
 */
export const useGameStore = defineStore('game', {
  state: () => ({
    // 游戏基础数据
    gold: 100,          // 当前金币
    level: 1,           // 当前层级
    stage: 'prepare',   // 游戏阶段: prepare(准备), battle(战斗), reward(奖励)
    health: 100,        // 玩家生命值
    maxHealth: 100,     // 最大生命值
    
    // 英雄相关
    heroes: [],         // 玩家拥有的英雄列表
    heroShop: [],       // 商店英雄列表
    maxHeroes: 5,       // 最大英雄数量
    
    // 战斗相关
    enemies: [],        // 当前战斗的敌人
    battleLog: [],      // 战斗日志
    battleResult: null, // 战斗结果
    
    // 元进度相关
    metaProgress: {
      totalGoldEarned: 0,
      highestLevel: 1,
      defeatedEnemies: 0,
      unlockedHeroes: [],
      unlockedArtifacts: []
    },
    
    // 神器/buff相关
    artifacts: [],      // 拥有的神器
  }),
  
  getters: {
    // 计算当前战力
    totalPower: (state) => {
      return state.heroes.reduce((total, hero) => total + hero.power, 0)
    },
    
    // 是否可以进入战斗
    canStartBattle: (state) => {
      return state.heroes.length > 0 && state.stage === 'prepare'
    },
    
    // 是否可以升级商店
    canRefreshShop: (state) => {
      return state.gold >= 2 && state.stage === 'prepare'
    }
  },
  
  actions: {
    /**
     * 初始化游戏
     */
    initGame() {
      this.gold = 100
      this.level = 1
      this.stage = 'prepare'
      this.health = 100
      this.maxHealth = 100
      this.heroes = []
      this.refreshHeroShop()
      this.enemies = []
      this.battleLog = []
      this.battleResult = null
      this.artifacts = []
    },
    
    /**
     * 刷新英雄商店
     */
    refreshHeroShop() {
      // 这里会根据当前层级生成适合的英雄池
      // TODO: 实现真正的英雄生成逻辑
      this.gold -= 2
      this.heroShop = [/* 刷新商店逻辑 */]
    },
    
    /**
     * 购买英雄
     * @param {Number} index 商店中英雄的索引
     */
    buyHero(index) {
      const hero = this.heroShop[index]
      if (hero && this.gold >= hero.cost && this.heroes.length < this.maxHeroes) {
        this.gold -= hero.cost
        this.heroes.push(hero)
        this.heroShop.splice(index, 1)
      }
    },
    
    /**
     * 卖出英雄
     * @param {Number} index 英雄索引
     */
    sellHero(index) {
      const hero = this.heroes[index]
      if (hero) {
        this.gold += Math.floor(hero.cost / 2)
        this.heroes.splice(index, 1)
      }
    },
    
    /**
     * 开始战斗
     */
    startBattle() {
      this.stage = 'battle'
      this.generateEnemies()
      // 实际战斗逻辑将在battleSystem中实现
    },
    
    /**
     * 生成敌人
     */
    generateEnemies() {
      // 根据当前层级生成敌人
      // TODO: 实现真正的敌人生成逻辑
      this.enemies = [/* 生成敌人逻辑 */]
    },
    
    /**
     * 处理战斗结果
     * @param {Boolean} isVictory 是否胜利
     */
    processBattleResult(isVictory) {
      this.battleResult = isVictory
      
      if (isVictory) {
        // 胜利奖励
        const goldReward = 10 + this.level * 5
        this.gold += goldReward
        this.level += 1
        this.metaProgress.highestLevel = Math.max(this.metaProgress.highestLevel, this.level)
        this.metaProgress.totalGoldEarned += goldReward
        this.metaProgress.defeatedEnemies += this.enemies.length
      } else {
        // 失败惩罚
        this.health -= 10
        if (this.health <= 0) {
          this.gameOver()
        }
      }
      
      this.stage = 'reward'
    },
    
    /**
     * 进入下一层
     */
    goToNextLevel() {
      this.stage = 'prepare'
      this.refreshHeroShop()
    },
    
    /**
     * 游戏结束
     */
    gameOver() {
      // 处理游戏结束逻辑，记录成就等
      console.log('Game Over at level', this.level)
    }
  }
}) 