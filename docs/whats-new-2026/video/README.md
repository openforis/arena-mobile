# What's new in 2026: animated video

A motion-graphics video of the Arena Mobile "What's new in 2026" deck, narrated with the
[Kokoro](https://huggingface.co/hexgrad/Kokoro-82M) neural voice (Apache 2.0), with background music and English subtitles.
It uses the same engine as the Arena video (`docs/whats-new-2026/video` in openforis/arena), with the Mobile colours and
phone frames.

- `arena-mobile-whats-new-2026.mp4`: the video (4K, 3840×2160, about 2.5 minutes).
- `scenes.json`: the script: for each scene, the narration (`say`, one entry per sentence) and the animated items
  (`phone` and `shot` screenshots, chips, cards, ...). An item with `"at": n` appears when sentence `n` starts (plus
  `delay` seconds). Acronyms are spelled with hyphens (e.g. "i-O-S") so that the voice pronounces them letter by letter.
- `index.html`, `style.css`, `engine.js`: the animation; `render(t)` draws the frame at time `t`.
- `tts.py`: narration (Kokoro), scene timeline and subtitles. `music.py`: background track. `render.mjs`: frame capture
  with Playwright. `build.py`: runs everything.
- Images come from `assets/whatsNew/` and `docs/whats-new-2026/`; `arena-mobile-icon.png` is the icon used in the deck.
  Fonts (Rubik, Nunito Sans, OFL) are in `fonts/`.

## Building

Requirements: Python 3, Node.js, ffmpeg, and:

```bash
cd docs/whats-new-2026/video
python3 -m venv .venv && .venv/bin/pip install kokoro-onnx soundfile
npm install --no-save playwright && npx playwright install chromium
```

```bash
.venv/bin/python build.py arena-mobile-whats-new-2026.mp4             # 4K
.venv/bin/python build.py out.mp4 --height 1080                         # faster
.venv/bin/python build.py out.mp4 --skip-audio                          # reuse narration and music in build/
```

The first run downloads the Kokoro model (310 MB) from Hugging Face into `build/kokoro`. Change the voice in
`scenes.json` (`voice`, e.g. `af_heart`, `af_bella`, `am_michael`, `bf_emma`, `bm_george`).

To check a layout without rendering the whole video, render a few stills (after a first build, which writes
`build/timing.json`): `node render.mjs build stills 12,40.5 build/stills`.
