# xiaohu-ip-studio 生图提示词存档

本项目当前使用 `xiaohu-ip-studio` 角色锚点图作为头像占位。
后续可运行以下提示词生成更精美的插图。

## 角色选择
- 桐桐：泡泡 (paopao) — 蓝色泡泡、梦幻、爱想象
- 松松：团团 (tuantuan) — 橙色圆润、可爱、低龄友好

## 首页主视觉 (hero.png)

风格：手绘线稿淡彩、白底留白、细黑墨线 + 淡彩晕染

提示词：
```
A wide horizontal children's summer adventure island scene.
Two cute hand-drawn characters standing at the entrance of a whimsical island:
- On the left: a dreamy blue bubble-shaped character (paopao) holding a book
- On the right: a round orange blob character (tuantuan) holding a small flag
The island has palm trees, a winding path, a treasure chest, and a sun in the sky.
Simple black ink outlines, soft watercolor washes, white background with plenty of breathing room.
Cheerful, playful, minimalist children's book illustration style.
```

参考图：
- `characters/paopao/refs/paopao-锚点.png`
- `characters/tuantuan/refs/tuantuan-锚点.png`

## 地图节点背景 (map-bg.png)

提示词：
```
A hand-drawn horizontal island path map for children.
White background, simple black ink outlines, soft watercolor accents in orange and blue.
A dotted winding path connecting 8 small circular nodes.
Each node has a tiny icon: rocket, tent, river, mountain, forest, beach, peak, trophy.
Plenty of white space, cheerful, minimalist.
```

## 徽章图标

可复用角色表情或单独生成：
- 连续3天：一团小火苗 🔥
- 连续7天：一颗闪闪发光的星星 🌟
- 运动达人：角色在跑步/户外
- 阅读达人：角色抱着书
- 写作之星：角色在写字

生成命令示例：
```bash
cd /Users/yinyin/.claude/skills/xiaohu-ip-studio
python3 scripts/generate.py \
  --prompt-file prompts/hero-shot.md \
  --reference characters/paopao/refs/paopao-锚点.png \
  --reference characters/tuantuan/refs/tuantuan-锚点.png \
  --out /Users/yinyin/projects/family-growth/summer-checkin/assets/characters/hero.png
```

## 配置检查

运行前确保已配置图像 API：
```bash
cd /Users/yinyin/.claude/skills/xiaohu-ip-studio
python3 scripts/illo.py init
python3 scripts/illo.py doctor
```
