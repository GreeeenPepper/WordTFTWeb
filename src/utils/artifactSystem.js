/**
 * 神器系统
 * 提供Roguelike风格的游戏元素，每次爬塔过程中可以获得的特殊增益
 */

// 神器类型
const ARTIFACT_TYPES = {
  PASSIVE: 'passive',  // 被动增益，无需触发
  ACTIVE: 'active',    // 主动技能，需要触发
  CONDITIONAL: 'conditional', // 条件触发，满足特定条件时生效
  TRANSFORMATIVE: 'transformative', // 改变游戏规则的神器
  META: 'meta'         // 影响元进度的神器
};

// 神器稀有度
const ARTIFACT_RARITIES = {
  COMMON: { name: '普通', weight: 100, color: '#b0bec5' },
  UNCOMMON: { name: '优秀', weight: 60, color: '#81c784' },
  RARE: { name: '稀有', weight: 30, color: '#64b5f6' },
  EPIC: { name: '史诗', weight: 15, color: '#ba68c8' },
  LEGENDARY: { name: '传说', weight: 5, color: '#ffd54f' },
  MYTHIC: { name: '神话', weight: 1, color: '#ff8a65' }
};

// 神器定义
const ARTIFACTS = [
  // 被动增益类神器
  {
    id: 'health_crystal',
    name: '生命水晶',
    description: '英雄最大生命值+15%',
    type: ARTIFACT_TYPES.PASSIVE,
    rarity: 'COMMON',
    effect: {
      type: 'hero_stat_percent',
      stat: 'hp',
      value: 0.15
    },
    flavor: '蕴含生命能量的水晶，传说是巨龙的心脏碎片。'
  },
  {
    id: 'strength_talisman',
    name: '力量护符',
    description: '英雄攻击力+12%',
    type: ARTIFACT_TYPES.PASSIVE,
    rarity: 'COMMON',
    effect: {
      type: 'hero_stat_percent',
      stat: 'atk',
      value: 0.12
    },
    flavor: '古老部落的战士护符，蕴含原始力量。'
  },
  {
    id: 'iron_armor',
    name: '铁甲胄片',
    description: '英雄防御力+15%',
    type: ARTIFACT_TYPES.PASSIVE,
    rarity: 'COMMON',
    effect: {
      type: 'hero_stat_percent',
      stat: 'def',
      value: 0.15
    },
    flavor: '来自失落王国的战甲碎片，仍然坚固如初。'
  },
  {
    id: 'swift_boots',
    name: '迅捷靴',
    description: '英雄速度+10%',
    type: ARTIFACT_TYPES.PASSIVE,
    rarity: 'COMMON',
    effect: {
      type: 'hero_stat_percent',
      stat: 'spd',
      value: 0.1
    },
    flavor: '据说穿上这双靴子能追上疾风，但鞋底总是磨损得很快。'
  },
  {
    id: 'lucky_coin',
    name: '幸运硬币',
    description: '英雄暴击率+8%',
    type: ARTIFACT_TYPES.PASSIVE,
    rarity: 'COMMON',
    effect: {
      type: 'hero_stat_flat',
      stat: 'crit',
      value: 8
    },
    flavor: '硬币正面是微笑，反面是厄运，抛硬币之前请三思。'
  },
  
  // 高级被动增益
  {
    id: 'dragon_heart',
    name: '龙之心',
    description: '英雄最大生命值+30%，每回合恢复2%',
    type: ARTIFACT_TYPES.PASSIVE,
    rarity: 'EPIC',
    effect: {
      type: 'multi',
      effects: [
        {
          type: 'hero_stat_percent',
          stat: 'hp',
          value: 0.3
        },
        {
          type: 'regen_percent',
          value: 0.02
        }
      ]
    },
    flavor: '真正的龙之心，跳动着远古的力量。持有者能感受到永恒的生命力。'
  },
  {
    id: 'titans_might',
    name: '泰坦之力',
    description: '英雄攻击力+25%，但速度-5%',
    type: ARTIFACT_TYPES.PASSIVE,
    rarity: 'RARE',
    effect: {
      type: 'multi',
      effects: [
        {
          type: 'hero_stat_percent',
          stat: 'atk',
          value: 0.25
        },
        {
          type: 'hero_stat_percent',
          stat: 'spd',
          value: -0.05
        }
      ]
    },
    flavor: '蕴含泰坦怒火的力量，过于强大以至于难以自如挥舞。'
  },
  
  // 特殊效果神器
  {
    id: 'vampiric_fang',
    name: '吸血獠牙',
    description: '英雄攻击有15%几率吸取造成伤害10%的生命值',
    type: ARTIFACT_TYPES.CONDITIONAL,
    rarity: 'UNCOMMON',
    effect: {
      type: 'on_attack',
      chance: 0.15,
      effect: {
        type: 'lifesteal',
        value: 0.1
      }
    },
    flavor: '古老的吸血鬼家族遗留的獠牙，仍然渴望着鲜血。'
  },
  {
    id: 'phoenix_feather',
    name: '凤凰之羽',
    description: '战斗中首次生命值降至0时，恢复50%生命值',
    type: ARTIFACT_TYPES.CONDITIONAL,
    rarity: 'EPIC',
    effect: {
      type: 'on_death',
      uses: 1,
      effect: {
        type: 'revive',
        health_percent: 0.5
      }
    },
    flavor: '燃烧的羽毛，凤凰浴火重生的象征。'
  },
  {
    id: 'mirror_shield',
    name: '镜盾',
    description: '受到攻击时有20%几率反弹30%伤害',
    type: ARTIFACT_TYPES.CONDITIONAL,
    rarity: 'RARE',
    effect: {
      type: 'on_hit',
      chance: 0.2,
      effect: {
        type: 'reflect_damage',
        value: 0.3
      }
    },
    flavor: '如此光滑的盾面，连光线都会被反射回去。'
  },
  
  // 变革性神器
  {
    id: 'merchant_contract',
    name: '商人契约',
    description: '商店刷新费用-50%，但英雄成本+10%',
    type: ARTIFACT_TYPES.TRANSFORMATIVE,
    rarity: 'UNCOMMON',
    effect: {
      type: 'shop_modifier',
      refresh_cost_modifier: -0.5,
      hero_cost_modifier: 0.1
    },
    flavor: '上面写着非常小的字，记得阅读所有条款。'
  },
  {
    id: 'time_hourglass',
    name: '时光沙漏',
    description: '战斗开始时，你的英雄获得一个额外行动',
    type: ARTIFACT_TYPES.TRANSFORMATIVE,
    rarity: 'LEGENDARY',
    effect: {
      type: 'battle_start',
      effect: {
        type: 'extra_turn'
      }
    },
    flavor: '沙子永远不会流完，仿佛凝固了时间本身。'
  },
  {
    id: 'chaos_dice',
    name: '混沌骰子',
    description: '每场战斗开始时，随机增强一个英雄属性50%，减弱另一个属性25%',
    type: ARTIFACT_TYPES.TRANSFORMATIVE,
    rarity: 'EPIC',
    effect: {
      type: 'battle_start',
      effect: {
        type: 'random_stat_change'
      }
    },
    flavor: '这个骰子的面数似乎随时都在变化，永远无法预测。'
  },
  
  // 元进度神器
  {
    id: 'wisdom_tome',
    name: '智慧古籍',
    description: '战斗经验值+20%',
    type: ARTIFACT_TYPES.META,
    rarity: 'UNCOMMON',
    effect: {
      type: 'exp_bonus',
      value: 0.2
    },
    flavor: '记录着世界上所有已知知识的古老书籍，可惜你看不懂。'
  },
  {
    id: 'midas_touch',
    name: '点金手',
    description: '获得的金币+25%',
    type: ARTIFACT_TYPES.META,
    rarity: 'RARE',
    effect: {
      type: 'gold_bonus',
      value: 0.25
    },
    flavor: '传说中的迈达斯国王曾用它把所有东西变成金子，包括他的女儿。'
  },
  
  // 搞笑/梗神器
  {
    id: 'rubber_duck',
    name: '调试鸭子',
    description: '当你想不通游戏机制时，可以向它倾诉。攻击+5%',
    type: ARTIFACT_TYPES.PASSIVE,
    rarity: 'COMMON',
    effect: {
      type: 'hero_stat_percent',
      stat: 'atk',
      value: 0.05
    },
    flavor: '程序员最好的朋友，不需要回应，只需要倾听。'
  },
  {
    id: 'outdated_meme',
    name: '过气梗图',
    description: '有10%几率使敌人尴尬，跳过一回合',
    type: ARTIFACT_TYPES.CONDITIONAL,
    rarity: 'UNCOMMON',
    effect: {
      type: 'on_attack',
      chance: 0.1,
      effect: {
        type: 'stun',
        duration: 1
      }
    },
    flavor: '"这个梗已经很久没人用了..." —— 某位不愿透露姓名的网民'
  },
  {
    id: 'social_anxiety',
    name: '社交恐惧症',
    description: '当你的英雄数量少于3个时，所有英雄属性+15%',
    type: ARTIFACT_TYPES.CONDITIONAL,
    rarity: 'RARE',
    effect: {
      type: 'team_size',
      condition: 'less_than',
      value: 3,
      effect: {
        type: 'all_stats_percent',
        value: 0.15
      }
    },
    flavor: '人少就安全，人多就恐慌，这是社恐的日常。'
  },
  {
    id: 'stackoverflow_badge',
    name: 'StackOverflow徽章',
    description: '有5%几率复制敌人的技能并使用',
    type: ARTIFACT_TYPES.CONDITIONAL,
    rarity: 'EPIC',
    effect: {
      type: 'on_attack',
      chance: 0.05,
      effect: {
        type: 'copy_skill'
      }
    },
    flavor: '复制粘贴是优秀程序员的必备技能，但请不要忘记引用来源。'
  },
  {
    id: 'crypto_wallet',
    name: '加密钱包',
    description: '每场战斗结束后，有50%几率获得双倍金币，50%几率失去所有金币奖励',
    type: ARTIFACT_TYPES.TRANSFORMATIVE,
    rarity: 'LEGENDARY',
    effect: {
      type: 'battle_end',
      effect: {
        type: 'random_gold',
        chance: 0.5,
        bonus: 1.0,
        penalty: 1.0
      }
    },
    flavor: '上面写着"TO THE MOON"，但现在似乎坠落在地下室。'
  },
  {
    id: 'keyboard_warrior',
    name: '键盘战士',
    description: '攻击时有15%几率发动暴击，造成三倍伤害，同时有5%几率伤害自己',
    type: ARTIFACT_TYPES.CONDITIONAL,
    rarity: 'RARE',
    effect: {
      type: 'on_attack',
      effects: [
        {
          chance: 0.15,
          effect: {
            type: 'critical_modifier',
            value: 3.0
          }
        },
        {
          chance: 0.05,
          effect: {
            type: 'self_damage',
            value: 0.1
          }
        }
      ]
    },
    flavor: '在互联网上无所畏惧，在现实中瑟瑟发抖。'
  }
];

// 神器组合效果
const ARTIFACT_SYNERGIES = [
  {
    id: 'elemental_harmony',
    name: '元素和谐',
    required: ['phoenix_feather', 'iron_armor'],
    description: '所有元素伤害+20%',
    effect: {
      type: 'damage_type_bonus',
      damage_type: 'elemental',
      value: 0.2
    }
  },
  {
    id: 'warriors_spirit',
    name: '战士之魂',
    required: ['strength_talisman', 'vampiric_fang'],
    description: '每次击杀敌人恢复5%最大生命值',
    effect: {
      type: 'on_kill',
      effect: {
        type: 'heal_percent',
        value: 0.05
      }
    }
  },
  {
    id: 'internet_famous',
    name: '网络名人',
    required: ['outdated_meme', 'social_anxiety', 'keyboard_warrior'],
    description: '战斗开始时有30%几率使所有敌人战斗力降低20%',
    effect: {
      type: 'battle_start',
      chance: 0.3,
      effect: {
        type: 'enemy_stat_percent',
        stat: 'all',
        value: -0.2
      }
    }
  }
];

/**
 * 根据当前层级生成可选神器
 * @param {Number} level 当前层级
 * @param {Number} count 生成数量
 * @param {Array} ownedArtifacts 已拥有的神器ID列表
 * @returns {Array} 可选神器列表
 */
function generateArtifactChoices(level, count = 3, ownedArtifacts = []) {
  // 根据层级调整稀有度权重
  const rarityWeights = { ...ARTIFACT_RARITIES };
  
  // 层级越高，稀有度越高的概率增加
  if (level > 10) {
    const levelFactor = Math.min(4, level / 10);  // 最多提升4倍
    rarityWeights.RARE.weight *= levelFactor;
    rarityWeights.EPIC.weight *= levelFactor;
    rarityWeights.LEGENDARY.weight *= levelFactor;
    rarityWeights.MYTHIC.weight *= levelFactor;
  }
  
  // 计算总权重
  const totalWeight = Object.values(rarityWeights).reduce((sum, rarity) => sum + rarity.weight, 0);
  
  // 随机选择神器，避免重复
  const availableArtifacts = ARTIFACTS.filter(artifact => !ownedArtifacts.includes(artifact.id));
  const choices = [];
  
  // 尝试生成指定数量的神器
  for (let i = 0; i < count && availableArtifacts.length > 0; i++) {
    // 随机选择稀有度
    const randomWeight = Math.random() * totalWeight;
    let accumulatedWeight = 0;
    let selectedRarity = 'COMMON';
    
    for (const [rarityKey, rarityData] of Object.entries(rarityWeights)) {
      accumulatedWeight += rarityData.weight;
      if (randomWeight <= accumulatedWeight) {
        selectedRarity = rarityKey;
        break;
      }
    }
    
    // 过滤对应稀有度的神器
    const rarityArtifacts = availableArtifacts.filter(a => a.rarity === selectedRarity);
    
    if (rarityArtifacts.length > 0) {
      // 随机选择一个神器
      const randomIndex = Math.floor(Math.random() * rarityArtifacts.length);
      const selectedArtifact = rarityArtifacts[randomIndex];
      
      // 添加到选择列表，并从可用列表中移除
      choices.push(selectedArtifact);
      const removeIndex = availableArtifacts.findIndex(a => a.id === selectedArtifact.id);
      if (removeIndex !== -1) {
        availableArtifacts.splice(removeIndex, 1);
      }
    } else {
      // 如果没有对应稀有度的神器，随机选择一个可用神器
      if (availableArtifacts.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableArtifacts.length);
        choices.push(availableArtifacts[randomIndex]);
        availableArtifacts.splice(randomIndex, 1);
      }
    }
  }
  
  return choices;
}

/**
 * 检查神器组合效果
 * @param {Array} artifactIds 拥有的神器ID列表
 * @returns {Array} 触发的组合效果列表
 */
function checkArtifactSynergies(artifactIds) {
  return ARTIFACT_SYNERGIES.filter(synergy => {
    // 检查是否拥有所需的所有神器
    return synergy.required.every(requiredId => artifactIds.includes(requiredId));
  });
}

/**
 * 应用神器效果到英雄/游戏状态
 * @param {Array} heroes 英雄列表
 * @param {Array} artifacts 拥有的神器列表
 * @param {Object} gameState 游戏状态
 * @returns {Object} 更新后的游戏状态
 */
function applyArtifactEffects(heroes, artifacts, gameState) {
  // 创建游戏状态的副本
  const updatedState = { ...gameState };
  
  // 更新英雄属性
  const updatedHeroes = heroes.map(hero => {
    const updatedHero = { ...hero };
    
    // 应用每个神器的效果
    artifacts.forEach(artifact => {
      if (artifact.effect.type === 'hero_stat_percent') {
        // 百分比增加属性
        const stat = artifact.effect.stat;
        if (updatedHero.stats[stat]) {
          updatedHero.stats[stat] *= (1 + artifact.effect.value);
          updatedHero.stats[stat] = Math.floor(updatedHero.stats[stat]);
        }
      } else if (artifact.effect.type === 'hero_stat_flat') {
        // 固定值增加属性
        const stat = artifact.effect.stat;
        if (updatedHero.stats[stat] !== undefined) {
          updatedHero.stats[stat] += artifact.effect.value;
        }
      } else if (artifact.effect.type === 'multi') {
        // 多重效果
        artifact.effect.effects.forEach(effect => {
          if (effect.type === 'hero_stat_percent') {
            const stat = effect.stat;
            if (updatedHero.stats[stat]) {
              updatedHero.stats[stat] *= (1 + effect.value);
              updatedHero.stats[stat] = Math.floor(updatedHero.stats[stat]);
            }
          } else if (effect.type === 'hero_stat_flat') {
            const stat = effect.stat;
            if (updatedHero.stats[stat] !== undefined) {
              updatedHero.stats[stat] += effect.value;
            }
          }
        });
      }
      
      // 其他神器效果将在战斗系统中处理
    });
    
    // 应用组合效果
    const artifactIds = artifacts.map(a => a.id);
    const activeSynergies = checkArtifactSynergies(artifactIds);
    
    // 更新英雄属性基于组合效果
    activeSynergies.forEach(synergy => {
      // 处理组合效果...
      // 这里可以添加更多的组合效果处理逻辑
    });
    
    // 重新计算英雄战力
    updatedHero.power = calculateHeroPower(updatedHero);
    
    return updatedHero;
  });
  
  // 更新商店相关效果
  artifacts.forEach(artifact => {
    if (artifact.effect.type === 'shop_modifier') {
      updatedState.shopRefreshCost = Math.max(1, Math.floor(gameState.shopRefreshCost * (1 + artifact.effect.refresh_cost_modifier)));
      // 英雄价格修改器将在购买时应用
    }
    
    // 应用其他游戏状态修改...
  });
  
  return {
    heroes: updatedHeroes,
    gameState: updatedState
  };
}

/**
 * 计算英雄战力
 * @param {Object} hero 英雄对象
 * @returns {Number} 战力值
 */
function calculateHeroPower(hero) {
  return Math.floor(
    hero.stats.hp / 10 +
    hero.stats.atk * 2 +
    hero.stats.def * 1.5 +
    hero.stats.spd * 2 +
    hero.stats.crit
  );
}

/**
 * 获取神器稀有度信息
 * @param {String} rarityKey 稀有度键
 * @returns {Object} 稀有度信息
 */
function getArtifactRarityInfo(rarityKey) {
  return ARTIFACT_RARITIES[rarityKey] || ARTIFACT_RARITIES.COMMON;
}

export {
  ARTIFACTS,
  ARTIFACT_TYPES,
  ARTIFACT_RARITIES,
  ARTIFACT_SYNERGIES,
  generateArtifactChoices,
  checkArtifactSynergies,
  applyArtifactEffects,
  getArtifactRarityInfo
}; 