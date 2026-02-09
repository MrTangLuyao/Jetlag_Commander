# Jetlag Commander

### 🕹️ Circadian Rhythm Override Protocol

> A minimalist, hardcore web tool to mathematically align your biological clock using Phase Response Curve (PRC) dynamics.

[🇨🇳 中文说明 (Chinese Documentation)](#cn)

---

Live Demo / 在线体验: [https://jetlag.louie1.com/](https://jetlag.louie1.com/)

---

## 🔬 Introduction

Jetlag Commander is a tactical web tool designed to fix jet lag and ruined sleep schedules. Unlike gentle sleep aids, this tool uses mathematical models based on Phase Response Curves (PRC) and Sleep Pressure Dynamics to generate strict "Sleep" and "Wake" commands.

Whether you are crossing time zones, recovering from night shifts, or battling insomnia, Jetlag Commander provides a calculated path to synchronization.

## 🧠 Core Algorithms (V7.1)

The tool offers four distinct strategies to tackle time zone offsets:

### 1. ⚡️ Smart Science (Default & Recommended)
* Architecture: Non-linear Phase Compression (3-Day Cycle).
* Logic: Based on physiological limits. It shifts phase intensity non-linearly (approx. 40% -> 75% -> 100%) over 3 days.
* Goal: High-intensity adjustment. It utilizes sleep deprivation pressure in the first 48 hours to force a complete circadian lock by Day 3.

### 2. ⚖️ Linear Even
* Architecture: Standard Linear Distribution.
* Logic: Distributes the total time difference evenly over a set number of days (default: 3 days).
* Goal: A steady, conservative transition. Shifts your schedule by a fixed amount (e.g., 2 hours) every day.

### 3. 🧬 Rapid Fold
* Architecture: Half-Life Convergence.
* Logic: Eliminates 50% of the remaining time difference each day.
* Safety Lock: Includes a 4-Day Hard Stop. If the schedule hasn't converged to the target window (20:00 - 23:00) by Day 4, the system forces a schedule snap.

### 4. 🛠 Custom Cycle
* Architecture: User-defined duration using Scientific Architecture.
* Logic: Unlike traditional custom tools that divide time linearly, this applies the Non-linear Compression curve to your chosen duration (2-10 days), ensuring a natural physiological adaptation.

## 🎛 Features

* Zero Backend: Runs entirely in your browser. No data is uploaded.
* Hardcore UI: High-contrast, dark mode interface inspired by terminal aesthetics.
* i18n Support: One-click toggle between CN and EN.
* Visual Timeline: Clear, color-coded cards for Sleep (Blue) and Wake (Orange) times.

## 😸 Usage

1.  Open `index.html` (or visit the demo).
2.  Step 1 & 2: Input your *last* actual sleep and wake times.
3.  Step 3: Select your Target Time Zone.
4.  Step 4: Choose your strategy model.
5.  Click EXECUTE.
6.  Follow the generated timeline strictly.

## 🦄 Tech Stack

* HTML5
* Tailwind CSS (via CDN)
* Luxon.js (for time zone math)

---

<div id="cn"></div>

# 🇨🇳 Jetlag Commander - 中文说明

### 🕹️ 昼夜节律重置终端

> 一个极简主义的硬核网页工具，基于相位响应曲线 (PRC) 动力学，通过数学计算强制重置生物钟。

[🇺🇸 Back to English](#jetlag-commander)

## 🔬 简介

Jetlag Commander 是一个战术级的生物钟调节工具。与温和的助眠建议不同，它利用相位响应曲线 (PRC) 和睡眠压力模型，为你生成绝对的“指令级”作息方案。

无论你是进行环球飞行、倒班工作，还是单纯想修正混乱的作息，它都能为你计算出一条最优的数学路径。

## 🧠 核心算法模型 (V7.1)

本工具提供四种不同架构的算法策略：

### 1. ⚡️ 智能科学 (Smart Science) - *默认推荐*
* 架构: 非线性相位压缩 (3天周期)。
* 逻辑: 基于生理极限的非线性步进。在前两天进行高强度的相位压缩（约完成 40% -> 75%），利用累积的睡眠压力在 第 3 天 强制闭环。
* 目标: 科学、快速且符合生理惯性的调整方案。

### 2. ⚖️ 线性均分 (Linear Even)
* 架构: 标准线性分布。
* 逻辑: 将总时差平均分配到指定天数（默认 3 天）。
* 目标: 平稳过渡。每天移动固定步长（例如每天固定移动 2 小时）。

### 3. 🧬 快速折中 (Rapid Fold)
* 架构: 半衰期收敛。
* 逻辑: 每天消除 50% 的剩余时差。
* 熔断机制: 包含 4天强制熔断。如果作息在第 4 天仍未收敛至黄金区间 (20:00 - 23:00)，系统将强制吸附至目标时间，确保任务完成。

### 4. 🛠 自定义周期 (Custom Cycle)
* 架构: 用户指定天数 + 科学架构。
* 逻辑: 与传统的线性除法不同，自定义模式现在内核已升级为 非线性压缩算法。它会将科学的 PRC 曲线应用到你指定的天数（2-10天）中，比单纯的平均分配更符合人体工学。

## 🎛 功能特性

* 零后端隐私保护: 所有计算均在本地浏览器完成，无数据上传。
* 硬核视觉: 灵感源自终端的高对比度暗色界面。
* 中英双语: 内置 CN / EN 一键切换。
* 可视化时间轴: 清晰的卡片式展示：入睡（蓝）与 唤醒（橙）。

## 😸 使用方法

1.  打开网页或 `index.html`。
2.  步骤 1 & 2: 输入你*上一次*真实的入睡和唤醒时间（以及对应的时区）。
3.  步骤 3: 选择你的目标时区。
4.  步骤 4: 选择算法模型。
5.  点击 生成强制指令 (EXECUTE)。
6.  严格按照生成的时间表执行。

## 🦄 技术栈

* HTML5
* Tailwind CSS (via CDN)
* Luxon.js (用于时区计算)

---

## 📄 License

MIT License
