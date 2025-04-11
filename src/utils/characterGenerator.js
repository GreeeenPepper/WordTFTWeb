/**
 * 角色生成系统
 * 负责随机生成英雄和怪物，包含各种模块化组件
 */

// 角色种族特性，影响基础属性和特殊能力
const RACE_MODULES = {
  // 标准种族
  human: {
    name: '人类',
    description: '适应力强，全面发展',
    statBonus: { hp: 0, atk: 0, def: 0, spd: 0, crit: 5 },
    abilities: ['人类的坚韧']
  },
  elf: {
    name: '精灵',
    description: '优雅敏捷，擅长远程',
    statBonus: { hp: -10, atk: 5, def: -5, spd: 15, crit: 10 },
    abilities: ['自然连接']
  },
  dwarf: {
    name: '矮人',
    description: '坚固耐久，工艺精湛',
    statBonus: { hp: 20, atk: 0, def: 15, spd: -10, crit: 0 },
    abilities: ['石头皮肤']
  },
  orc: {
    name: '兽人',
    description: '野蛮好战，力大无穷',
    statBonus: { hp: 15, atk: 15, def: 5, spd: -5, crit: -5 },
    abilities: ['狂暴之力']
  },
  undead: {
    name: '亡灵',
    description: '不死之身，恐怖存在',
    statBonus: { hp: 0, atk: 0, def: 10, spd: -5, crit: 0 },
    abilities: ['死而不僵']
  },
  
  // 有梗的种族
  meme: {
    name: '梗人',
    description: '因特网居民，擅长玩梗',
    statBonus: { hp: -5, atk: 10, def: -5, spd: 10, crit: 15 },
    abilities: ['梗力满满']
  },
  cat: {
    name: '猫娘',
    description: '喵喵喵？喵！',
    statBonus: { hp: -10, atk: 5, def: -5, spd: 20, crit: 15 },
    abilities: ['九条命']
  },
  programmer: {
    name: '程序员',
    description: '通宵秃头，能量饮料加持',
    statBonus: { hp: -15, atk: 15, def: -10, spd: -5, crit: 20 },
    abilities: ['递归打击']
  },
  boomer: {
    name: '蓝领工人',
    description: '朴实无华，勤劳朴实',
    statBonus: { hp: 15, atk: 10, def: 5, spd: -15, crit: -5 },
    abilities: ['加班精神']
  },
  zoomer: {
    name: '网感少年',
    description: '指尖舞动，社交达人',
    statBonus: { hp: -10, atk: 0, def: -10, spd: 25, crit: 10 },
    abilities: ['刷屏攻击']
  }
};

// 职业模块，决定技能和战斗风格
const CLASS_MODULES = {
  // 标准职业
  warrior: {
    name: '战士',
    description: '前线坦克，高防御高生命',
    statMultiplier: { hp: 1.3, atk: 1.1, def: 1.3, spd: 0.9, crit: 0.9 },
    skills: ['横扫千军', '防御姿态', '战吼']
  },
  mage: {
    name: '法师',
    description: '后排输出，强力法术',
    statMultiplier: { hp: 0.8, atk: 1.5, def: 0.7, spd: 0.9, crit: 1.2 },
    skills: ['火球术', '冰霜新星', '法力屏障']
  },
  rogue: {
    name: '盗贼',
    description: '灵活刺客，高暴击高速度',
    statMultiplier: { hp: 0.9, atk: 1.2, def: 0.8, spd: 1.4, crit: 1.5 },
    skills: ['背刺', '烟雾弹', '疾跑']
  },
  priest: {
    name: '牧师',
    description: '神圣治疗，辅助增益',
    statMultiplier: { hp: 1.0, atk: 0.8, def: 0.9, spd: 1.0, crit: 0.8 },
    skills: ['治疗之光', '神圣护盾', '净化']
  },
  ranger: {
    name: '游侠',
    description: '远程射手，精准打击',
    statMultiplier: { hp: 0.9, atk: 1.3, def: 0.8, spd: 1.2, crit: 1.3 },
    skills: ['瞄准射击', '多重箭', '陷阱']
  },
  
  // 有梗的职业
  webDev: {
    name: '前端工程师',
    description: '用CSS攻击敌人，制造幻觉',
    statMultiplier: { hp: 0.8, atk: 1.1, def: 0.7, spd: 1.1, crit: 1.4 },
    skills: ['JavaScript灾难', 'CSS重构', '响应式打击']
  },
  influencer: {
    name: '网红',
    description: '用点赞和关注轰炸敌人',
    statMultiplier: { hp: 0.7, atk: 1.2, def: 0.6, spd: 1.5, crit: 1.6 },
    skills: ['直播攻击', '粉丝召唤', '赞助商广告']
  },
  cryptoBro: {
    name: '币圈大佬',
    description: '用币价波动打击敌人的心态',
    statMultiplier: { hp: 1.2, atk: 1.3, def: 0.8, spd: 0.8, crit: 2.0 },
    skills: ['抄底买入', '恐慌抛售', '钻石手']
  },
  karenspeaker: {
    name: '社区大妈',
    description: '用投诉和指责摧毁敌人',
    statMultiplier: { hp: 1.4, atk: 0.9, def: 1.2, spd: 0.7, crit: 1.1 },
    skills: ['要求经理', '激情演讲', '理直气壮']
  },
  memeologist: {
    name: '梗学家',
    description: '用过时的梗击溃敌人的精神',
    statMultiplier: { hp: 0.8, atk: 1.4, def: 0.7, spd: 1.3, crit: 1.3 },
    skills: ['史前老梗', '流量密码', '二次元攻击']
  }
};

// 属性倾向，影响属性分配
const ATTRIBUTE_MODULES = {
  // 标准属性
  balanced: {
    name: '均衡',
    description: '各项属性平均发展',
    statDistribution: { hp: 1.0, atk: 1.0, def: 1.0, spd: 1.0, crit: 1.0 }
  },
  tank: {
    name: '坦克',
    description: '生命和防御特别高',
    statDistribution: { hp: 1.5, atk: 0.8, def: 1.4, spd: 0.7, crit: 0.6 }
  },
  glass: {
    name: '玻璃炮',
    description: '攻击和暴击极高，生命和防御极低',
    statDistribution: { hp: 0.6, atk: 1.7, def: 0.5, spd: 1.2, crit: 1.8 }
  },
  swift: {
    name: '迅捷',
    description: '速度极高，先发制人',
    statDistribution: { hp: 0.8, atk: 1.1, def: 0.7, spd: 1.8, crit: 1.2 }
  },
  juggernaut: {
    name: '主宰',
    description: '高攻高防，速度低',
    statDistribution: { hp: 1.2, atk: 1.4, def: 1.3, spd: 0.5, crit: 0.9 }
  },
  
  // 有梗的属性
  yolo: {
    name: '莽夫',
    description: '只有攻击，其他全不管',
    statDistribution: { hp: 0.5, atk: 2.5, def: 0.3, spd: 1.0, crit: 1.5 }
  },
  tryhard: {
    name: '卷王',
    description: '各方面都要卷，但卷不动',
    statDistribution: { hp: 1.1, atk: 1.1, def: 1.1, spd: 1.1, crit: 1.1 }
  },
  noob: {
    name: '菜鸟',
    description: '属性都有点低，但运气好',
    statDistribution: { hp: 0.9, atk: 0.9, def: 0.9, spd: 0.9, crit: 2.0 }
  },
  whiner: {
    name: '受害者',
    description: '挨打多了，比较抗揍',
    statDistribution: { hp: 1.3, atk: 0.7, def: 1.6, spd: 0.8, crit: 0.6 }
  },
  op: {
    name: '超模',
    description: '设计师的亲儿子，全属性超标',
    statDistribution: { hp: 1.3, atk: 1.3, def: 1.3, spd: 1.3, crit: 1.3 }
  }
};

// 特殊能力，提供独特效果
const SPECIAL_ABILITY_MODULES = {
  // 标准特殊能力
  fire: {
    name: '火焰亲和',
    description: '火属性伤害加成，受到水属性伤害增加',
    effects: ['火焰伤害+30%', '受到水伤害+20%'],
    skills: ['烈焰喷射']
  },
  water: {
    name: '水流亲和',
    description: '水属性伤害加成，受到电属性伤害增加',
    effects: ['水流伤害+30%', '受到电伤害+20%'],
    skills: ['水流冲击']
  },
  earth: {
    name: '大地亲和',
    description: '增加防御，减少速度',
    effects: ['防御+25%', '速度-10%'],
    skills: ['岩石护甲']
  },
  wind: {
    name: '风之亲和',
    description: '增加速度和闪避',
    effects: ['速度+25%', '闪避+15%'],
    skills: ['风之步']
  },
  lightning: {
    name: '雷电亲和',
    description: '增加暴击和速度',
    effects: ['暴击+20%', '速度+15%'],
    skills: ['闪电链']
  },
  
  // 有梗的特殊能力
  memepower: {
    name: '梗力觉醒',
    description: '用互联网梗攻击敌人，造成精神伤害',
    effects: ['梗伤害+50%', '社交抵抗-20%'],
    skills: ['过气梗图攻击']
  },
  coffeeAddict: {
    name: '咖啡成瘾',
    description: '喝咖啡提高速度，但时间长了会崩溃',
    effects: ['速度+40%', '战斗持续4回合后生命-10%/回合'],
    skills: ['咖啡因狂热']
  },
  cryptoHodler: {
    name: '钻石手',
    description: '随机获得或损失金币',
    effects: ['战斗结束后50%概率金币+30%', '50%概率金币-20%'],
    skills: ['抄底反弹']
  },
  socialMediaStar: {
    name: '网红光环',
    description: '吸引火力，但有概率回血',
    effects: ['优先被攻击+30%', '每回合20%概率恢复10%生命'],
    skills: ['直播打赏']
  },
  procrastinator: {
    name: '拖延症患者',
    description: '行动变慢，但伤害增加',
    effects: ['速度-25%', '攻击+35%'],
    skills: ['DDL爆发']
  }
};

// 战斗风格，影响战斗中的行为模式
const COMBAT_STYLE_MODULES = {
  // 标准战斗风格
  aggressive: {
    name: '攻击型',
    description: '优先攻击生命低的敌人',
    behavior: '优先攻击敌方生命百分比最低的单位',
    effects: ['攻击+15%', '防御-10%']
  },
  defensive: {
    name: '防御型',
    description: '优先保护自己，血量低时提高防御',
    behavior: '生命值低于50%时，提高30%防御',
    effects: ['防御+20%', '攻击-5%']
  },
  support: {
    name: '辅助型',
    description: '优先使用增益技能',
    behavior: '优先使用能提供增益效果的技能',
    effects: ['治疗效果+25%', '攻击-15%']
  },
  tactical: {
    name: '战术型',
    description: '根据局势调整策略',
    behavior: '根据场上形势选择最优行动',
    effects: ['暴击+10%', '速度+10%']
  },
  berserk: {
    name: '狂暴型',
    description: '生命越低，攻击越高',
    behavior: '生命值每降低10%，攻击提高5%',
    effects: ['最大攻击提升+50%', '防御-20%']
  },
  
  // 有梗的战斗风格
  trolling: {
    name: '整活型',
    description: '随机行动，有可能自伤',
    behavior: '30%概率随机选择行动，10%概率自伤',
    effects: ['混乱+100%', '幸运+50%']
  },
  afk: {
    name: '挂机型',
    description: '偶尔不行动，但会积累能量',
    behavior: '25%概率跳过回合，下回合伤害+100%',
    effects: ['攻击间隔+50%', '暴击伤害+70%']
  },
  payToWin: {
    name: '氪金型',
    description: '战斗中消耗金币提高属性',
    behavior: '每回合可消耗1金币提高10%攻击',
    effects: ['金币消耗+30%', '属性提升+30%']
  },
  backseatGaming: {
    name: '指挥型',
    description: '提高队友属性，但自身较弱',
    behavior: '队友攻击+15%，自身攻击-20%',
    effects: ['团队增益+25%', '个人减益+20%']
  },
  ragequit: {
    name: '暴怒型',
    description: '受到重击后有几率暴走',
    behavior: '受到20%以上生命伤害后，50%概率攻击翻倍并失去控制',
    effects: ['暴走几率+50%', '控制-80%']
  }
};

// 稀有度定义
const RARITY_LEVELS = {
  common: { name: '普通', multiplier: 1.0, color: '#b0bec5', maxModules: 3 },
  uncommon: { name: '优秀', multiplier: 1.2, color: '#81c784', maxModules: 3 },
  rare: { name: '稀有', multiplier: 1.5, color: '#64b5f6', maxModules: 4 },
  epic: { name: '史诗', multiplier: 1.8, color: '#ba68c8', maxModules: 4 },
  legendary: { name: '传说', multiplier: 2.3, color: '#ffd54f', maxModules: 5 },
  mythic: { name: '神话', multiplier: 3.0, color: '#ff8a65', maxModules: 5 }
};

// 基础属性范围
const BASE_STATS = {
  minLevel: 1,
  maxLevel: 100,
  stats: {
    hp: { base: 100, perLevel: 10 },
    atk: { base: 20, perLevel: 2 },
    def: { base: 10, perLevel: 1 },
    spd: { base: 10, perLevel: 0.5 },
    crit: { base: 5, perLevel: 0.3 }
  }
};

/**
 * 随机从对象中选择一个键
 * @param {Object} obj 对象
 * @returns {String} 随机键
 */
function getRandomKey(obj) {
  const keys = Object.keys(obj);
  return keys[Math.floor(Math.random() * keys.length)];
}

/**
 * 生成随机英雄或怪物
 * @param {Number} level 等级
 * @param {String} rarity 稀有度
 * @param {Boolean} isHero 是否是英雄
 * @returns {Object} 生成的角色对象
 */
function generateCharacter(level = 1, rarity = 'common', isHero = true) {
  // 确保稀有度有效
  rarity = RARITY_LEVELS[rarity] ? rarity : 'common';
  const rarityData = RARITY_LEVELS[rarity];
  
  // 随机选择模块
  const race = RACE_MODULES[getRandomKey(RACE_MODULES)];
  const characterClass = CLASS_MODULES[getRandomKey(CLASS_MODULES)];
  const attribute = ATTRIBUTE_MODULES[getRandomKey(ATTRIBUTE_MODULES)];
  const specialAbility = SPECIAL_ABILITY_MODULES[getRandomKey(SPECIAL_ABILITY_MODULES)];
  const combatStyle = COMBAT_STYLE_MODULES[getRandomKey(COMBAT_STYLE_MODULES)];
  
  // 应用基础属性
  const baseStats = {
    hp: BASE_STATS.stats.hp.base + (level - 1) * BASE_STATS.stats.hp.perLevel,
    atk: BASE_STATS.stats.atk.base + (level - 1) * BASE_STATS.stats.atk.perLevel,
    def: BASE_STATS.stats.def.base + (level - 1) * BASE_STATS.stats.def.perLevel,
    spd: BASE_STATS.stats.spd.base + (level - 1) * BASE_STATS.stats.spd.perLevel,
    crit: BASE_STATS.stats.crit.base + (level - 1) * BASE_STATS.stats.crit.perLevel
  };
  
  // 应用种族加成
  Object.keys(race.statBonus).forEach(stat => {
    baseStats[stat] += race.statBonus[stat];
  });
  
  // 应用职业乘数
  Object.keys(characterClass.statMultiplier).forEach(stat => {
    baseStats[stat] *= characterClass.statMultiplier[stat];
  });
  
  // 应用属性分配
  Object.keys(attribute.statDistribution).forEach(stat => {
    baseStats[stat] *= attribute.statDistribution[stat];
  });
  
  // 应用稀有度乘数
  Object.keys(baseStats).forEach(stat => {
    baseStats[stat] *= rarityData.multiplier;
    // 取整
    baseStats[stat] = Math.round(baseStats[stat]);
  });
  
  // 收集技能
  const skills = [
    ...race.abilities,
    ...characterClass.skills.slice(0, 2),
    specialAbility.skills[0]
  ].slice(0, rarityData.maxModules);
  
  // 生成名称
  let name = '';
  if (isHero) {
    // 英雄名称随机生成
    const prefixes = ['勇敢的', '无畏的', '传奇的', '神秘的', '暗影', '光明', '混沌', '秩序', '正义', '邪恶'];
    const suffixes = ['守护者', '破坏者', '征服者', '探索者', '行者', '猎手', '王者', '勇士', '大师', '信使'];
    const randomName = ['阿尔法', '欧米茄', '塞巴斯', '阿特拉斯', '诺娃', '奥利安', '卡珊德拉', '德拉科', '赫拉', '柯尔特'];
    
    name = `${prefixes[Math.floor(Math.random() * prefixes.length)]}${randomName[Math.floor(Math.random() * randomName.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  } else {
    // 怪物名称构建
    const monsterTypes = ['哥布林', '巨魔', '蜥蜴人', '骷髅', '僵尸', '幽灵', '恶魔', '元素', '巨兽', '虫族'];
    const monsterRanks = ['小兵', '精英', '头目', '将军', '王者', '霸主', '领主', '统治者', '毁灭者', '天灾'];
    
    name = `${monsterTypes[Math.floor(Math.random() * monsterTypes.length)]}${monsterRanks[Math.floor(Math.random() * monsterRanks.length)]}`;
  }
  
  // 计算战力
  const power = (
    baseStats.hp / 10 +
    baseStats.atk * 2 +
    baseStats.def * 1.5 +
    baseStats.spd * 2 +
    baseStats.crit
  );
  
  // 计算英雄成本(仅英雄有)
  const cost = isHero ? Math.max(5, Math.floor(power / 10)) : 0;
  
  // 构建角色对象
  return {
    name,
    level,
    rarity,
    rarityName: rarityData.name,
    rarityColor: rarityData.color,
    race: race.name,
    class: characterClass.name,
    attribute: attribute.name,
    specialAbility: specialAbility.name,
    combatStyle: combatStyle.name,
    description: `${race.description} ${characterClass.description}`,
    stats: baseStats,
    skills,
    effects: [
      ...specialAbility.effects,
      ...combatStyle.effects
    ],
    power: Math.floor(power),
    cost: cost,
    isHero,
    // 独特特性描述
    uniqueTraits: `${race.name}的${characterClass.name}，${attribute.name}型，具有${specialAbility.name}特性，战斗风格为${combatStyle.name}。`
  };
}

/**
 * 生成英雄商店
 * @param {Number} level 当前层级
 * @param {Number} count 生成数量
 * @returns {Array} 英雄数组
 */
function generateHeroShop(level, count = 5) {
  const heroes = [];
  const rarityChances = {
    common: 0.4,
    uncommon: 0.3,
    rare: 0.15,
    epic: 0.1,
    legendary: 0.04,
    mythic: 0.01
  };
  
  // 层级越高，稀有度越高的调整
  if (level > 10) {
    rarityChances.common -= Math.min(0.3, level * 0.02);
    rarityChances.uncommon += Math.min(0.1, level * 0.005);
    rarityChances.rare += Math.min(0.1, level * 0.005);
    rarityChances.epic += Math.min(0.05, level * 0.003);
    rarityChances.legendary += Math.min(0.03, level * 0.002);
    rarityChances.mythic += Math.min(0.02, level * 0.001);
  }
  
  for (let i = 0; i < count; i++) {
    // 根据概率选择稀有度
    const roll = Math.random();
    let rarity = 'common';
    let cumulativeChance = 0;
    
    for (const [r, chance] of Object.entries(rarityChances)) {
      cumulativeChance += chance;
      if (roll <= cumulativeChance) {
        rarity = r;
        break;
      }
    }
    
    // 英雄等级随层级上升，但有随机性
    const heroLevel = Math.max(1, Math.floor(level * (0.8 + Math.random() * 0.4)));
    heroes.push(generateCharacter(heroLevel, rarity, true));
  }
  
  return heroes;
}

/**
 * 生成关卡怪物
 * @param {Number} level 当前层级
 * @param {Number} count 怪物数量
 * @returns {Array} 怪物数组
 */
function generateEnemies(level, count = 3) {
  const enemies = [];
  const rarityChances = {
    common: 0.5,
    uncommon: 0.3,
    rare: 0.15,
    epic: 0.04,
    legendary: 0.01,
    mythic: 0
  };
  
  // Boss关卡调整
  const isBossLevel = level % 10 === 0;
  if (isBossLevel) {
    rarityChances.common = 0.1;
    rarityChances.uncommon = 0.2;
    rarityChances.rare = 0.3;
    rarityChances.epic = 0.3;
    rarityChances.legendary = 0.09;
    rarityChances.mythic = 0.01;
    
    // Boss关卡敌人更少，但更强
    count = Math.max(1, count - 1);
  }
  
  for (let i = 0; i < count; i++) {
    // 根据概率选择稀有度
    const roll = Math.random();
    let rarity = 'common';
    let cumulativeChance = 0;
    
    for (const [r, chance] of Object.entries(rarityChances)) {
      cumulativeChance += chance;
      if (roll <= cumulativeChance) {
        rarity = r;
        break;
      }
    }
    
    // Boss级别特殊处理
    if (isBossLevel && i === 0) {
      rarity = level >= 50 ? 'mythic' : (level >= 30 ? 'legendary' : 'epic');
    }
    
    // 怪物等级随层级上升
    const enemyLevel = Math.max(1, Math.floor(level * (0.9 + Math.random() * 0.3)));
    enemies.push(generateCharacter(enemyLevel, rarity, false));
  }
  
  return enemies;
}

/**
 * 合成升级英雄
 * @param {Object} baseHero 基础英雄
 * @param {Object} sacrificeHero 被消耗的英雄
 * @returns {Object} 升级后的英雄
 */
function upgradeHero(baseHero, sacrificeHero) {
  // 简单的属性提升
  const upgradedHero = { ...baseHero };
  
  // 等级提升
  upgradedHero.level = Math.min(100, baseHero.level + Math.ceil(sacrificeHero.level / 3));
  
  // 属性提升
  Object.keys(upgradedHero.stats).forEach(stat => {
    const increase = Math.floor(sacrificeHero.stats[stat] * 0.2);
    upgradedHero.stats[stat] += increase;
  });
  
  // 重新计算战力
  upgradedHero.power = Math.floor(
    upgradedHero.stats.hp / 10 +
    upgradedHero.stats.atk * 2 +
    upgradedHero.stats.def * 1.5 +
    upgradedHero.stats.spd * 2 +
    upgradedHero.stats.crit
  );
  
  // 有几率获得被消耗英雄的一个技能
  if (Math.random() < 0.3 && sacrificeHero.skills.length > 0) {
    const newSkill = sacrificeHero.skills[Math.floor(Math.random() * sacrificeHero.skills.length)];
    if (!upgradedHero.skills.includes(newSkill)) {
      upgradedHero.skills.push(newSkill);
      // 限制最大技能数量
      if (upgradedHero.skills.length > 5) {
        upgradedHero.skills.splice(0, 1);
      }
    }
  }
  
  return upgradedHero;
}

export {
  generateCharacter,
  generateHeroShop,
  generateEnemies,
  upgradeHero,
  RACE_MODULES,
  CLASS_MODULES,
  ATTRIBUTE_MODULES,
  SPECIAL_ABILITY_MODULES,
  COMBAT_STYLE_MODULES,
  RARITY_LEVELS
}; 