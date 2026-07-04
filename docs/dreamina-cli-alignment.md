# Dreamina CLI Alignment

This document records the Dreamina CLI surface that Workflow Studio wraps. Treat live
`dreamina -h` and `dreamina <subcommand> -h` output as the source of truth before changing adapter
parameters.

## Checked Sources

- Local CLI help checked on 2026-07-04.
- Official Lark guide revision 743, "即梦 CLI 体验指南".
- Local CLI build: `2a20fff-dirty`, build time `2026-06-26T06:36:39Z`.

## Current Generation Surface

| Command | Current alignment notes |
| --- | --- |
| `text2image` | Supports `model_version` `3.0`, `3.1`, `4.0`, `4.1`, `4.5`, `4.6`, `4.7`, `5.0`; `generate_num` 1-10; `1k` only with `3.0`/`3.1`; `4k` with `4.x`/`5.0`. |
| `image2image` | Accepts 1-10 images; supports `model_version` `4.0`, `4.1`, `4.5`, `4.6`, `4.7`, `5.0`; `generate_num` 1-10; `resolution_type` `2k`/`4k`. |
| `image_upscale` | Supports `2k`, `4k`, `8k`; `4k` and `8k` require VIP. |
| `text2video` | Supports Seedance 2.0 family plus `seedance2.0mini`; only `seedance2.0_vip` supports `1080p` and `4k`; other models support `720p`. |
| `image2video` | Uses current Seedance names: `seedance1.0fast`, `seedance1.0`, `seedance1.5pro`, Seedance 2.0 family, and `seedance2.0mini`; ratio is inferred from the input image. |
| `frames2video` | Supports `seedance1.5pro`, Seedance 2.0 family, and `seedance2.0mini`; default model is `seedance2.0_vip`; ratio is inferred from the first frame. |
| `multiframe2video` | Accepts 2-20 images; 2 images use `prompt`/`duration`; 3+ images use repeated transition prompts and durations; no model or resolution override. |
| `multimodal2video` | All-around reference mode, formerly `ref2video`; accepts image/video references with optional audio references; audio-only input is not accepted; supports Seedance 2.0 family plus `seedance2.0mini`; `seedance2.0_vip` supports `4k`. |

## Non-Generation Surface

- Login uses OAuth Device Flow: `dreamina login --headless` or `dreamina relogin --headless`,
  followed by `dreamina login checklogin --device_code=<device_code> --poll=0`.
- `query_result` supports `--download_dir`.
- `list_task` supports `--gen_status`, `--gen_task_type`, `--limit`, `--offset`, and `--submit_id`.
- `session` supports `create`, `list`, `search`, `rename`, and `delete`; generator commands accept
  `--session`.

## Maintenance Rules

- Update `packages/dreamina-adapter/scripts/dreamina_wrapper.py`, `packages/dreamina-adapter/src/catalog.ts`,
  `packages/dreamina-adapter/src/validate.ts`, tests, and sample workflows together.
- Run `npm run audit:cli-help` after Dreamina CLI changes to catch upstream help drift.
- Avoid reintroducing legacy video model names such as `3.0fast`, `3.0pro`, or `3.5pro` into new
  examples; use Seedance 1.x names instead.
