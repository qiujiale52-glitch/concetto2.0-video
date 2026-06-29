# Concetto 2.0 AI 超分操作演示 v22 模板修正

- 基于 v18/v16 的既有合成列表，仅替换所有操作演示片段；
- 修复 v19 在部分播放器中操作演示段黑屏的问题：最终拼接从 `-c copy` 改为统一 1920×1080、30fps、yuv420p 全片重编码，并写入 `faststart`；
- 操作录屏统一裁切掉冗余边框，并放大到接近全画面内容区；
- 使用项目本地 Real-ESRGAN ncnn Vulkan，模型：`realesr-animevideov3`，x4 超分；
- AI 处理帧率：12fps，最终封装：30fps；
- 输出使用 CRF 16，降低二次压缩导致的糊化。
- v22 修正：统一右移操作演示顶部编号与标题，避免编号和左侧英文标题重叠；
- v22 修正：AI 仿真分析段单独扩大纵向取景，保留成果展示底部“视野 / 人行流线 / 碳排放”文字。

| 环节 | 源素材 | 新片段 |
|---|---|---|
| 01 前策分析 | 前策分析-1.mov | sec_01_operation_ai_x4.mp4 |
| 02 场地定位 | 场地定位-1.mov | sec_02_operation_ai_x4.mp4 |
| 03 图生模型 | 图生模型-1.mov | sec_03_operation_ai_x4.mp4 |
| 04 数智建模 | 数智建模-1.mov | sec_04_operation_ai_x4.mp4 |
| 05 AI灵感渲染 | 灵感渲染（普通渲染）.mov | sec_05_operation_normal_ai_x4.mp4 |
| 05 AI灵感渲染 | 灵感渲染（生成套图）-1.mov | sec_05_operation_suite_ai_x4.mp4 |
| 06 总图排布 | 车库智能排布-1.mov | sec_06_operation_ai_x4.mp4 |
| 07 AI仿真分析 | ai仿真分析-1.mov | sec_07_operation_ai_x4.mp4 |
| 08 AI成本估算 | ai成本估算-1.mov | sec_08_operation_ai_x4.mp4 |
| 09 文本生成 | 文本生成-1.mov | sec_09_text_generation_direct_ai_x4.mp4 |

输出视频：`/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/Concetto_2.0_AI超分操作演示_v22_ops_低清.mp4`
全片预览：`/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/Concetto_2.0_AI超分操作演示_v22_ops_全片预览.jpg`
操作段预览：`/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/Concetto_2.0_AI超分操作演示_v22_ops_操作段预览.jpg`
