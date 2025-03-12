# 经典贪吃蛇网页游戏

这是一个使用纯HTML、CSS和JavaScript开发的经典贪吃蛇网页游戏。游戏具有友好的用户界面，多种难度选择，以及适配移动设备的控制方式。

## 功能特点

- 美观的用户界面和游戏体验
- 三种难度级别（简单、中等、困难）
- 分数系统和最高分记录（使用本地存储）
- 键盘控制（方向键和WASD）
- 移动设备触摸控制
- 游戏暂停/继续功能
- 游戏结束提示和重新开始选项

## 如何运行

1. 下载所有文件（index.html, style.css, script.js）
2. 在浏览器中打开index.html文件
3. 点击"开始游戏"按钮开始游戏

## 游戏规则

- 使用键盘方向键或WASD键控制蛇的移动方向
- 在移动设备上，可以使用屏幕上的方向按钮控制
- 控制蛇吃到红色食物，每吃到一个食物，蛇的长度会增加，分数也会增加
- 根据难度级别，分数增加的倍率不同（简单：1倍，中等：2倍，困难：3倍）
- 如果蛇碰到自己的身体或游戏边界，游戏结束
- 按空格键可以暂停/继续游戏

## 技术细节

本游戏使用以下技术开发：

- HTML5 Canvas用于游戏渲染
- 原生JavaScript实现游戏逻辑
- CSS3用于游戏界面样式
- 本地存储（localStorage）保存最高分记录

## 浏览器兼容性

游戏兼容所有现代浏览器，包括：

- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari
- Opera

## 未来改进计划

- 添加音效
- 增加特殊食物（如双倍分数、减速等）
- 添加游戏排行榜功能
- 增加更多自定义选项（如蛇的外观、游戏主题等）

## 许可

本项目使用MIT许可证