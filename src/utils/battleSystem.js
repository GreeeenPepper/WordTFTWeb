/**
 * 战斗系统
 * 负责处理回合制战斗逻辑，计算伤害，处理战斗结果
 */

/**
 * 战斗管理器
 * 管理整个战斗流程
 */
class BattleManager {
  /**
   * 构造函数
   * @param {Array} playerTeam 玩家英雄队伍
   * @param {Array} enemyTeam 敌人队伍
   */
  constructor(playerTeam, enemyTeam) {
    this.playerTeam = playerTeam.map(hero => ({
      ...hero,
      currentHp: hero.stats.hp,
      team: 'player',
      buffs: [],
      debuffs: [],
      cooldowns: {},
      actionTimer: 0
    }));
    
    this.enemyTeam = enemyTeam.map(enemy => ({
      ...enemy,
      currentHp: enemy.stats.hp,
      team: 'enemy',
      buffs: [],
      debuffs: [],
      cooldowns: {},
      actionTimer: 0
    }));
    
    // 战斗状态
    this.battleState = {
      turn: 0,
      isActive: false,
      isPlayerTurn: true,
      activeFighter: null,
      battleLog: [],
      battleSpeed: 1.0,
      isAutoBattle: false,
      victoryState: null, // null(进行中), 'victory', 'defeat'
    };
  }
  
  /**
   * 开始战斗
   * @returns {Object} 战斗初始状态
   */
  startBattle() {
    this.battleState.isActive = true;
    this.battleState.turn = 1;
    this.battleState.battleLog = [];
    this.battleState.victoryState = null;
    
    // 添加战斗开始日志
    this.addLog('战斗开始！');
    
    // 计算先手顺序
    this.calculateInitiative();
    
    return {
      playerTeam: this.playerTeam,
      enemyTeam: this.enemyTeam,
      battleState: this.battleState
    };
  }
  
  /**
   * 计算先手顺序（基于速度）
   */
  calculateInitiative() {
    // 重置所有单位的行动计时器
    [...this.playerTeam, ...this.enemyTeam].forEach(unit => {
      // 初始行动计时器基于速度的反比
      unit.actionTimer = 100 - unit.stats.spd;
      if (unit.actionTimer < 0) unit.actionTimer = 0;
    });
  }
  
  /**
   * 添加战斗日志
   * @param {String} message 日志消息
   * @param {String} type 日志类型（info, damage, heal, etc）
   */
  addLog(message, type = 'info') {
    this.battleState.battleLog.push({
      turn: this.battleState.turn,
      message,
      type,
      timestamp: new Date().getTime()
    });
    
    // 限制日志最大数量，防止内存占用过多
    if (this.battleState.battleLog.length > 100) {
      this.battleState.battleLog.shift();
    }
  }
  
  /**
   * 更新战斗状态
   * @returns {Object} 更新后的战斗状态
   */
  update() {
    // 如果战斗已结束，不再更新
    if (this.battleState.victoryState) {
      return {
        playerTeam: this.playerTeam,
        enemyTeam: this.enemyTeam,
        battleState: this.battleState
      };
    }
    
    // 检查是否有队伍全灭
    if (this.playerTeam.every(unit => unit.currentHp <= 0)) {
      this.battleState.victoryState = 'defeat';
      this.addLog('玩家队伍全灭，战斗失败！', 'defeat');
      return {
        playerTeam: this.playerTeam,
        enemyTeam: this.enemyTeam,
        battleState: this.battleState
      };
    }
    
    if (this.enemyTeam.every(unit => unit.currentHp <= 0)) {
      this.battleState.victoryState = 'victory';
      this.addLog('敌人队伍全灭，战斗胜利！', 'victory');
      return {
        playerTeam: this.playerTeam,
        enemyTeam: this.enemyTeam,
        battleState: this.battleState
      };
    }
    
    // 更新行动计时器
    const allUnits = [...this.playerTeam, ...this.enemyTeam].filter(unit => unit.currentHp > 0);
    
    // 找出计时器最低的单位作为当前行动者
    allUnits.sort((a, b) => a.actionTimer - b.actionTimer);
    const activeUnit = allUnits[0];
    
    // 执行当前行动者的行动
    if (activeUnit.actionTimer <= 0) {
      this.executeAction(activeUnit);
      
      // 重置行动计时器
      // 基础行动间隔100，减去速度值（速度越高，行动间隔越短）
      activeUnit.actionTimer = 100 - activeUnit.stats.spd;
      if (activeUnit.actionTimer < 10) activeUnit.actionTimer = 10; // 最小行动间隔
    } else {
      // 所有单位的计时器减少
      const timeStep = Math.min(...allUnits.map(unit => unit.actionTimer)) || 1;
      allUnits.forEach(unit => {
        unit.actionTimer -= timeStep;
      });
    }
    
    // 检查buff/debuff持续时间
    this.updateBuffsAndDebuffs();
    
    // 更新冷却时间
    this.updateCooldowns();
    
    return {
      playerTeam: this.playerTeam,
      enemyTeam: this.enemyTeam,
      battleState: this.battleState
    };
  }
  
  /**
   * 执行角色行动
   * @param {Object} unit 行动单位
   */
  executeAction(unit) {
    // 根据单位的战斗风格决定行动
    this.battleState.activeFighter = unit;
    
    // 获取敌对队伍
    const opposingTeam = unit.team === 'player' ? this.enemyTeam : this.playerTeam;
    const allyTeam = unit.team === 'player' ? this.playerTeam : this.enemyTeam;
    
    // 筛选存活的敌人
    const aliveOpponents = opposingTeam.filter(opponent => opponent.currentHp > 0);
    if (aliveOpponents.length === 0) return; // 没有存活的敌人，跳过
    
    // 根据战斗风格选择目标和行动
    let target = null;
    let action = null;
    
    // 特殊战斗风格处理
    if (unit.combatStyle === '整活型' && Math.random() < 0.3) {
      // 随机选择行动
      const randomActions = ['attack', 'defend', 'special'];
      action = randomActions[Math.floor(Math.random() * randomActions.length)];
      
      // 10%概率自伤
      if (Math.random() < 0.1) {
        target = unit;
        this.addLog(`${unit.name} 开始整活，但失误伤到了自己！`, 'special');
      } else {
        target = aliveOpponents[Math.floor(Math.random() * aliveOpponents.length)];
      }
    } else if (unit.combatStyle === '挂机型' && Math.random() < 0.25) {
      // 25%概率跳过回合
      this.addLog(`${unit.name} 似乎在挂机，跳过了这回合。`, 'special');
      // 给自己添加buff，下回合伤害+100%
      this.addBuff(unit, {
        name: '挂机能量',
        stat: 'atk',
        value: unit.stats.atk,
        duration: 1
      });
      return;
    } else if (unit.combatStyle === '氪金型' && unit.team === 'player') {
      // 可以消耗金币提高伤害
      // 注：实际游戏中需要从玩家资源中扣除金币
      action = 'attack';
      
      // 假设有10%概率触发氪金能力
      if (Math.random() < 0.1) {
        this.addLog(`${unit.name} 氪金提升了战斗力！`, 'special');
        this.addBuff(unit, {
          name: '氪金增幅',
          stat: 'atk',
          value: Math.round(unit.stats.atk * 0.3),
          duration: 2
        });
      }
      
      // 选择目标
      target = this.selectTarget(unit, aliveOpponents);
    } else if (unit.combatStyle === '指挥型') {
      // 增强队友能力
      const aliveAllies = allyTeam.filter(ally => ally.id !== unit.id && ally.currentHp > 0);
      if (aliveAllies.length > 0 && Math.random() < 0.4) {
        // 40%概率使用增益能力
        action = 'support';
        target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
        this.addLog(`${unit.name} 指挥 ${target.name} 增强了战斗力！`, 'buff');
        this.addBuff(target, {
          name: '战术指导',
          stat: 'atk',
          value: Math.round(target.stats.atk * 0.15),
          duration: 3
        });
        return;
      } else {
        action = 'attack';
        target = this.selectTarget(unit, aliveOpponents);
      }
    } else if (unit.combatStyle === '暴怒型' && unit.currentHp < unit.stats.hp * 0.5 && Math.random() < 0.5) {
      // 生命值低于50%，有50%概率暴走
      action = 'attack';
      target = this.selectTarget(unit, aliveOpponents);
      this.addLog(`${unit.name} 暴怒了！攻击力翻倍！`, 'special');
      this.addBuff(unit, {
        name: '暴怒',
        stat: 'atk',
        value: unit.stats.atk,
        duration: 2
      });
    } else {
      // 标准战斗风格处理
      action = this.selectAction(unit);
      target = this.selectTarget(unit, aliveOpponents);
    }
    
    // 执行选择的行动
    switch (action) {
      case 'attack':
        this.performAttack(unit, target);
        break;
      case 'defend':
        this.performDefend(unit);
        break;
      case 'special':
        this.performSpecialAbility(unit, target);
        break;
      default:
        this.performAttack(unit, target);
    }
    
    // 更新回合计数（当所有单位都行动过一次）
    const allActed = [...this.playerTeam, ...this.enemyTeam]
      .filter(u => u.currentHp > 0)
      .every(u => u.actionTimer > 0);
      
    if (allActed) {
      this.battleState.turn++;
      this.addLog(`第 ${this.battleState.turn} 回合开始`, 'turn');
    }
  }
  
  /**
   * 选择行动类型
   * @param {Object} unit 行动单位
   * @returns {String} 行动类型 (attack, defend, special)
   */
  selectAction(unit) {
    // 根据角色特性和当前状态选择行动
    
    // 如果生命值低，优先防御
    if (unit.currentHp < unit.stats.hp * 0.3 && Math.random() < 0.6) {
      return 'defend';
    }
    
    // 有特殊能力且不在冷却中，有几率使用
    const hasSpecial = unit.skills && unit.skills.length > 0;
    const specialOnCooldown = unit.cooldowns && unit.cooldowns.special > 0;
    
    if (hasSpecial && !specialOnCooldown && Math.random() < 0.4) {
      return 'special';
    }
    
    // 默认使用普通攻击
    return 'attack';
  }
  
  /**
   * 选择目标
   * @param {Object} unit 行动单位
   * @param {Array} targets 可选目标列表
   * @returns {Object} 选定的目标
   */
  selectTarget(unit, targets) {
    // 没有目标时返回null
    if (!targets || targets.length === 0) return null;
    
    // 基于战斗风格选择目标
    switch (unit.combatStyle) {
      case '攻击型':
        // 优先攻击生命百分比最低的
        targets.sort((a, b) => 
          (a.currentHp / a.stats.hp) - (b.currentHp / b.stats.hp)
        );
        return targets[0];
      
      case '战术型':
        // 优先攻击防御最低的
        targets.sort((a, b) => a.stats.def - b.stats.def);
        return targets[0];
      
      default:
        // 默认随机选择
        return targets[Math.floor(Math.random() * targets.length)];
    }
  }
  
  /**
   * 执行普通攻击
   * @param {Object} attacker 攻击者
   * @param {Object} target 目标
   */
  performAttack(attacker, target) {
    if (!target) return;
    
    // 计算伤害
    let damage = this.calculateDamage(attacker, target);
    
    // 检查是否暴击
    const critChance = attacker.stats.crit / 100;
    const isCritical = Math.random() < critChance;
    
    if (isCritical) {
      damage = Math.floor(damage * 1.5);
      this.addLog(`${attacker.name} 暴击了 ${target.name}，造成 ${damage} 点伤害！`, 'critical');
    } else {
      this.addLog(`${attacker.name} 攻击了 ${target.name}，造成 ${damage} 点伤害。`, 'damage');
    }
    
    // 应用伤害
    this.applyDamage(target, damage);
    
    // 检查是否触发特殊效果（基于角色特性）
    this.checkSpecialEffects(attacker, target, 'attack');
  }
  
  /**
   * 执行防御动作
   * @param {Object} unit 防御的单位
   */
  performDefend(unit) {
    // 增加防御buff
    const defBuff = Math.floor(unit.stats.def * 0.5);
    this.addBuff(unit, {
      name: '防御姿态',
      stat: 'def',
      value: defBuff,
      duration: 2
    });
    
    this.addLog(`${unit.name} 进入防御姿态，防御增加 ${defBuff}！`, 'defend');
  }
  
  /**
   * 执行特殊能力
   * @param {Object} unit 使用者
   * @param {Object} target 目标
   */
  performSpecialAbility(unit, target) {
    if (!target) return;
    
    // 获取单位的特殊能力
    const specialAbility = unit.specialAbility;
    let abilityName = '特殊能力';
    
    if (unit.skills && unit.skills.length > 0) {
      // 随机选择一个技能
      abilityName = unit.skills[Math.floor(Math.random() * unit.skills.length)];
    }
    
    // 根据特殊能力类型执行不同效果
    if (specialAbility.includes('火焰') || specialAbility.includes('烈焰')) {
      // 火焰攻击
      const damage = this.calculateDamage(unit, target) * 1.3;
      this.addLog(`${unit.name} 使用 ${abilityName}，对 ${target.name} 造成 ${damage} 点火焰伤害！`, 'special');
      this.applyDamage(target, damage);
      
      // 添加灼烧debuff
      this.addDebuff(target, {
        name: '灼烧',
        stat: 'hp',
        value: Math.floor(target.stats.hp * 0.05),
        duration: 3,
        isDot: true
      });
    } else if (specialAbility.includes('冰') || specialAbility.includes('霜')) {
      // 冰霜攻击
      const damage = this.calculateDamage(unit, target) * 0.8;
      this.addLog(`${unit.name} 使用 ${abilityName}，对 ${target.name} 造成 ${damage} 点冰霜伤害！`, 'special');
      this.applyDamage(target, damage);
      
      // 添加减速debuff
      this.addDebuff(target, {
        name: '冰冻',
        stat: 'spd',
        value: Math.floor(target.stats.spd * 0.3),
        duration: 2
      });
    } else if (specialAbility.includes('治疗') || specialAbility.includes('神圣')) {
      // 治疗能力
      const healAmount = Math.floor(unit.stats.atk * 1.2);
      
      // 如果目标是敌人，改为对自己治疗
      const healTarget = unit.team === target.team ? target : unit;
      
      this.addLog(`${unit.name} 使用 ${abilityName}，为 ${healTarget.name} 恢复 ${healAmount} 点生命！`, 'heal');
      this.applyHeal(healTarget, healAmount);
    } else if (specialAbility.includes('梗') || specialAbility.includes('社交')) {
      // 梗能力（降低目标攻击）
      const damage = this.calculateDamage(unit, target) * 0.7;
      this.addLog(`${unit.name} 使用 ${abilityName}，用过气梗图打击 ${target.name}，造成 ${damage} 点精神伤害！`, 'special');
      this.applyDamage(target, damage);
      
      // 添加减攻debuff
      this.addDebuff(target, {
        name: '精神受创',
        stat: 'atk',
        value: Math.floor(target.stats.atk * 0.2),
        duration: 2
      });
    } else {
      // 默认能力，增强的攻击
      const damage = this.calculateDamage(unit, target) * 1.5;
      this.addLog(`${unit.name} 使用 ${abilityName}，对 ${target.name} 造成 ${damage} 点伤害！`, 'special');
      this.applyDamage(target, damage);
    }
    
    // 设置特殊能力冷却
    unit.cooldowns = unit.cooldowns || {};
    unit.cooldowns.special = 3; // 3回合冷却
  }
  
  /**
   * 计算伤害
   * @param {Object} attacker 攻击者
   * @param {Object} defender 防御者
   * @returns {Number} 计算出的伤害值
   */
  calculateDamage(attacker, defender) {
    // 基础伤害公式
    let damage = attacker.stats.atk * (1 - (defender.stats.def / (defender.stats.def + 100)));
    
    // 应用buff和debuff效果
    const attackerBuffs = this.getEffectiveBuffs(attacker, 'atk');
    const defenderDebuffs = this.getEffectiveDebuffs(defender, 'def');
    
    // 增加攻击者的buff加成
    attackerBuffs.forEach(buff => {
      damage += buff.value;
    });
    
    // 减少防御者的防御（基于debuff）
    defenderDebuffs.forEach(debuff => {
      damage *= (1 + (debuff.value / defender.stats.def));
    });
    
    // 确保伤害至少为1
    damage = Math.max(1, Math.floor(damage));
    
    return damage;
  }
  
  /**
   * 应用伤害
   * @param {Object} target 目标
   * @param {Number} damage 伤害值
   */
  applyDamage(target, damage) {
    target.currentHp -= damage;
    
    // 确保生命值不小于0
    if (target.currentHp < 0) {
      target.currentHp = 0;
      this.addLog(`${target.name} 已经倒下！`, 'death');
    }
    
    // 检查是否触发暴怒型角色的效果
    if (target.combatStyle === '暴怒型' && 
        damage > target.stats.hp * 0.2 && 
        target.currentHp > 0 &&
        Math.random() < 0.5) {
      this.addLog(`${target.name} 受到重击后暴怒了！`, 'special');
      this.addBuff(target, {
        name: '暴怒',
        stat: 'atk',
        value: target.stats.atk,
        duration: 2
      });
    }
  }
  
  /**
   * 应用治疗
   * @param {Object} target 目标
   * @param {Number} amount 治疗量
   */
  applyHeal(target, amount) {
    target.currentHp += amount;
    
    // 确保生命值不超过最大值
    if (target.currentHp > target.stats.hp) {
      target.currentHp = target.stats.hp;
    }
  }
  
  /**
   * 添加buff
   * @param {Object} target 目标
   * @param {Object} buff buff对象
   */
  addBuff(target, buff) {
    if (!target.buffs) target.buffs = [];
    
    // 检查是否已有同名buff，如果有则刷新持续时间或叠加效果
    const existingBuff = target.buffs.find(b => b.name === buff.name);
    if (existingBuff) {
      existingBuff.duration = Math.max(existingBuff.duration, buff.duration);
      // 对于某些buff可以叠加效果
      if (buff.isStackable) {
        existingBuff.value += buff.value;
      }
    } else {
      target.buffs.push({ ...buff });
    }
  }
  
  /**
   * 添加debuff
   * @param {Object} target 目标
   * @param {Object} debuff debuff对象
   */
  addDebuff(target, debuff) {
    if (!target.debuffs) target.debuffs = [];
    
    // 与buff类似的逻辑
    const existingDebuff = target.debuffs.find(d => d.name === debuff.name);
    if (existingDebuff) {
      existingDebuff.duration = Math.max(existingDebuff.duration, debuff.duration);
      if (debuff.isStackable) {
        existingDebuff.value += debuff.value;
      }
    } else {
      target.debuffs.push({ ...debuff });
    }
  }
  
  /**
   * 获取有效的buff
   * @param {Object} unit 单位
   * @param {String} stat 属性
   * @returns {Array} 对应属性的buff列表
   */
  getEffectiveBuffs(unit, stat) {
    if (!unit.buffs) return [];
    return unit.buffs.filter(buff => buff.stat === stat);
  }
  
  /**
   * 获取有效的debuff
   * @param {Object} unit 单位
   * @param {String} stat 属性
   * @returns {Array} 对应属性的debuff列表
   */
  getEffectiveDebuffs(unit, stat) {
    if (!unit.debuffs) return [];
    return unit.debuffs.filter(debuff => debuff.stat === stat);
  }
  
  /**
   * 更新buff和debuff
   */
  updateBuffsAndDebuffs() {
    const updateEffects = (unit) => {
      if (unit.currentHp <= 0) return;
      
      // 更新buffs
      if (unit.buffs && unit.buffs.length > 0) {
        // 应用持续伤害或治疗buff
        unit.buffs.forEach(buff => {
          if (buff.isDot) {
            this.applyHeal(unit, buff.value);
            this.addLog(`${unit.name} 从 ${buff.name} 中恢复了 ${buff.value} 点生命。`, 'heal');
          }
          
          // 减少持续时间
          buff.duration--;
        });
        
        // 移除过期的buff
        unit.buffs = unit.buffs.filter(buff => buff.duration > 0);
      }
      
      // 更新debuffs
      if (unit.debuffs && unit.debuffs.length > 0) {
        // 应用持续伤害debuff
        unit.debuffs.forEach(debuff => {
          if (debuff.isDot) {
            this.applyDamage(unit, debuff.value);
            this.addLog(`${unit.name} 受到 ${debuff.name} 效果，损失 ${debuff.value} 点生命。`, 'dot');
          }
          
          // 减少持续时间
          debuff.duration--;
        });
        
        // 移除过期的debuff
        unit.debuffs = unit.debuffs.filter(debuff => debuff.duration > 0);
      }
    };
    
    // 为所有单位更新效果
    [...this.playerTeam, ...this.enemyTeam].forEach(updateEffects);
  }
  
  /**
   * 更新技能冷却
   */
  updateCooldowns() {
    const updateUnitCooldowns = (unit) => {
      if (unit.currentHp <= 0 || !unit.cooldowns) return;
      
      Object.keys(unit.cooldowns).forEach(key => {
        if (unit.cooldowns[key] > 0) {
          unit.cooldowns[key]--;
        }
      });
    };
    
    // 为所有单位更新冷却
    [...this.playerTeam, ...this.enemyTeam].forEach(updateUnitCooldowns);
  }
  
  /**
   * 检查特殊效果触发
   * @param {Object} attacker 攻击者
   * @param {Object} target 目标
   * @param {String} actionType 行动类型
   */
  checkSpecialEffects(attacker, target, actionType) {
    // 检查角色特殊能力触发
    if (attacker.specialAbility === '网红光环' && Math.random() < 0.2) {
      const healAmount = Math.floor(attacker.stats.hp * 0.1);
      this.applyHeal(attacker, healAmount);
      this.addLog(`${attacker.name} 的网红光环触发，恢复了 ${healAmount} 点生命！`, 'effect');
    }
    
    if (attacker.specialAbility === '咖啡成瘾' && this.battleState.turn > 4) {
      const damage = Math.floor(attacker.stats.hp * 0.1);
      this.applyDamage(attacker, damage);
      this.addLog(`${attacker.name} 因咖啡因过量损失了 ${damage} 点生命！`, 'effect');
    }
    
    if (attacker.specialAbility === '钻石手' && actionType === 'attack' && Math.random() < 0.1) {
      this.addLog(`${attacker.name} 的钻石手效应触发，下次战斗金币收益增加！`, 'effect');
      // 注：实际效果需要在战斗结束时计算
    }
  }
  
  /**
   * 获取战斗结果
   * @returns {Object} 战斗结果
   */
  getBattleResult() {
    return {
      victory: this.battleState.victoryState === 'victory',
      turns: this.battleState.turn,
      log: this.battleState.battleLog,
      remainingHeroes: this.playerTeam.filter(hero => hero.currentHp > 0).length,
      killedEnemies: this.enemyTeam.filter(enemy => enemy.currentHp <= 0).length,
    };
  }
}

/**
 * 自动战斗系统
 * 自动执行整个战斗过程
 * @param {Array} playerTeam 玩家队伍
 * @param {Array} enemyTeam 敌人队伍
 * @param {Number} maxTurns 最大回合数
 * @returns {Object} 战斗结果
 */
function autoBattle(playerTeam, enemyTeam, maxTurns = 30) {
  const battle = new BattleManager(playerTeam, enemyTeam);
  battle.startBattle();
  
  let turnCount = 0;
  
  // 持续更新战斗状态，直到一方胜利或达到最大回合数
  while (!battle.battleState.victoryState && turnCount < maxTurns) {
    battle.update();
    turnCount++;
    
    // 防止死循环
    if (turnCount >= maxTurns) {
      battle.addLog('战斗超过最大回合数，强制结束！', 'system');
      battle.battleState.victoryState = 'defeat';
    }
  }
  
  return battle.getBattleResult();
}

export {
  BattleManager,
  autoBattle
}; 