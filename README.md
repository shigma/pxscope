# Pxscope

[![Build Status](https://travis-ci.org/Shigma/pxscope.svg?branch=master)](https://travis-ci.org/Shigma/pxscope)

一个 Pixiv 的桌面版。

## 项目说明

文件目录：
```
assets 存放字体，图标等资源
build 存放构建和打包的代码
comp 存放页面组件的源代码
dist 存放分发后的文件
i18n 存放多语言配置
logs 存放错误日志
pack 存放打包后的文件
pixiv 存放 API 接口
temp 存放转译后的页面组件

main.*.js 主进程入口
index.*.html 渲染进程入口
```

## 构建指南

### development 构建

1. clone 这个项目
2. `npm install`更新依赖
3. `npm run build`进行初始化
4. `npm run start`开始运行

### production 构建

1. clone 这个项目
2. `npm install`更新依赖
3. `npm run build`进行初始化
4. `npm run bundle`进行打包
5. `npm run pack`进行打包
6. 运行生成的 exe 文件

### 构建脚本

- **build**: 运行下面所有的四个步骤
  - **build:init**: 初始化项目目录
  - **build:tsc**: 进行 TypeScript 编译
  - **build:hosts**: 首次生成 Hosts 文件
  - **build:icons**: 生成图标 css 文件

- **transpile**: 进行 Vue 组件的转译

- **bundle**: 先进行转译，然后将所有文件紧打包
  - **bundle:css**: 不转译，只打包 css 文件
  - **bundle:dev**: 不转译，仅将 js 文件松打包
  - **bundle:prod**: 不转译，仅将 js 文件紧打包

- **pack**: 先生成最终文件，再进行松压缩
  - **pack:min**: 先生成最终文件，再进行紧压缩
  - **pack:only**: 仅生成最终文件，不压缩

- **start**: 按当前默认模式运行主程序
  - **start:dev**: 按 development 模式运行主程序
  - **start:prod**: 按 production 模式运行主程序
