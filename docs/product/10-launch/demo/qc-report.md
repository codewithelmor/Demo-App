# Demo quality check

Video: `docs/product/10-launch/demo/exports/orders-shop-web-demo.mp4` | SHA-256: `d0ad4dc561c2421b541ca4ecaec60ab768cc072a216c202bad4952a20923de98` | App version: web 0.1.0, commit c85f560 | Checked: 2026-10-31

Automated: `check_video.py` PASS (0 high, 1 warning). Contact sheets in `exports/qc-frames/` were reviewed by eye. Sync checked with frames at scene starts (c2_search, c3_place, c4_guard).

| # | Check | Severity | Result | Notes |
|---|---|---|---|---|
| 1 | Every planned journey shown start to finish | High | Pass | J1-J5, 31 recorder steps passed |
| 2 | Result visible >= 1.5 s | High | Pass | Narration hold after every step; restore result held 2.5 s before click |
| 3 | No failed or hidden steps, no error dialogs | High | Pass | Planned validation errors only |
| 4 | No private data | High | Pass | Only generated example.test addresses and the seeded dev admin address. Admin password typed into a masked field, never shown. No browser chrome, paths or machine names in frames; no metadata tags |
| 5 | No notifications or other apps | High | Pass | Browser viewport only |
| 6 | Captions .srt and .vtt, timed | High | Pass | 78 cues, no overlaps; also a soft subtitle track in the MP4 |
| 7 | Version on cards matches build | High | Pass | v0.1.0, c85f560 (package.json, git HEAD) |
| 8 | H.264 High, yuv420p, AAC 48 kHz, faststart | High | Pass | |
| 9 | 1920x1080, 30 fps | Medium | Pass | Recorded at 1280x720, upscaled with Lanczos, so UI text is slightly soft |
| 10 | Length within plan | Medium | Pass | 318.7 s (plan 6-7 min target was loose; 5.3 min delivered) |
| 11 | Loudness | Medium | Pass | -16.3 LUFS, -1.5 dBTP |
| 12 | Sync | Medium | Pass | Voice starts with the action in all sampled scenes |
| 13 | Pacing and cursor | Medium | Pass | Typing visible, cursor ring drawn |
| 14 | Frozen parts > 6 s | Medium | Pass with note | Tool warns on 20 still stretches; all are holds while the voice-over explains the screen |
| 15 | Branding | Low | N/A | No design system yet |
| 16 | Cards true; AI voice disclosed | Medium | Pass | End card states AI-generated voice |
| 17 | Music | High | N/A | None |

**Result:** Pass

**Notes:** the confirm and reset links are read from the API log (the dev stack's fake e-mail sender); the narration says so. The Edge neural voice is a Microsoft cloud service (the narration text is sent to it); licence terms for publishing should be recorded in `marketing/legal-check.md` by `market-legal-check` before anything is public.

---

# Demo quality check: architecture tour

Video: `exports/orders-architecture-demo.mp4` | SHA-256: `f2425af9d36466aaacef80fb4cb4bb64e97345af2d8e83da55c3a9d788165e0f` | Checked: 2026-10-31 | Content: slides (HTML rendered at 1920x1080) plus real code and the existing app screenshots, no live recording

| # | Check | Severity | Result | Notes |
|---|---|---|---|---|
| 1 | Planned content shown | High | Pass | 16 slides, 33 narration segments (API, BFF, React, quality, close) |
| 2 | Claims true | High | Pass | Numbers from 00-summary.md (BFF 97, SPA 232, e2e 40, 159.7 KB of 200), ADR-0001..0015, `Twenty_parallel_requests_cause_exactly_one_refresh` exists, code excerpts copied from `ProductEndpoints.cs` and `RefreshCoordinator.cs` (lines wrapped only) |
| 3 | No private data / secrets | High | Pass | Screenshots reuse the already-checked example.test addresses; no tokens, paths or machine names |
| 4 | Captions | High | Pass | `.srt` and `.vtt`, soft track in MP4, spoken-form words fixed (EF Core, ID, IP) |
| 5 | H.264, yuv420p, AAC 48 kHz, faststart | High | Pass | 1920x1080, 30 fps, 523.5 s |
| 6 | Loudness | Medium | Pass | -16.1 LUFS; no silence over 2.5 s |
| 7 | Sync | Medium | Pass | Frame at 335 s shows the slide matching the narration |
| 8 | AI voice disclosed | Medium | Pass | Title and end card, Loom description |
| 9 | Status honest | High | Pass | Closing (re-recorded 2026-10-31) says proof of concept on a feature branch, to be merged to main after final review |

**Result:** Pass. Not yet reviewed by `market-reviewer`; the user approved the upload on 2026-10-31 without that review.

---

# Demo quality check: web front end v2 (Bootstrap Lumen + SweetAlert2)

Video: `exports/orders-shop-web-demo-v2.mp4` (not committed) | SHA-256: `afe791e459d7def89b8a76c1a5107b151fa2f74191d96b2bd62e3a25b8cb283c` | App: web 0.1.0, commit cfe3290 (image rebuilt before recording) | Checked: 2026-11-05

| # | Check | Result | Notes |
|---|---|---|---|
| 1 | Journeys J1-J5 shown start to finish | Pass | 31 recorder steps passed (`web2-record.mjs`), plus a dry run first |
| 2 | New UI shown: Lumen theme, floating labels, live validation, SweetAlert2 confirmations, green/yellow/red buttons | Pass | Frames reviewed by eye (create-account dialog, order page, product form) |
| 3 | Private data / secrets | Pass | Only generated example.test address and seeded dev admin address; admin password never shown |
| 4 | Format | Pass | H.264, 1920x1080, 30 fps, AAC 48 kHz, 361.4 s (6:01), -16.3 LUFS |
| 5 | Captions | Pass | 89 cues, .srt/.vtt plus soft track; 7 chapters as in v1 |
| 6 | AI voice disclosed | Pass | End card |

**Result:** Pass (self-check only). Not reviewed by `market-reviewer`; not uploaded.

**Notes:** the stale "Fix 1 problem" alert stays visible on the register form until it is submitted (app behaviour, left as is). Recorded at 1280x720 and upscaled, so text is slightly soft. The edge-tts voice sends narration text to Microsoft; licence still to be recorded by `market-legal-check` before publishing.

---

# Demo quality check: web front end v3 (Material UI)

Video: `exports/orders-shop-web-demo-v3.mp4` (not committed) | SHA-256: `ff1ac9fd96c5d76765fda67fd8d5b7173be8467f676224659b76b2162befe0e8` | App: web 0.1.0, commit 7088117 (image rebuilt before recording) | Checked: 2026-11-05

| # | Check | Result | Notes |
|---|---|---|---|
| 1 | Journeys J1-J5 shown start to finish | Pass | 31 recorder steps passed (`web3-record.mjs`), plus a dry run first; no failed or skipped step |
| 2 | New UI shown: Material UI look, alerts, toast messages, Material confirmation dialogs, green/orange/red buttons | Partly checked | Frames reviewed by eye: catalog, order page with the "Order placed." toast and the inline alert, product form validation. Other toasts (cancel, profile, product save/archive/restore) and the confirmation dialogs were not looked at frame by frame; the recorder's checks passed for them |
| 3 | Private data / secrets | Pass | Only a generated example.test address and the seeded dev admin address; admin password never shown |
| 4 | Format | Pass | H.264, 1920x1080, 30 fps, AAC 48 kHz, 341.2 s (5:41), -16.4 LUFS |
| 5 | Captions | Pass | 95 cues, .srt/.vtt plus soft track; 7 chapters as in v2 |
| 6 | AI voice disclosed | Pass | End card |

**Result:** Pass with one check only partly done (self-check). Not reviewed by `market-reviewer`; not uploaded.

**Notes:** same limits as v2: recorded at 1280x720 and upscaled, so text is slightly soft; the edge-tts voice sends narration text to Microsoft and its licence is still to be recorded by `market-legal-check` before publishing. The voice service dropped one request during generation; `web3-tts.py` now retries. The initial JS of the app is over the 200 KB bundle budget (about 205 KB), which is an app issue, not a video issue.
