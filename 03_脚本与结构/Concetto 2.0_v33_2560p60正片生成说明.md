# Concetto 2.0 v33 2560p60 正片生成说明

- 基于 v30 已确认视觉版本的分段清单；
- 仅替换操作演示相关素材引用，其他片段顺序与视觉逻辑保持不变；
- 操作演示引用 v33 正片级 4x 超分/修复 1440p60 片段；
- 输出阶段先逐段统一 CFR 60fps、2560×1440、H.264 CRF 12，再串接，避免混合片段 timebase/PTS 造成全片压缩或卡顿；
- 音频重新铺底并使用 192kbps AAC。

输出视频：`/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/Concetto_2.0_正片_v33_2560p60.mp4`
视频流：2560×1440 / 10201000/170021 / 170.021s
操作段预览：`/Users/gareld_qiu/ai project/Codex/concetto全量视频/06_预览输出/Concetto_2.0_正片_v33_2560p60_操作段预览.jpg`

## 素材引用替换

| 原 basename | 新素材 |
| --- | --- |
| sec_01_operation_ai_x4.mp4 | 06_预览输出/refined_v33_final_2560p60_parts/ops/sec_01_operation_ai_x4_1440p60.mp4 |
| sec_02_operation_ai_x4.mp4 | 06_预览输出/refined_v33_final_2560p60_parts/ops/sec_02_operation_ai_x4_1440p60.mp4 |
| sec_03_operation_ai_x4.mp4 | 06_预览输出/refined_v33_final_2560p60_parts/ops/sec_03_operation_ai_x4_1440p60.mp4 |
| sec_04_operation_ai_x4.mp4 | 06_预览输出/refined_v33_final_2560p60_parts/ops/sec_04_operation_ai_x4_1440p60.mp4 |
| sec_05_operation_normal_ai_x4.mp4 | 06_预览输出/refined_v33_final_2560p60_parts/ops/sec_05_operation_normal_ai_x4_1440p60.mp4 |
| sec_05_operation_suite_ai_x4.mp4 | 06_预览输出/refined_v33_final_2560p60_parts/ops/sec_05_operation_suite_ai_x4_1440p60.mp4 |
| sec_06_operation_ai_x4.mp4 | 06_预览输出/refined_v33_final_2560p60_parts/ops/sec_06_operation_ai_x4_1440p60.mp4 |
| sec_07_operation_ai_x4.mp4 | 06_预览输出/refined_v33_final_2560p60_parts/ops/sec_07_operation_ai_x4_1440p60.mp4 |
| sec_08_operation_ai_x4.mp4 | 06_预览输出/refined_v33_final_2560p60_parts/ops/sec_08_operation_ai_x4_1440p60.mp4 |
| sec_09_text_generation_with_title_v22.mp4 | 06_预览输出/refined_v33_final_2560p60_parts/ops/sec_09_text_generation_with_title_1440p60.mp4 |
