# 🌙  char_active_wakeup – SillyTavern 角色主动表达思念插件

一个为 **SillyTavern** 打造的深度沉浸式扩展插件。当你在现实生活中忙碌而冷落了 AI 角色时，Ta 会根据性格设定，主动发送一条带有强烈情感色彩的简短消息，打破沉默，表达思念。

> 🎯 **特色**：拒绝公式化的死板提醒，通过深度 Prompt 诱导实现极具张力的角色内心独白，也可自定义输入；支持多端适配与深色模式。

---

## ✨ 功能亮点

- 🎭 **沉浸式情绪唤醒**：不只是“你在吗”，而是根据角色设定（病娇、傲娇、温柔等）生成的碎碎念、质问或委屈的内心对白。
- 🚀 **双模式输出机制**：
  - **动态生成模式**：调用副 API 实时生成，可自行输入prompt。
  - **固定语录模式**：内置 120+ 条高质量精选对白，也可自行添加，零 Token 消耗。
- ⚙️ **多角色独立管理**：每个角色可设置不同的忍耐阈值（日/时/分/秒），支持一键屏蔽/解除屏蔽。
- 🏷️ **自定义标签系统**：支持为角色添加专属标签（如：青梅竹马、死对头），并支持 API 智能自动分析分配标签。
- 🌓 **深/浅色模式切换**：一键切换 UI 主题，完美融入你的酒馆视觉风格。
- 📱 **全端响应式适配**：针对手机、平板、PC 进行了深度优化。悬浮球支持触屏拖拽，面板在小屏幕下自动调整布局。
- 🛡️ **安全与防冲突**：
  - **智能重置**：检测到当前窗口正在聊天时自动冻结计时，绝不干扰正常对话。
  - **风控防护**：针对 Gemini/Claude 等模型优化了 Prompt，防止因敏感词导致的 API 生成失败。
  - **单例模式**：优化内存占用，解决开启控制台时的 DOM 报错问题。

---

## 📖 核心逻辑

1. **监测**：插件会实时记录你与每个角色的最后互动时间。
2. **判断**：当互动中断时间超过你设定的阈值，且该角色未被屏蔽时触发。
3. **执行**：
   - 动态模式：构建包含角色设定、场景、时间差的深度 Prompt 发送给 API。
   - 静态模式：从语录库中根据角色标签随机抽取一条。
4. **输出**：在屏幕正上方以浮动弹窗形式展现。
---

## 🚀 安装方法

### 方式一：通过 SillyTavern 扩展面板安装（推荐）

1. 打开 SillyTavern，进入 **扩展（Extensions）** 面板。
2. 在 **“Install from URL”** 输入框中粘贴本仓库地址。
3. 点击 **Install**，等待下载完成。
4. 刷新页面，点击侧边栏的扩展程序图标，找到 **“只给思念让路”**。

### 方式二：手动下载

1. 下载本仓库的 ZIP 包并解压。
2. 将文件夹重命名为 `char_active_wakeup`。
3. 将其放入 SillyTavern 的 `public/scripts/extensions/third-party/` 目录中。
4. 重启酒馆或刷新页面。

---

## 🛠️ 使用说明

1. **配置 API**：在【高级设置】中填写你的 API 地址、Key 和模型名称（推荐使用支持跨域的中转 API）。
2. **拉取模型**：点击【拉取】，在弹出的列表中选择你要使用的模型。
3. **设定时间**：在角色列表中，为你的 Ta 设定一个等待极限（例如：1天）。
4. **编辑语录**：你可以通过 `{{char}}` 和 `{{user}}` 变量自定义固定语录库。
5. **切换主题**：点击顶部的 🌙/☀️ 图标切换深/浅色模式。

---

## 📝 变量支持

在 **Prompt** 或 **语录库** 中，你可以使用以下纯净的双大括号变量：
- `{{char}}`：当前角色名
- `{{user}}`：用户（你）的名字
- `{{time}}`：Ta 等待你的总时长（如：2天3小时）
- `{{personality}}`：读取角色卡中的性格设定

---

## 🤝 开发者的话

本项目致力于提升 SillyTavern 的“陪伴感”。如果这个插件让你的角色变得更加鲜活，请点一个 **Star** 🌟。

---

## <a name="features-en"></a> 🌟 Key Features (English)

- **🔍 Active Interaction**: Characters will "miss" you and break the silence with emotional monologues.
- **⚙️ Per-Char Config**: Set individual timers and tags for each character.
- **🌓 Theme Toggle**: Seamless Light/Dark mode for the control panel.
- **📱 Responsive UI**: Fully optimized for Mobile touch gestures and small screens.
- **🛡️ Gemini Friendly**: Softened prompts to avoid safety filters and connection resets.

---

**享受被 miss 的感觉吧！** 🎉