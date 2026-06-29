# Concetto 2.0 v31 正片级操作素材 x4 / 1440p60

- 输入：`高帧率版手动保存素材` 中 2560×1440/60fps 录屏；
- 处理：先裁切 UI 有效区域，再 Real-ESRGAN x4，最后回落到 2560×1440/60fps 包装段；
- 前策分析单独使用更紧裁切，减少文字边缘发虚；
- AI 仿真分析单独保留更高纵向范围，避免底部说明文字被裁掉；
- 输出为 H.264 CRF 10 / yuv420p / 60fps，可直接用于正片拼接。

| 环节 | 输入 | 输出 | 分辨率 | 帧率 | 时长 | 大小 | 裁切 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 前策分析 | 高帧率版手动保存素材/前策分析/前策分析-1.mov | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_01_operation_ai_x4_1440p60.mp4 | 2560×1440 | 60/1 | 5.567s | 4.3 MB | 1850:924:355:295 |
| 02 场地定位 | 高帧率版手动保存素材/场地定位/场地定位-1.mov | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_02_operation_ai_x4_1440p60.mp4 | 2560×1440 | 60/1 | 7.083s | 15.7 MB | 1974:988:294:226 |
| 03 图生模型 | 高帧率版手动保存素材/图生模型/图生模型-1.mov | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_03_operation_ai_x4_1440p60.mp4 | 2560×1440 | 60/1 | 9.633s | 23.4 MB | 1974:988:294:226 |
| 04 数智建模 | 高帧率版手动保存素材/数智建模/数智建模-1.mov | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_04_operation_ai_x4_1440p60.mp4 | 2560×1440 | 60/1 | 11.000s | 5.2 MB | 1974:988:294:226 |
| 05 AI灵感渲染 | 高帧率版手动保存素材/灵感渲染（普通渲染）/灵感渲染（普通渲染）-1.mov | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_05_operation_normal_ai_x4_1440p60.mp4 | 2560×1440 | 60/1 | 10.567s | 14.5 MB | 1974:988:294:226 |
| 05 AI灵感渲染 | 高帧率版手动保存素材/灵感渲染（生成套图）/灵感渲染（生成套图）-1.mov | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_05_operation_suite_ai_x4_1440p60.mp4 | 2560×1440 | 60/1 | 3.883s | 3.0 MB | 1974:988:294:226 |
| 06 总图排布 | 高帧率版手动保存素材/车库智能排布/车库智能排布-1.mov | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_06_operation_ai_x4_1440p60.mp4 | 2560×1440 | 60/1 | 11.200s | 7.3 MB | 1974:988:294:226 |
| 07 AI仿真分析 | 高帧率版手动保存素材/ai仿真分析/ai仿真分析-1.mov | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_07_operation_ai_x4_1440p60.mp4 | 2560×1440 | 60/1 | 7.717s | 20.4 MB | 2400:1240:80:96 |
| 08 AI成本估算 | 高帧率版手动保存素材/ai成本估算/ai成本估算-1.mov | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_08_operation_ai_x4_1440p60.mp4 | 2560×1440 | 60/1 | 8.117s | 6.3 MB | 1974:988:294:226 |
| 09 文本生成 | 高帧率版手动保存素材/文本生成/文本生成-1.mov | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_09_text_generation_direct_ai_x4_1440p60.mp4 | 2560×1440 | 60/1 | 3.200s | 13.5 MB | 1974:988:294:226 |

## 正片脚本替换映射

| 旧素材 basename | 新素材 |
| --- | --- |
| sec_01_operation_ai_x4.mp4 | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_01_operation_ai_x4_1440p60.mp4 |
| sec_02_operation_ai_x4.mp4 | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_02_operation_ai_x4_1440p60.mp4 |
| sec_03_operation_ai_x4.mp4 | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_03_operation_ai_x4_1440p60.mp4 |
| sec_04_operation_ai_x4.mp4 | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_04_operation_ai_x4_1440p60.mp4 |
| sec_05_operation_normal_ai_x4.mp4 | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_05_operation_normal_ai_x4_1440p60.mp4 |
| sec_05_operation_suite_ai_x4.mp4 | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_05_operation_suite_ai_x4_1440p60.mp4 |
| sec_06_operation_ai_x4.mp4 | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_06_operation_ai_x4_1440p60.mp4 |
| sec_07_operation_ai_x4.mp4 | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_07_operation_ai_x4_1440p60.mp4 |
| sec_08_operation_ai_x4.mp4 | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_08_operation_ai_x4_1440p60.mp4 |
| sec_09_text_generation_with_title_v22.mp4 | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_09_text_generation_with_title_1440p60.mp4 |
| sec_09_text_generation_direct_ai_x4.mp4 | 06_预览输出/refined_v31_final_2560p60_parts/ops/sec_09_text_generation_with_title_1440p60.mp4 |
