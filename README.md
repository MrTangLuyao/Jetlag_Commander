# Jetlag Commander

### Circadian Rhythm Reset Terminal

> A small browser tool that generates strict Sleep / Wake plans to help you reset jet lag and broken sleep schedules.

[中文说明 (Chinese Documentation)](#cn)

---

Live Demo 在线体验: https://jetlag.louie1.com/

---

## Introduction

Jetlag Commander is a client‑side web app that uses simple time inputs to build a step‑by‑step Sleep / Wake schedule.
It is designed for long‑haul flights, shift work recovery, and fixing late‑night habits by giving you a clear plan instead of vague tips.

## Features

- Runs fully in the browser, no backend or data upload.
- One‑click language toggle between English and Chinese on the page.
- Multiple strategy modes (auto smart, force early, force late, linear, rapid fold) to generate daily schedules.

## Usage

1. Open `index.html` locally, or visit the online demo.
2. Enter your last real sleep time and last real wake time, with their time zone.  
3. Choose your target time zone and a strategy model.  
4. Click the execute button to generate the plan.
5. Follow the generated daily Sleep / Wake times as strictly as you can for a few days.

## Tech Stack

- HTML5 single page.  
- Tailwind CSS via CDN.  
- Luxon.js for time zone calculations.

## License

MIT License.

---

<div id="cn"></div>

# Jetlag Commander - 中文说明

### 昼夜节律重置终端
---

Live Demo 在线体验: https://jetlag.louie1.com/

---

> 一个网站，通过简单输入生成严格的 Sleep / Wake 时间表，帮助你重置时差和打乱的作息。

[Back to English](#jetlag-commander)

## 简介

Jetlag Commander 是纯前端网页应用，通过你提供的时间信息，计算出每天应该几点睡、几点起的时间表。  
适用于跨洲飞行、倒班后恢复、长期熬夜后想强制拉回正常作息的场景。

## 功能

- 完全在本地浏览器运行，不需要服务器，也不会上传数据。  
- 页面内置中英文切换按钮。  
- 提供多种策略模式（智能自动、强制早睡、强制晚睡、线性均分、快速折中）生成每日计划。

## 使用方法

1. 本地打开 `index.html`，或直接访问在线 Demo 页面。  
2. 输入你上一次真实的入睡时间和起床时间，以及对应时区。  
3. 选择目标时区和算法策略。  
4. 点击执行按钮生成时间表。  
5. 按照每天的 Sleep / Wake 时间尽量严格执行几天，即可逐步对齐新作息。

## 技术栈

- HTML5 单页。  
- Tailwind CSS（CDN 引入）。  
- Luxon.js 负责时区和时间计算。

## 许可证

MIT License.
