# 高帧率版手动保存素材 60fps 清晰化处理说明

输入目录：`/Users/gareld_qiu/ai project/Codex/concetto全量视频/高帧率版手动保存素材`
输出目录：`/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60`

处理规格：

- 输出：1920×1080，60fps，H.264，yuv420p，无音频；
- 原始素材均为 2560×1440 / 60fps，本次采用 Lanczos 高质量降采样到正片工作规格；
- 做轻度 UI 锐化、轻微对比度与饱和度整理，避免过度 AI 超分造成文字伪影；
- 原始素材不覆盖，全部输出到独立文件夹，后续正片可直接引用。

快速检查串联视频：`/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/_预览/高帧率清晰化素材_快速检查串联.mp4`
抽帧总览：`/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/_预览/高帧率清晰化素材_抽帧总览.jpg`

| 环节/素材 | 输入规格 | 输出规格 | 输出文件 |
| --- | --- | --- | --- |
| 场地定位/场地定位-1.mov | 2560×1440, 60/1, 7.10s | 1920×1080, 60/1, 7.10s | `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/场地定位/场地定位-1_清晰化_1080p60.mp4` |
| 车库智能排布/车库智能排布-1.mov | 2560×1440, 60/1, 11.20s | 1920×1080, 60/1, 11.20s | `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/车库智能排布/车库智能排布-1_清晰化_1080p60.mp4` |
| 灵感渲染（普通渲染）/灵感渲染（普通渲染）-1.mov | 2560×1440, 60/1, 10.58s | 1920×1080, 60/1, 10.58s | `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/灵感渲染（普通渲染）/灵感渲染（普通渲染）-1_清晰化_1080p60.mp4` |
| 灵感渲染（生成套图）/灵感渲染（生成套图）-1.mov | 2560×1440, 60/1, 3.88s | 1920×1080, 60/1, 3.88s | `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/灵感渲染（生成套图）/灵感渲染（生成套图）-1_清晰化_1080p60.mp4` |
| 前策分析/前策分析-1.mov | 2560×1440, 60/1, 5.57s | 1920×1080, 60/1, 5.57s | `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/前策分析/前策分析-1_清晰化_1080p60.mp4` |
| 数智建模/数智建模-1.mov | 2560×1440, 60/1, 11.00s | 1920×1080, 60/1, 11.00s | `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/数智建模/数智建模-1_清晰化_1080p60.mp4` |
| 图生模型/图生模型-1.mov | 2560×1440, 60/1, 9.65s | 1920×1080, 60/1, 9.65s | `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/图生模型/图生模型-1_清晰化_1080p60.mp4` |
| 文本生成/文本生成-1.mov | 2560×1440, 60/1, 3.22s | 1920×1080, 60/1, 3.22s | `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/文本生成/文本生成-1_清晰化_1080p60.mp4` |
| ai成本估算/ai成本估算-1.mov | 2560×1440, 60/1, 8.12s | 1920×1080, 60/1, 8.12s | `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/ai成本估算/ai成本估算-1_清晰化_1080p60.mp4` |
| ai仿真分析/ai仿真分析-1.mov | 2560×1440, 60/1, 7.75s | 1920×1080, 60/1, 7.75s | `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/ai仿真分析/ai仿真分析-1_清晰化_1080p60.mp4` |

前后对比图：

- `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/_预览/场地定位_前后对比.jpg`
- `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/_预览/车库智能排布_前后对比.jpg`
- `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/_预览/灵感渲染（普通渲染）_前后对比.jpg`
- `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/_预览/灵感渲染（生成套图）_前后对比.jpg`
- `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/_预览/前策分析_前后对比.jpg`
- `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/_预览/数智建模_前后对比.jpg`
- `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/_预览/图生模型_前后对比.jpg`
- `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/_预览/文本生成_前后对比.jpg`
- `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/_预览/ai成本估算_前后对比.jpg`
- `/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/高帧率版手动保存素材_清晰化_1080p60/_预览/ai仿真分析_前后对比.jpg`
