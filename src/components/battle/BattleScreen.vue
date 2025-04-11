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
            :ref="`player-${index}`"
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
                @mouseover="showBuffTooltip(buff, $event)"
                @mouseleave="hideBuffTooltip"
              >
                {{ getBuffIcon(buff) }}
              </div>
              <div 
                v-for="(debuff, debuffIndex) in hero.debuffs" 
                :key="`debuff-${debuffIndex}`"
                class="debuff"
                :title="debuff.name"
                @mouseover="showDebuffTooltip(debuff, $event)"
                @mouseleave="hideBuffTooltip"
              >
                {{ getDebuffIcon(debuff) }}
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
            <span class="log-message">{{ formatLogMessage(entry.message) }}</span>
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
            :ref="`enemy-${index}`"
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
                @mouseover="showBuffTooltip(buff, $event)"
                @mouseleave="hideBuffTooltip"
              >
                {{ getBuffIcon(buff) }}
              </div>
              <div 
                v-for="(debuff, debuffIndex) in enemy.debuffs" 
                :key="`debuff-${debuffIndex}`"
                class="debuff"
                :title="debuff.name"
                @mouseover="showDebuffTooltip(debuff, $event)"
                @mouseleave="hideBuffTooltip"
              >
                {{ getDebuffIcon(debuff) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 攻击动画效果 -->
      <div v-if="attackAnimation.active" class="attack-animation" :class="attackAnimation.type">
        <div 
          class="attack-projectile" 
          :style="{
            left: attackAnimation.startX + 'px',
            top: attackAnimation.startY + 'px',
            '--end-x': attackAnimation.endX + 'px',
            '--end-y': attackAnimation.endY + 'px',
            '--type-color': getAttackColor(attackAnimation.type)
          }"
        >
          {{ getAttackIcon(attackAnimation.type) }}
        </div>
      </div>
      
      <!-- 伤害数字显示 -->
      <div v-for="(damageNumber, index) in damageNumbers" :key="`damage-${index}`" 
        class="damage-number" 
        :class="damageNumber.type"
        :style="{
          left: damageNumber.x + 'px',
          top: damageNumber.y + 'px',
          '--value': `'${damageNumber.value}'`
        }"
      >
        {{ damageNumber.value }}
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
    
    <!-- 技能和Buff提示框 -->
    <div v-if="activeTooltip" class="tooltip" :style="tooltipStyle">
      <div class="tooltip-title" :class="activeTooltip.type">{{ activeTooltip.name }}</div>
      <div class="tooltip-description">{{ activeTooltip.description }}</div>
      <div v-if="activeTooltip.effects" class="tooltip-effects">
        <div v-for="(effect, index) in activeTooltip.effects" :key="index" class="tooltip-effect">
          {{ effect }}
        </div>
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
      goldReward: 0,
      activeTooltip: null,
      tooltipStyle: {},
      attackAnimation: {
        active: false,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        type: 'physical'  // 物理、法术、治疗等
      },
      damageNumbers: []  // 用于显示伤害数字
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
      
      // 检查是否有角色执行攻击，并播放攻击动画
      if (updatedState.battleState.lastAction && updatedState.battleState.lastAction.type === 'attack') {
        this.playAttackAnimation(
          updatedState.battleState.lastAction.source,
          updatedState.battleState.lastAction.target,
          updatedState.battleState.lastAction.skill?.type || 'physical',
          updatedState.battleState.lastAction.damage
        );
      }
      
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
    },
    
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
        left: event.clientX + 'px',
        top: event.clientY + 'px'
      };
    },
    
    // 新增：根据技能名称推断类型
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
    
    hideSkillTooltip() {
      this.activeTooltip = null;
    },
    
    getSkillIcon(skill) {
      // 如果是字符串，则将其转换为对象
      if (typeof skill === 'string') {
        return this.getSkillIconByType(this.inferSkillType(skill));
      }
      
      // 如果有类型，则直接使用
      if (skill.type) {
        return this.getSkillIconByType(skill.type);
      }
      
      // 根据名称推断类型
      return this.getSkillIconByType(this.inferSkillType(skill.name));
    },
    
    // 新增：根据类型获取图标
    getSkillIconByType(type) {
      // 根据技能类型返回不同的图标
      if (type === 'attack') return '🗡️';
      if (type === 'magic') return '🔮';
      if (type === 'fire') return '🔥';
      if (type === 'ice') return '❄️';
      if (type === 'heal') return '💚';
      if (type === 'buff') return '⬆️';
      if (type === 'debuff') return '⬇️';
      if (type === 'lightning') return '⚡';
      if (type === 'dark') return '🌑';
      if (type === 'light') return '✨';
      return '⚔️';
    },
    
    showBuffTooltip(buff, event) {
      // 确保即使数据不完整也能显示合理的描述
      const description = buff.description || this.getBuffDefaultDescription(buff);
      const effects = buff.effects || this.getBuffDefaultEffects(buff);
      
      this.activeTooltip = {
        name: buff.name || '未知增益',
        description: description,
        type: 'buff',
        effects: effects
      };
      
      this.tooltipStyle = {
        left: event.clientX + 'px',
        top: event.clientY + 'px'
      };
    },
    
    // 根据buff名称生成默认描述
    getBuffDefaultDescription(buff) {
      const name = buff.name || '';
      
      if (name.includes('力量') || name.includes('强化')) {
        return '增加角色的攻击力，使物理攻击造成更多伤害。';
      } else if (name.includes('防御') || name.includes('坚固')) {
        return '增加角色的防御力，减少受到的物理伤害。';
      } else if (name.includes('敏捷') || name.includes('迅捷')) {
        return '增加角色的攻击速度和闪避几率。';
      } else if (name.includes('智力') || name.includes('智慧')) {
        return '增加角色的魔法攻击力和魔法防御力。';
      } else if (name.includes('再生') || name.includes('恢复')) {
        return '角色每回合自动恢复少量生命值。';
      }
      
      return `增益效果：${name}。提高角色的战斗能力。`;
    },
    
    // 根据buff类型生成默认效果
    getBuffDefaultEffects(buff) {
      const name = buff.name || '';
      const effects = [];
      
      if (name.includes('力量') || name.includes('强化')) {
        effects.push('攻击力 +20%');
        effects.push('暴击伤害 +10%');
      } else if (name.includes('防御') || name.includes('坚固')) {
        effects.push('防御力 +25%');
        effects.push('受到的伤害 -15%');
      } else if (name.includes('敏捷') || name.includes('迅捷')) {
        effects.push('攻击速度 +15%');
        effects.push('闪避几率 +10%');
      } else if (name.includes('智力') || name.includes('智慧')) {
        effects.push('魔法攻击力 +20%');
        effects.push('魔法防御力 +15%');
      } else if (name.includes('再生') || name.includes('恢复')) {
        effects.push('每回合恢复 5% 最大生命值');
      } else {
        effects.push('提高角色战斗能力');
        effects.push('持续数个回合');
      }
      
      return effects;
    },
    
    hideBuffTooltip() {
      this.activeTooltip = null;
    },
    
    getBuffIcon(buff) {
      // 根据buff类型返回不同的图标
      if (buff.type === 'attack') return '🗡️';
      if (buff.type === 'heal') return '✨';
      if (buff.type === 'buff') return '+';
      if (buff.type === 'debuff') return '-';
      return '👤';
    },
    
    showDebuffTooltip(debuff, event) {
      // 确保即使数据不完整也能显示合理的描述
      const description = debuff.description || this.getDebuffDefaultDescription(debuff);
      const effects = debuff.effects || this.getDebuffDefaultEffects(debuff);
      
      this.activeTooltip = {
        name: debuff.name || '未知减益',
        description: description,
        type: 'debuff',
        effects: effects
      };
      
      this.tooltipStyle = {
        left: event.clientX + 'px',
        top: event.clientY + 'px'
      };
    },
    
    // 根据debuff名称生成默认描述
    getDebuffDefaultDescription(debuff) {
      const name = debuff.name || '';
      
      if (name.includes('虚弱') || name.includes('衰弱')) {
        return '降低角色的攻击力，使物理攻击造成更少伤害。';
      } else if (name.includes('破甲') || name.includes('护甲降低')) {
        return '降低角色的防御力，增加受到的物理伤害。';
      } else if (name.includes('迟缓') || name.includes('减速')) {
        return '降低角色的攻击速度和闪避几率。';
      } else if (name.includes('混乱') || name.includes('沉默')) {
        return '降低角色的魔法攻击力或阻止释放特定技能。';
      } else if (name.includes('中毒') || name.includes('灼烧')) {
        return '角色每回合自动损失生命值。';
      }
      
      return `减益效果：${name}。降低角色的战斗能力。`;
    },
    
    // 根据debuff类型生成默认效果
    getDebuffDefaultEffects(debuff) {
      const name = debuff.name || '';
      const effects = [];
      
      if (name.includes('虚弱') || name.includes('衰弱')) {
        effects.push('攻击力 -20%');
        effects.push('暴击伤害 -15%');
      } else if (name.includes('破甲') || name.includes('护甲降低')) {
        effects.push('防御力 -25%');
        effects.push('受到的伤害 +20%');
      } else if (name.includes('迟缓') || name.includes('减速')) {
        effects.push('攻击速度 -20%');
        effects.push('闪避几率 -15%');
      } else if (name.includes('混乱') || name.includes('沉默')) {
        effects.push('无法使用特殊技能');
        effects.push('魔法攻击力 -30%');
      } else if (name.includes('中毒') || name.includes('灼烧')) {
        effects.push('每回合损失 8% 最大生命值');
      } else {
        effects.push('降低角色战斗能力');
        effects.push('持续数个回合');
      }
      
      return effects;
    },
    
    hideDebuffTooltip() {
      this.activeTooltip = null;
    },
    
    getDebuffIcon(debuff) {
      // 根据debuff类型返回不同的图标
      if (debuff.type === 'attack') return '🗡️';
      if (debuff.type === 'heal') return '✨';
      if (debuff.type === 'buff') return '+';
      if (debuff.type === 'debuff') return '-';
      return '👤';
    },
    
    // 改进：获取角色在DOM中的实际位置
    getCharacterPosition(character) {
      // 查找角色元素引用
      let ref = null;
      
      // 在玩家队伍中查找
      const playerIndex = this.playerTeam.findIndex(p => p === character);
      if (playerIndex !== -1) {
        ref = this.$refs[`player-${playerIndex}`];
      } else {
        // 在敌方队伍中查找
        const enemyIndex = this.enemyTeam.findIndex(e => e === character);
        if (enemyIndex !== -1) {
          ref = this.$refs[`enemy-${enemyIndex}`];
        }
      }
      
      // 如果找到了引用，获取其位置
      if (ref && ref[0]) {
        const rect = ref[0].getBoundingClientRect();
        const parentRect = this.$el.getBoundingClientRect();
        
        return {
          x: rect.left - parentRect.left + rect.width / 2,
          y: rect.top - parentRect.top + rect.height / 2
        };
      }
      
      // 如果没有找到，返回一个默认位置
      return {
        x: Math.random() * 300 + 100,
        y: Math.random() * 200 + 100
      };
    },
    
    // 获取攻击类型的颜色
    getAttackColor(type) {
      switch (type) {
        case 'physical': return 'rgba(190, 190, 190, 0.8)'; // 灰色
        case 'magic': return 'rgba(147, 112, 219, 0.8)'; // 紫色
        case 'fire': return 'rgba(255, 69, 0, 0.8)'; // 红色
        case 'ice': return 'rgba(135, 206, 250, 0.8)'; // 蓝色
        case 'heal': return 'rgba(144, 238, 144, 0.8)'; // 绿色
        default: return 'rgba(255, 255, 255, 0.8)'; // 白色
      }
    },
    
    // 新增：播放攻击动画
    playAttackAnimation(source, target, attackType, damage) {
      // 获取角色DOM元素位置
      this.$nextTick(() => {
        const sourcePosition = this.getCharacterPosition(source);
        const targetPosition = this.getCharacterPosition(target);
        
        if (sourcePosition && targetPosition) {
          // 判断攻击类型
          let animationType = attackType;
          if (!['physical', 'magic', 'fire', 'ice', 'heal'].includes(attackType)) {
            // 根据攻击类型名称判断属性
            if (attackType.includes('火') || attackType.includes('烈焰')) {
              animationType = 'fire';
            } else if (attackType.includes('冰') || attackType.includes('寒霜')) {
              animationType = 'ice';
            } else if (attackType.includes('法术') || attackType.includes('魔法')) {
              animationType = 'magic';
            } else if (attackType.includes('治疗') || attackType.includes('恢复')) {
              animationType = 'heal';
            } else {
              animationType = 'physical';
            }
          }
          
          // 设置动画起点和终点
          this.attackAnimation = {
            active: true,
            startX: sourcePosition.x,
            startY: sourcePosition.y,
            endX: targetPosition.x,
            endY: targetPosition.y,
            type: animationType
          };
          
          // 动画结束后显示伤害数字
          setTimeout(() => {
            this.attackAnimation.active = false;
            
            // 判断是否是暴击
            const isCritical = Math.random() < 0.3; // 简单示例，实际应该基于角色属性
            
            // 添加伤害数字
            this.damageNumbers.push({
              value: isCritical ? `${damage} 暴击!` : damage,
              x: targetPosition.x,
              y: targetPosition.y,
              type: animationType === 'heal' ? 'heal' : (isCritical ? 'critical' : 'damage')
            });
            
            // 震动目标角色效果
            if (animationType !== 'heal') {
              const targetRef = this.getCharacterRef(target);
              if (targetRef && targetRef[0]) {
                // 添加震动类
                targetRef[0].classList.add('character-hit');
                
                // 移除震动类
                setTimeout(() => {
                  targetRef[0].classList.remove('character-hit');
                }, 500);
              }
            }
            
            // 伤害数字消失
            setTimeout(() => {
              this.damageNumbers.shift();
            }, 800);
          }, 500);
        }
      });
    },
    
    // 获取角色引用
    getCharacterRef(character) {
      // 在玩家队伍中查找
      const playerIndex = this.playerTeam.findIndex(p => p === character);
      if (playerIndex !== -1) {
        return this.$refs[`player-${playerIndex}`];
      } else {
        // 在敌方队伍中查找
        const enemyIndex = this.enemyTeam.findIndex(e => e === character);
        if (enemyIndex !== -1) {
          return this.$refs[`enemy-${enemyIndex}`];
        }
      }
      return null;
    },
    
    // 获取攻击类型的图标
    getAttackIcon(type) {
      switch (type) {
        case 'physical': return '⚔️';
        case 'magic': return '🔮';
        case 'fire': return '🔥';
        case 'ice': return '❄️';
        case 'heal': return '✨';
        case 'poison': return '☠️';
        case 'lightning': return '⚡';
        case 'earth': return '🌋';
        case 'wind': return '🌪️';
        case 'water': return '💧';
        case 'dark': return '🌑';
        case 'light': return '☀️';
        default: return '⚔️';
      }
    },
    
    formatLogMessage(message) {
      // 处理消息中的对象，例如技能对象
      if (message === null || message === undefined) {
        return '';
      }
      
      if (typeof message === 'object') {
        // 如果是技能对象
        if (message.name) {
          return message.name;
        }
        
        // 尝试将对象转为字符串
        try {
          return JSON.stringify(message);
        } catch (e) {
          return '[对象]';
        }
      }
      
      return message;
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
  opacity: 0.5;
  filter: grayscale(100%);
  transform: rotate(5deg);
  transition: all 0.5s ease;
}

.character.taking-action {
  border-color: var(--color-primary);
  background-color: var(--color-bg);
  box-shadow: 0 0 12px rgba(108, 92, 231, 0.5);
  animation: pulse 1.5s infinite alternate;
  transform: translateY(-5px);
  z-index: 5;
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

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-left: 4px;
  max-width: 60px;
}

.skill-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.8rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.skill-icon:hover {
  transform: scale(1.2);
  z-index: 5;
}

.skill-icon.attack {
  background-color: rgba(245, 101, 101, 0.2);
  color: #f56565;
}

.skill-icon.heal {
  background-color: rgba(72, 187, 120, 0.2);
  color: #48bb78;
}

.skill-icon.buff {
  background-color: rgba(66, 153, 225, 0.2);
  color: #4299e1;
}

.skill-icon.debuff {
  background-color: rgba(159, 122, 234, 0.2);
  color: #9f7aea;
}

.buffs-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-left: 4px;
  max-width: 60px;
}

.buff, .debuff {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.8rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
}

.buff:hover, .debuff:hover {
  transform: scale(1.2);
  z-index: 5;
}

.buff {
  background-color: rgba(72, 187, 120, 0.2);
  color: #48bb78;
  border: 1px solid rgba(72, 187, 120, 0.5);
}

.debuff {
  background-color: rgba(245, 101, 101, 0.2);
  color: #f56565;
  border: 1px solid rgba(245, 101, 101, 0.5);
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

.tooltip {
  position: fixed;
  background-color: var(--color-bg-light);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 300px;
  animation: tooltip-fade 0.2s ease;
}

@keyframes tooltip-fade {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltip-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--color-border);
}

.tooltip-title.attack {
  color: #f56565;
}

.tooltip-title.heal {
  color: #48bb78;
}

.tooltip-title.buff {
  color: #4299e1;
}

.tooltip-title.debuff {
  color: #9f7aea;
}

.tooltip-description {
  color: var(--color-text);
  margin-bottom: 16px;
  line-height: 1.5;
}

.tooltip-effects {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tooltip-effect {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.9rem;
}

/* 改进攻击动画效果样式 */
.attack-animation {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.attack-projectile {
  position: absolute;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.2rem;
  background-color: var(--type-color, rgba(255, 255, 255, 0.2));
  box-shadow: 0 0 15px var(--type-color, rgba(255, 255, 255, 0.6));
  transform: translate(-50%, -50%);
  animation: attack-projectile 0.5s cubic-bezier(0.075, 0.82, 0.165, 1) forwards;
  z-index: 10;
}

@keyframes attack-projectile {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    transform: translate(calc(var(--end-x) - var(--start-x) - 0px), calc(var(--end-y) - var(--start-y) - 0px)) scale(1);
    opacity: 0;
  }
}

/* 为不同攻击类型添加特殊效果 */
.attack-projectile.physical {
  background-color: rgba(190, 190, 190, 0.3);
  box-shadow: 0 0 15px rgba(190, 190, 190, 0.6);
}

.attack-projectile.magic {
  background-color: rgba(147, 112, 219, 0.3);
  box-shadow: 0 0 15px rgba(147, 112, 219, 0.6);
  animation: attack-projectile 0.6s cubic-bezier(0.075, 0.82, 0.165, 1) forwards, magic-glow 1.5s infinite alternate;
}

.attack-projectile.fire {
  background-color: rgba(255, 69, 0, 0.3);
  box-shadow: 0 0 15px rgba(255, 69, 0, 0.6);
  animation: attack-projectile 0.7s cubic-bezier(0.075, 0.82, 0.165, 1) forwards, fire-burn 0.5s infinite alternate;
}

.attack-projectile.ice {
  background-color: rgba(135, 206, 250, 0.3);
  box-shadow: 0 0 15px rgba(135, 206, 250, 0.6);
  animation: attack-projectile 0.9s cubic-bezier(0.075, 0.82, 0.165, 1) forwards, ice-shine 2s infinite linear;
}

.attack-projectile.heal {
  background-color: rgba(144, 238, 144, 0.3);
  box-shadow: 0 0 15px rgba(144, 238, 144, 0.6);
  animation: attack-projectile 0.8s cubic-bezier(0.075, 0.82, 0.165, 1) forwards, heal-pulse 1.5s infinite alternate;
}

@keyframes magic-glow {
  0% {
    box-shadow: 0 0 10px rgba(147, 112, 219, 0.6);
  }
  100% {
    box-shadow: 0 0 25px rgba(147, 112, 219, 0.8);
  }
}

@keyframes fire-burn {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 10px rgba(255, 69, 0, 0.6);
  }
  100% {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(255, 69, 0, 0.8);
  }
}

@keyframes ice-shine {
  0% {
    box-shadow: 0 0 15px rgba(135, 206, 250, 0.6);
  }
  50% {
    box-shadow: 0 0 25px rgba(135, 206, 250, 0.8), inset 0 0 10px white;
  }
  100% {
    box-shadow: 0 0 15px rgba(135, 206, 250, 0.6);
  }
}

@keyframes heal-pulse {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 15px rgba(144, 238, 144, 0.6);
  }
  100% {
    transform: scale(1.1);
    box-shadow: 0 0 25px rgba(144, 238, 144, 0.8), 0 0 40px rgba(144, 238, 144, 0.4);
  }
}

/* 改进伤害数字显示样式 */
.damage-number {
  position: absolute;
  padding: 6px 10px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 1.2rem;
  transform: translate(-50%, -50%);
  animation: damage-number-animation 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  z-index: 20;
}

.damage-number.damage {
  color: #ef4444;
  text-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
}

.damage-number.heal {
  color: #22c55e;
  text-shadow: 0 0 5px rgba(34, 197, 94, 0.5);
}

.damage-number.critical {
  color: #f97316;
  font-size: 1.5rem;
  font-weight: 800;
  text-shadow: 0 0 8px rgba(249, 115, 22, 0.7);
  animation: damage-critical-animation 1s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

@keyframes damage-number-animation {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -100%) scale(1.2);
    opacity: 1;
  }
  80% {
    transform: translate(-50%, -120%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -140%) scale(0.8);
    opacity: 0;
  }
}

@keyframes damage-critical-animation {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -120%) scale(1.5);
    opacity: 1;
  }
  60% {
    transform: translate(-50%, -140%) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -160%) scale(0.8);
    opacity: 0;
  }
}

/* 被击中效果 */
@keyframes character-hit-animation {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  50% {
    transform: translateX(5px);
  }
  75% {
    transform: translateX(-2px);
  }
  100% {
    transform: translateX(0);
  }
}

.character-hit {
  animation: character-hit-animation 0.4s ease-in-out;
  filter: brightness(1.2);
}

/* 治疗效果 */
@keyframes character-heal-animation {
  0% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3) hue-rotate(60deg);
  }
  100% {
    filter: brightness(1);
  }
}

.character-heal {
  animation: character-heal-animation 0.8s ease-in-out;
}
</style> 