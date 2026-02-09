# Jetlag Commander

### 🕹️ Circadian Rhythm Override Protocol

> A minimalist, hardcore web tool to manage jet lag, helping adjust sleep schedules for late nights and long-haul flights.

[中文说明 (Chinese Documentation)](#cn)

---

## 🔬 Introduction

Jetlag Commander is a web-based tool designed to mathematically realign your internal biological clock. Unlike gentle sleep aids, this tool calculates phase response curves to generate strict "Sleep" and "Wake" commands.

Whether you are crossing time zones, working night shifts, or just fixing a ruined sleep schedule, Jetlag Commander provides the tactical schedule you need.

## 🧠 Core Algorithms

The tool offers three distinct strategies to tackle time zone offsets:

### 1. ⚡️ Aggressive Fold (Single Day)
* Logic: Calculates the geometric midpoint between your "physiological inertia" (when your body wants to sleep) and the "target bedtime".
* Goal: A hard reset in a single day. It forces a compromise that is physically possible but maximizes the phase shift.

### 2. ⚖️ Smart Linear
* Logic: Distributes the total time difference evenly over a set number of days (e.g., 3 days).
* Goal: A steady, conservative transition. Shifts your schedule by a fixed amount (e.g., 2 hours) every day.

### 3. 🧬 Smart Fold (Recommended)
* Logic: Uses a "half-life" approach, eliminating 50% of the remaining time difference each day.
* Safety Lock: Includes a 4-Day Hard Stop. If the schedule hasn't converged to the target window (20:00 - 23:00) by Day 4, the system forces a schedule snap.

## 🎛 Features

* Zero Backend: Runs entirely in your browser. No data is uploaded.
* Hardcore UI: High-contrast, dark mode interface inspired by terminal aesthetics.
* i18n Support: One-click toggle between CN and EN.
* Visual Timeline: Clear, color-coded cards for Sleep (Blue) and Wake (Orange) times.

## 😸 Usage

1.  Open `index.html` in any modern browser.
2.  Step 1 & 2: Input your *last* actual sleep and wake times (and their time zones).
3.  Step 3: Select your Target Time Zone.
4.  Step 4: Choose your strategy (Aggressive, Linear, or Fold).
5.  Click EXECUTE.
6.  Follow the generated timeline strictly.

## 🦄 Tech Stack

* HTML5
* Tailwind CSS (via CDN)
* Luxon.js (for time zone math)

---

<div id="cn"></div>

# Jetlag Commander - 中文说明

### 🕹️ 昼夜节律重置终端

> 一个极简主义的硬核网页工具，旨在通过数学计算重置你的生物钟，适用于环球旅行、倒班工作或熬夜后的作息调整。

[🇺🇸 Back to English](#jetlag-commander)

## 🔬 简介

Jetlag Commander 是一个基于浏览器的硬核工具，旨在通过数学模型重置你的生物钟。与市面上温和的助眠应用不同，本工具基于生理相位响应原理，提供绝对的“指令级”作息方案。

无论你是进行环球飞行、倒班工作，还是单纯想修正混乱的作息，它都能为你生成战术级的睡眠计划。

## 🧠 核心算法模型

本工具提供三种不同强度的算法策略：

### 1. ⚡️ 暴力折中 (Aggressive Fold)
* 逻辑: 计算“生理惯性”（身体想睡的时间）与“目标时间”的几何中心点。
* 目标: 单日强力复位。在不破坏生理极限的前提下，进行最大程度的相位拉扯。

### 2. ⚖️ 智能均分 (Smart Linear)
* 逻辑: 将总时差平均分配到指定天数（如3天）。
* 目标: 平稳过渡。每天移动固定步长（例如每天移动2小时）。

### 3. 🧬 智能折中 (Smart Fold - 推荐)
* 逻辑: 采用“半衰期”式逻辑，每天消除 50% 的剩余时差。
* 熔断机制: 包含 4天强制熔断。如果作息在第4天仍未收敛至黄金区间 (20:00 - 23:00)，系统将强制吸附至目标时间，确保任务完成。

## 🎛 功能特性

* 零后端隐私保护: 所有计算均在本地浏览器完成，无数据上传。
* 硬核视觉: 灵感源自终端的高对比度暗色界面。
* 中英双语: 内置 CN / EN 一键切换。
* 可视化时间轴: 清晰的卡片式展示：入睡（蓝）与 唤醒（橙）。

## 😸 使用方法

1.  在浏览器中打开 `index.html`。
2.  步骤 1 & 2: 输入你*上一次*真实的入睡和唤醒时间（以及对应的时区）。
3.  步骤 3: 选择你的目标时区。
4.  步骤 4: 选择算法策略（暴力、均分或折中）。
5.  点击 生成强制指令 (EXECUTE)。
6.  严格按照生成的时间表执行。

## 🦄 技术栈

* HTML5
* Tailwind CSS (via CDN)
* Luxon.js (用于时区计算)

---

## 📄 License

MIT License
