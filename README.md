# family-growth

家庭成长工具 monorepo。

## 项目

- **[summer-checkin](./summer-checkin/)**：桐桐和松松的暑假打卡 PWA（冒险地图 + 徽章系统）
- **[daily-plan](./daily-plan/)**：日常计划 PWA（git submodule）

## summer-checkin 使用说明

### 在线访问

GitHub Pages 地址：https://yinxiaowei10.github.io/family-growth/summer-checkin/

### 添加到手机桌面（像 App 一样使用）

1. 用 Safari / Chrome 打开上面的地址
2. 点击底部「分享」按钮（iOS）或右上角菜单（Android）
3. 选择「添加到主屏幕」
4. 桌面上会出现「暑假冒险岛」图标，点击即可全屏使用

### 每日打卡

1. 打开 App，点击「打卡」标签
2. 选择桐桐或松松
3. 勾选当天完成的任务
4. 进度环会实时更新

### 冒险地图

首页可以看到 8 周冒险地图。每周完成目标即可推进到下一节点，解锁对应奖励。

### 徽章墙

连续打卡、专项任务完成会自动解锁徽章。

### 数据统计

- 查看完成率、最长连续打卡天数
- 导出 JSON/CSV 用于备份或进一步分析
- 打印每周打卡表

### 打印纸质版

进入「数据」页，点击「打印每周打卡表」，用 A4 纸打印即可。

## 技术栈

- 纯 HTML / CSS / JavaScript
- PWA（Manifest + Service Worker）
- localStorage 本地存储
- 手绘风格视觉设计

## 本地开发

```bash
cd /Users/yinyin/projects/family-growth/summer-checkin
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 数据备份

打卡数据保存在浏览器 localStorage 中。请定期在「数据」页导出 JSON 备份。

## 角色插图

当前使用 `xiaohu-ip-studio` 的泡泡、团团角色锚点图作为头像。
更精美的插图生成提示词保存在 `summer-checkin/prompts/image-generation-prompts.md`。

