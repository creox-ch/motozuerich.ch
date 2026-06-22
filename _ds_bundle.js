/* @ds-bundle: {"format":3,"namespace":"MOTOZRICHDesignSystem_019dd3","components":[],"sourceHashes":{"image-slot.js":"9309434cb09c","mz-chrome.js":"292b15341192","mz-head.js":"e381a54449ea","mz-page.js":"e39290b99609","ui_kits/website/Footer.jsx":"214dddb17e0b","ui_kits/website/Header.jsx":"042d5dc51c1a","ui_kits/website/HeroIdentity.jsx":"1f49767129db","ui_kits/website/PillarSection.jsx":"322eba08cd0b","ui_kits/website/PressSection.jsx":"fae736b30e15","ui_kits/website/RueckblickSection.jsx":"55b65b115992","ui_kits/website/helpers.jsx":"6b44e5fab4fc"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MOTOZRICHDesignSystem_019dd3 = window.MOTOZRICHDesignSystem_019dd3 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// image-slot.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
/* BEGIN USAGE */
/**
 * <image-slot> — user-fillable image placeholder.
 *
 * Drop this into a deck, mockup, or page wherever you want the user to
 * supply an image. You control the slot's shape and size; the user fills it
 * by dragging an image file onto it (or clicking to browse). The dropped
 * image persists across reloads via a .image-slots.state.json sidecar —
 * same read-via-fetch / write-via-window.omelette pattern as
 * design_canvas.jsx, so the filled slot shows on share links, downloaded
 * zips, and PPTX export. Outside the omelette runtime the slot is read-only.
 *
 * The host bridge only allows sidecar writes at the project root, so the
 * HTML that uses this component is assumed to live at the project root too
 * (same constraint as design_canvas.jsx).
 *
 * Attributes:
 *   id           Persistence key. REQUIRED for the drop to survive reload —
 *                every slot on the page needs a distinct id.
 *   shape        'rect' | 'rounded' | 'circle' | 'pill'   (default 'rounded')
 *                'circle' applies 50% border-radius; on a non-square slot
 *                that's an ellipse — set equal width and height for a true
 *                circle.
 *   radius       Corner radius in px for 'rounded'.       (default 12)
 *   mask         Any CSS clip-path value. Overrides `shape` — use this for
 *                hexagons, blobs, arbitrary polygons.
 *   fit          object-fit: cover | contain | fill.       (default 'cover')
 *                With cover (the default) double-clicking the filled slot
 *                enters a reframe mode: the whole image spills past the mask
 *                (translucent outside, opaque inside), drag to reposition,
 *                corner-drag to scale. The crop persists alongside the image
 *                in the sidecar. contain/fill stay static.
 *   position     object-position for fit=contain|fill.     (default '50% 50%')
 *   placeholder  Empty-state caption.                      (default 'Drop an image')
 *   src          Optional initial/fallback image URL. A user drop overrides
 *                it; clearing the drop reveals src again.
 *
 * Size and layout come from ordinary CSS on the element — width/height
 * inline or from a parent grid — so it composes with any layout.
 *
 * Usage:
 *   <image-slot id="hero"   style="width:800px;height:450px" shape="rounded" radius="20"
 *               placeholder="Drop a hero image"></image-slot>
 *   <image-slot id="avatar" style="width:120px;height:120px" shape="circle"></image-slot>
 *   <image-slot id="kite"   style="width:300px;height:300px"
 *               mask="polygon(50% 0, 100% 50%, 50% 100%, 0 50%)"></image-slot>
 */
/* END USAGE */

(() => {
  const STATE_FILE = '.image-slots.state.json';
  // 2× a ~600px slot in a 1920-wide deck — retina-sharp without making the
  // sidecar enormous. A 1200px WebP at q=0.85 is ~150-300KB.
  const MAX_DIM = 1200;
  // Raster formats only. SVG is excluded (can carry script; createImageBitmap
  // on SVG blobs is inconsistent). GIF is excluded because the canvas
  // re-encode keeps only the first frame, so an animated GIF would silently
  // go still — better to reject than surprise.
  const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

  // ── Shared sidecar store ────────────────────────────────────────────────
  // One fetch + immediate write-on-change for every <image-slot> on the
  // page. Reads via fetch() so viewing works anywhere the HTML and sidecar
  // are served together; writes go through window.omelette.writeFile, which
  // the host allowlists to *.state.json basenames only.
  const subs = new Set();
  let slots = {};
  // ids explicitly cleared before the sidecar fetch resolved — otherwise
  // the merge below can't tell "never set" from "just deleted" and would
  // resurrect the sidecar's stale value.
  const tombstones = new Set();
  let loaded = false;
  let loadP = null;
  function load() {
    if (loadP) return loadP;
    loadP = fetch(STATE_FILE).then(r => r.ok ? r.json() : null).then(j => {
      // Merge: sidecar loses to any in-memory change that raced ahead of
      // the fetch (drop or clear) so neither is clobbered by hydration.
      if (j && typeof j === 'object') {
        const merged = Object.assign({}, j, slots);
        // A framing-only write that raced ahead of hydration must not
        // drop a user image that's only on disk — inherit u from the
        // sidecar for any in-memory entry that lacks one.
        for (const k in slots) {
          if (merged[k] && !merged[k].u && j[k]) {
            merged[k].u = typeof j[k] === 'string' ? j[k] : j[k].u;
          }
        }
        for (const id of tombstones) delete merged[id];
        slots = merged;
      }
      tombstones.clear();
    }).catch(() => {}).then(() => {
      loaded = true;
      subs.forEach(fn => fn());
    });
    return loadP;
  }

  // Serialize writes so two near-simultaneous drops on different slots
  // can't reorder at the backend and leave the sidecar with only the
  // first. A save requested mid-flight just marks dirty and re-fires on
  // completion with the then-current slots.
  let saving = false;
  let saveDirty = false;
  function save() {
    if (saving) {
      saveDirty = true;
      return;
    }
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    saving = true;
    Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {}).then(() => {
      saving = false;
      if (saveDirty) {
        saveDirty = false;
        save();
      }
    });
  }
  const S_MAX = 5;
  const clampS = s => Math.max(1, Math.min(S_MAX, s));

  // Normalize a stored slot value. Pre-reframe sidecars stored a bare
  // data-URL string; newer ones store {u, s, x, y}. Either shape is valid.
  function getSlot(id) {
    const v = slots[id];
    if (!v) return null;
    return typeof v === 'string' ? {
      u: v,
      s: 1,
      x: 0,
      y: 0
    } : v;
  }
  function setSlot(id, val) {
    if (!id) return;
    if (val) {
      slots[id] = val;
      tombstones.delete(id);
    } else {
      delete slots[id];
      if (!loaded) tombstones.add(id);
    }
    subs.forEach(fn => fn());
    // A drop is rare + high-value — write immediately so nav-away can't lose
    // it. Gate on the initial read so we don't overwrite a sidecar we haven't
    // merged yet; the merge in load() keeps this change once the read lands.
    if (loaded) save();else load().then(save);
  }

  // ── Image downscale ─────────────────────────────────────────────────────
  // Encode through a canvas so the sidecar carries resized bytes, not the
  // raw upload. Longest side is capped at 2× the slot's rendered width
  // (retina) and at MAX_DIM. WebP keeps alpha and is ~10× smaller than PNG
  // for photos, so there's no need for per-image format picking.
  async function toDataUrl(file, targetW) {
    const bitmap = await createImageBitmap(file);
    try {
      const cap = Math.min(MAX_DIM, Math.max(1, Math.round(targetW * 2)) || MAX_DIM);
      const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      return canvas.toDataURL('image/webp', 0.85);
    } finally {
      bitmap.close && bitmap.close();
    }
  }

  // ── Custom element ──────────────────────────────────────────────────────
  const stylesheet = ':host{display:inline-block;position:relative;vertical-align:top;' + '  font:13px/1.3 system-ui,-apple-system,sans-serif;color:rgba(0,0,0,.55);width:240px;height:160px}' + '.frame{position:absolute;inset:0;overflow:hidden;background:rgba(0,0,0,.04)}' +
  // .frame img (clipped) and .spill (unclipped ghost + handles) share the
  // same left/top/width/height in frame-%, computed by _applyView(), so the
  // inside-mask crop and the outside-mask spill stay pixel-aligned.
  '.frame img{position:absolute;max-width:none;transform:translate(-50%,-50%);' + '  -webkit-user-drag:none;user-select:none;touch-action:none}' +
  // Reframe mode (double-click): the full image spills past the mask. The
  // spill layer is sized to the IMAGE bounds so its corners are where the
  // resize handles belong. The ghost <img> inside is translucent; the real
  // clipped <img> underneath shows the opaque in-mask crop.
  '.spill{position:absolute;transform:translate(-50%,-50%);display:none;z-index:1;' + '  cursor:grab;touch-action:none}' + ':host([data-panning]) .spill{cursor:grabbing}' + '.spill .ghost{position:absolute;inset:0;width:100%;height:100%;opacity:.35;' + '  pointer-events:none;-webkit-user-drag:none;user-select:none;' + '  box-shadow:0 0 0 1px rgba(0,0,0,.2),0 12px 32px rgba(0,0,0,.2)}' + '.spill .handle{position:absolute;width:12px;height:12px;border-radius:50%;' + '  background:#fff;box-shadow:0 0 0 1.5px #c96442,0 1px 3px rgba(0,0,0,.3);' + '  transform:translate(-50%,-50%)}' + '.spill .handle[data-c=nw]{left:0;top:0;cursor:nwse-resize}' + '.spill .handle[data-c=ne]{left:100%;top:0;cursor:nesw-resize}' + '.spill .handle[data-c=sw]{left:0;top:100%;cursor:nesw-resize}' + '.spill .handle[data-c=se]{left:100%;top:100%;cursor:nwse-resize}' + ':host([data-reframe]){z-index:10}' + ':host([data-reframe]) .spill{display:block}' + ':host([data-reframe]) .frame{box-shadow:0 0 0 2px #c96442}' + '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  cursor:pointer;user-select:none}' + '.empty svg{opacity:.45}' + '.empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em}' + '.empty .sub{font-size:11px}' + '.empty .sub u{text-underline-offset:2px;text-decoration-color:rgba(0,0,0,.25)}' + '.empty:hover .sub u{color:rgba(0,0,0,.75);text-decoration-color:currentColor}' + ':host([data-over]) .frame{outline:2px solid #c96442;outline-offset:-2px;' + '  background:rgba(201,100,66,.10)}' + '.ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed rgba(0,0,0,.25);' + '  transition:border-color .12s}' + ':host([data-over]) .ring{border-color:#c96442}' + ':host([data-filled]) .ring{display:none}' +
  // Controls sit BELOW the mask (top:100%), absolutely positioned so the
  // author-declared slot height is unaffected. The gap is padding, not a
  // top offset, so the hover target stays contiguous with the frame.
  '.ctl{position:absolute;top:100%;left:50%;transform:translateX(-50%);padding-top:8px;' + '  display:flex;gap:6px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:2;' + '  white-space:nowrap}' + ':host([data-filled][data-editable]:hover) .ctl,:host([data-reframe]) .ctl' + '  {opacity:1;pointer-events:auto}' + '.ctl button{appearance:none;border:0;border-radius:6px;padding:5px 10px;cursor:pointer;' + '  background:rgba(0,0,0,.65);color:#fff;font:11px/1 system-ui,-apple-system,sans-serif;' + '  backdrop-filter:blur(6px)}' + '.ctl button:hover{background:rgba(0,0,0,.8)}' + '.err{position:absolute;left:8px;bottom:8px;right:8px;color:#b3261e;font-size:11px;' + '  background:rgba(255,255,255,.85);padding:4px 6px;border-radius:5px;pointer-events:none}';
  const icon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' + '<path d="m21 15-5-5L5 21"/></svg>';
  class ImageSlot extends HTMLElement {
    static get observedAttributes() {
      return ['shape', 'radius', 'mask', 'fit', 'position', 'placeholder', 'src', 'id'];
    }
    constructor() {
      super();
      const root = this.attachShadow({
        mode: 'open'
      });
      // .spill and .ctl sit OUTSIDE .frame so overflow:hidden + border-radius
      // on the frame (circle, pill, rounded) can't clip them.
      root.innerHTML = '<style>' + stylesheet + '</style>' + '<div class="frame" part="frame">' + '  <img part="image" alt="" draggable="false" style="display:none">' + '  <div class="empty" part="empty">' + icon + '    <div class="cap"></div>' + '    <div class="sub">or <u>browse files</u></div></div>' + '  <div class="ring" part="ring"></div>' + '</div>' + '<div class="spill">' + '  <img class="ghost" alt="" draggable="false">' + '  <div class="handle" data-c="nw"></div><div class="handle" data-c="ne"></div>' + '  <div class="handle" data-c="sw"></div><div class="handle" data-c="se"></div>' + '</div>' + '<div class="ctl"><button data-act="replace" title="Replace image">Replace</button>' + '  <button data-act="clear" title="Remove image">Remove</button></div>' + '<input type="file" accept="' + ACCEPT.join(',') + '" hidden>';
      this._frame = root.querySelector('.frame');
      this._ring = root.querySelector('.ring');
      this._img = root.querySelector('.frame img');
      this._empty = root.querySelector('.empty');
      this._cap = root.querySelector('.cap');
      this._sub = root.querySelector('.sub');
      this._spill = root.querySelector('.spill');
      this._ghost = root.querySelector('.ghost');
      this._err = null;
      this._input = root.querySelector('input');
      this._depth = 0;
      this._gen = 0;
      this._view = {
        s: 1,
        x: 0,
        y: 0
      };
      this._subFn = () => this._render();
      // Shadow-DOM listeners live with the shadow DOM — bound once here so
      // disconnect/reconnect (e.g. React remount) doesn't stack handlers.
      this._empty.addEventListener('click', () => this._input.click());
      root.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (act === 'replace') {
          this._exitReframe(true);
          this._input.click();
        }
        if (act === 'clear') {
          this._exitReframe(false);
          this._gen++;
          this._local = null;
          if (this.id) setSlot(this.id, null);else this._render();
        }
      });
      this._input.addEventListener('change', () => {
        const f = this._input.files && this._input.files[0];
        if (f) this._ingest(f);
        this._input.value = '';
      });
      // naturalWidth/Height aren't known until load — re-apply so the cover
      // baseline is computed from real dimensions, not the 100%×100% fallback.
      this._img.addEventListener('load', () => this._applyView());
      // Gated on editable + fit=cover so share links and contain/fill slots
      // stay static.
      this.addEventListener('dblclick', e => {
        if (!this.hasAttribute('data-editable') || !this._reframes()) return;
        e.preventDefault();
        if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
      });
      // Pan + resize both originate on the spill layer. A handle pointerdown
      // drives an aspect-locked resize anchored at the opposite corner; any
      // other pointerdown on the spill pans. Offsets are frame-% so a
      // reframed slot survives responsive resize / PPTX export.
      this._spill.addEventListener('pointerdown', e => {
        if (e.button !== 0 || !this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        e.stopPropagation();
        this._spill.setPointerCapture(e.pointerId);
        const rect = this.getBoundingClientRect();
        const fw = rect.width || 1,
          fh = rect.height || 1;
        const corner = e.target.getAttribute && e.target.getAttribute('data-c');
        let move;
        if (corner) {
          // Resize about the OPPOSITE corner. Viewport-px throughout (rect
          // fw/fh, not clientWidth) so the math survives a transform:scale()
          // ancestor — deck_stage renders slides scaled-to-fit.
          const iw = this._img.naturalWidth || 1,
            ih = this._img.naturalHeight || 1;
          const base = Math.max(fw / iw, fh / ih);
          const sx = corner.includes('e') ? 1 : -1;
          const sy = corner.includes('s') ? 1 : -1;
          const s0 = this._view.s;
          const w0 = iw * base * s0,
            h0 = ih * base * s0;
          const cx0 = (50 + this._view.x) / 100 * fw;
          const cy0 = (50 + this._view.y) / 100 * fh;
          const ox = cx0 - sx * w0 / 2,
            oy = cy0 - sy * h0 / 2;
          const diag0 = Math.hypot(w0, h0);
          const ux = sx * w0 / diag0,
            uy = sy * h0 / diag0;
          move = ev => {
            const proj = (ev.clientX - rect.left - ox) * ux + (ev.clientY - rect.top - oy) * uy;
            const s = clampS(s0 * proj / diag0);
            const d = diag0 * s / s0;
            this._view.s = s;
            this._view.x = (ox + ux * d / 2) / fw * 100 - 50;
            this._view.y = (oy + uy * d / 2) / fh * 100 - 50;
            this._clampView();
            this._applyView();
          };
        } else {
          this.setAttribute('data-panning', '');
          const start = {
            px: e.clientX,
            py: e.clientY,
            x: this._view.x,
            y: this._view.y
          };
          move = ev => {
            this._view.x = start.x + (ev.clientX - start.px) / fw * 100;
            this._view.y = start.y + (ev.clientY - start.py) / fh * 100;
            this._clampView();
            this._applyView();
          };
        }
        const up = () => {
          try {
            this._spill.releasePointerCapture(e.pointerId);
          } catch {}
          this._spill.removeEventListener('pointermove', move);
          this._spill.removeEventListener('pointerup', up);
          this._spill.removeEventListener('pointercancel', up);
          this.removeAttribute('data-panning');
          this._dragUp = null;
        };
        // Stashed so _exitReframe (Escape / outside-click mid-drag) can
        // tear the capture + listeners down synchronously.
        this._dragUp = up;
        this._spill.addEventListener('pointermove', move);
        this._spill.addEventListener('pointerup', up);
        this._spill.addEventListener('pointercancel', up);
      });
      // Wheel zoom stays available inside reframe mode as a trackpad nicety —
      // zooms toward the cursor (offset' = cursor·(1-k) + offset·k).
      this.addEventListener('wheel', e => {
        if (!this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        const r = this.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width * 100 - 50;
        const cy = (e.clientY - r.top) / r.height * 100 - 50;
        const prev = this._view.s;
        const next = clampS(prev * Math.pow(1.0015, -e.deltaY));
        if (next === prev) return;
        const k = next / prev;
        this._view.s = next;
        this._view.x = cx * (1 - k) + this._view.x * k;
        this._view.y = cy * (1 - k) + this._view.y * k;
        this._clampView();
        this._applyView();
      }, {
        passive: false
      });
    }
    connectedCallback() {
      // Warn once per page — an id-less slot works for the session but
      // cannot persist, and two id-less slots would share nothing.
      if (!this.id && !ImageSlot._warned) {
        ImageSlot._warned = true;
        console.warn('<image-slot> without an id will not persist its dropped image.');
      }
      this.addEventListener('dragenter', this);
      this.addEventListener('dragover', this);
      this.addEventListener('dragleave', this);
      this.addEventListener('drop', this);
      subs.add(this._subFn);
      // width%/height% in _applyView encode the frame aspect at call time —
      // a host resize (responsive grid, pane divider) would stretch the
      // image until the next _render. Re-render on size change: _render()
      // re-seeds _view from stored before clamp/apply, so a shrink→grow
      // cycle round-trips instead of ratcheting x/y toward the narrower
      // frame's clamp range.
      this._ro = new ResizeObserver(() => this._render());
      this._ro.observe(this);
      load();
      this._render();
    }
    disconnectedCallback() {
      subs.delete(this._subFn);
      this.removeEventListener('dragenter', this);
      this.removeEventListener('dragover', this);
      this.removeEventListener('dragleave', this);
      this.removeEventListener('drop', this);
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
      this._exitReframe(false);
    }
    _enterReframe() {
      if (this.hasAttribute('data-reframe')) return;
      this.setAttribute('data-reframe', '');
      this._applyView();
      // Close on click outside (the spill handler stopPropagation()s so
      // in-image drags don't reach this) and on Escape. Listeners are held
      // on the instance so _exitReframe / disconnectedCallback can detach
      // exactly what was attached.
      this._outside = e => {
        if (e.composedPath && e.composedPath().includes(this)) return;
        this._exitReframe(true);
      };
      this._esc = e => {
        if (e.key === 'Escape') this._exitReframe(true);
      };
      document.addEventListener('pointerdown', this._outside, true);
      document.addEventListener('keydown', this._esc, true);
    }
    _exitReframe(commit) {
      if (!this.hasAttribute('data-reframe')) return;
      if (this._dragUp) this._dragUp();
      this.removeAttribute('data-reframe');
      this.removeAttribute('data-panning');
      if (this._outside) document.removeEventListener('pointerdown', this._outside, true);
      if (this._esc) document.removeEventListener('keydown', this._esc, true);
      this._outside = this._esc = null;
      if (commit) this._commitView();
    }
    attributeChangedCallback() {
      if (this.shadowRoot) this._render();
    }

    // handleEvent — one listener object for all four drag events keeps the
    // add/remove symmetric and the depth counter correct.
    handleEvent(e) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        // Without preventDefault the browser never fires 'drop'.
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        if (e.type === 'dragenter') this._depth++;
        this.setAttribute('data-over', '');
      } else if (e.type === 'dragleave') {
        // dragenter/leave fire for every descendant crossing — count depth
        // so hovering the icon inside the empty state doesn't flicker.
        if (--this._depth <= 0) {
          this._depth = 0;
          this.removeAttribute('data-over');
        }
      } else if (e.type === 'drop') {
        e.preventDefault();
        e.stopPropagation();
        this._depth = 0;
        this.removeAttribute('data-over');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) this._ingest(f);
      }
    }
    async _ingest(file) {
      this._setError(null);
      if (!file || ACCEPT.indexOf(file.type) < 0) {
        this._setError('Drop a PNG, JPEG, WebP, or AVIF image.');
        return;
      }
      // toDataUrl can take hundreds of ms on a large photo. A Clear or a
      // newer drop during that window would be clobbered when this await
      // resumes — bump + capture a generation so stale encodes bail.
      const gen = ++this._gen;
      try {
        const w = this.clientWidth || this.offsetWidth || MAX_DIM;
        const url = await toDataUrl(file, w);
        if (gen !== this._gen) return;
        // Only exit reframe once the new image is in hand — a rejected type
        // or decode failure leaves the in-progress crop untouched.
        this._exitReframe(false);
        const val = {
          u: url,
          s: 1,
          x: 0,
          y: 0
        };
        setSlot(this.id || '', val);
        // Keep a session-local copy for id-less slots so the drop still
        // shows, even though it cannot persist.
        if (!this.id) {
          this._local = val;
          this._render();
        }
      } catch (err) {
        if (gen !== this._gen) return;
        this._setError('Could not read that image.');
        console.warn('<image-slot> ingest failed:', err);
      }
    }
    _setError(msg) {
      if (this._err) {
        this._err.remove();
        this._err = null;
      }
      if (!msg) return;
      const d = document.createElement('div');
      d.className = 'err';
      d.textContent = msg;
      this.shadowRoot.appendChild(d);
      this._err = d;
      setTimeout(() => {
        if (this._err === d) {
          d.remove();
          this._err = null;
        }
      }, 3000);
    }

    // Reframing (pan/resize) is only meaningful for fit=cover — contain/fill
    // keep the old object-fit path and double-click is a no-op.
    _reframes() {
      return this.hasAttribute('data-filled') && (this.getAttribute('fit') || 'cover') === 'cover';
    }

    // Cover-baseline geometry, shared by clamp/apply/resize. Null until the
    // img has loaded (naturalWidth is 0 before that) or when the slot has no
    // layout box — ResizeObserver fires with a 0×0 rect under display:none,
    // and clamping against a degenerate 1×1 frame would silently pull the
    // stored pan toward zero.
    _geom() {
      const iw = this._img.naturalWidth,
        ih = this._img.naturalHeight;
      const fw = this.clientWidth,
        fh = this.clientHeight;
      if (!iw || !ih || !fw || !fh) return null;
      return {
        iw,
        ih,
        fw,
        fh,
        base: Math.max(fw / iw, fh / ih)
      };
    }
    _clampView() {
      // Pan range on each axis is half the overflow past the frame edge.
      const g = this._geom();
      if (!g) return;
      const mx = Math.max(0, (g.iw * g.base * this._view.s / g.fw - 1) * 50);
      const my = Math.max(0, (g.ih * g.base * this._view.s / g.fh - 1) * 50);
      this._view.x = Math.max(-mx, Math.min(mx, this._view.x));
      this._view.y = Math.max(-my, Math.min(my, this._view.y));
    }
    _applyView() {
      const g = this._geom();
      const fit = this.getAttribute('fit') || 'cover';
      if (fit !== 'cover' || !g) {
        // Non-cover, or dimensions not known yet (before img load).
        this._img.style.width = '100%';
        this._img.style.height = '100%';
        this._img.style.left = '50%';
        this._img.style.top = '50%';
        this._img.style.objectFit = fit;
        this._img.style.objectPosition = this.getAttribute('position') || '50% 50%';
        return;
      }
      // Cover baseline: img fills the frame on its tighter axis at s=1, so
      // pan works immediately on the overflowing axis without zooming first.
      // Width/height and left/top are all frame-% — depends only on the
      // frame aspect ratio, so a responsive resize keeps the same crop. The
      // spill layer mirrors the same box so its corners = image corners.
      const k = g.base * this._view.s;
      const w = g.iw * k / g.fw * 100 + '%';
      const h = g.ih * k / g.fh * 100 + '%';
      const l = 50 + this._view.x + '%';
      const t = 50 + this._view.y + '%';
      this._img.style.width = w;
      this._img.style.height = h;
      this._img.style.left = l;
      this._img.style.top = t;
      this._img.style.objectFit = '';
      this._spill.style.width = w;
      this._spill.style.height = h;
      this._spill.style.left = l;
      this._spill.style.top = t;
    }
    _commitView() {
      const v = {
        s: this._view.s,
        x: this._view.x,
        y: this._view.y
      };
      if (this._userUrl) v.u = this._userUrl;
      // Framing-only (no u) persists too so an author-src slot remembers its
      // crop; clearing the sidecar still falls through to src=.
      if (this.id) setSlot(this.id, v);else {
        this._local = v;
      }
    }
    _render() {
      // Shape / mask. Presets use border-radius so the dashed ring can
      // follow the rounded outline; clip-path is only applied for an
      // explicit `mask` (the ring is hidden there since a rectangle
      // dashed border chopped by an arbitrary polygon looks broken).
      const mask = this.getAttribute('mask');
      const shape = (this.getAttribute('shape') || 'rounded').toLowerCase();
      let radius = '';
      if (shape === 'circle') radius = '50%';else if (shape === 'pill') radius = '9999px';else if (shape === 'rounded') {
        const n = parseFloat(this.getAttribute('radius'));
        radius = (Number.isFinite(n) ? n : 12) + 'px';
      }
      this._frame.style.borderRadius = mask ? '' : radius;
      this._frame.style.clipPath = mask || '';
      this._ring.style.borderRadius = mask ? '' : radius;
      this._ring.style.display = mask ? 'none' : '';

      // Controls and reframe entry gate on this so share links stay read-only.
      const editable = !!(window.omelette && window.omelette.writeFile);
      this.toggleAttribute('data-editable', editable);
      this._sub.style.display = editable ? '' : 'none';

      // Content. The sidecar is also writable by the agent's write_file
      // tool, so its value isn't guaranteed canvas-originated — only accept
      // data:image/ URLs from it. The `src` attribute is author-controlled
      // (Claude wrote it into the HTML) so it passes through unchanged.
      let stored = this.id ? getSlot(this.id) : this._local;
      if (stored && stored.u && !/^data:image\//i.test(stored.u)) stored = null;
      const srcAttr = this.getAttribute('src') || '';
      this._userUrl = stored && stored.u || null;
      const url = this._userUrl || srcAttr;
      // Don't clobber an in-flight reframe with a store-triggered re-render.
      if (!this.hasAttribute('data-reframe')) {
        this._view = {
          s: stored && Number.isFinite(stored.s) ? clampS(stored.s) : 1,
          x: stored && Number.isFinite(stored.x) ? stored.x : 0,
          y: stored && Number.isFinite(stored.y) ? stored.y : 0
        };
      }
      this._cap.textContent = this.getAttribute('placeholder') || 'Drop an image';
      // Toggle via style.display — the [hidden] attribute alone loses to
      // the display:flex / display:block rules in the stylesheet above.
      if (url) {
        if (this._img.getAttribute('src') !== url) {
          this._img.src = url;
          this._ghost.src = url;
        }
        this._img.style.display = 'block';
        this._empty.style.display = 'none';
        this.setAttribute('data-filled', '');
        this._clampView();
        this._applyView();
      } else {
        this._img.style.display = 'none';
        this._img.removeAttribute('src');
        this._ghost.removeAttribute('src');
        this._empty.style.display = 'flex';
        this.removeAttribute('data-filled');
      }
    }
  }
  if (!customElements.get('image-slot')) {
    customElements.define('image-slot', ImageSlot);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "image-slot.js", error: String((e && e.message) || e) }); }

// mz-chrome.js
try { (() => {
/* ============================================================
   MOTO-ZÜRICH — shared chrome (date bar, header/nav, partners,
   footer). Injected into every sub-page so navigation lives in
   ONE place. Set <body data-page="faq"> to mark the active nav.
   Load BEFORE mz-page.js.
   ============================================================ */
(function () {
  var HOME = 'MOTO-ZÜRICH 2027.html';
  var page = document.body.getAttribute('data-page') || '';

  /* dropdown nav — groups mirror the original site, every page reachable */
  var EVENT_GUIDE = 'https://drive.google.com/uc?export=download&id=1LnjHCKHGYVMsXE9L1QmDCLv_fH-T6_kk';
  var nav = [{
    id: 'home',
    label: 'Home',
    href: HOME
  }, {
    label: 'Besucher',
    children: [{
      id: 'faq',
      label: 'Gut zu Wissen',
      href: 'FAQ.html'
    }, {
      label: 'Anreise & Parking',
      href: 'FAQ.html#parking'
    }, {
      label: 'Hallenplan',
      href: 'Programm.html#hallenplan'
    }, {
      id: 'party',
      label: 'Saisonstart Party',
      href: 'Party.html'
    }]
  }, {
    id: 'programm',
    label: 'Programm',
    href: 'Programm.html',
    children: [{
      label: 'Programm 2027',
      href: 'Programm.html'
    }, {
      label: 'Live Arena',
      href: 'Programm.html#live-arena'
    }, {
      label: 'Action Zone',
      href: 'Programm.html#action-zone'
    }, {
      label: 'Act vorschlagen',
      href: 'https://pyrus.com/form/2399268',
      ext: true
    }]
  }, {
    id: 'aussteller',
    label: 'Aussteller',
    href: 'Aussteller.html',
    children: [{
      label: 'Aussteller werden',
      href: 'Aussteller.html'
    }, {
      label: 'Anfrage senden',
      href: 'mailto:yves@motozuerich.ch?subject=Aussteller-Anfrage%20MOTO-Z%C3%9CRICH%202027'
    }]
  }, {
    label: 'Über uns',
    children: [{
      id: 'rueckblick',
      label: 'MOTO-ZÜRICH 2026',
      href: 'Rueckblick-2026.html'
    }, {
      id: 'team',
      label: 'Team',
      href: 'Team.html'
    }, {
      id: 'warum',
      label: 'Warum die MOTO-ZÜRICH',
      href: 'Warum.html'
    }, {
      id: 'volunteers',
      label: 'Volunteers',
      href: 'Volunteers.html'
    }, {
      id: 'creators',
      label: 'Creators',
      href: 'Creators.html'
    }, {
      id: 'sound',
      label: 'Sounds der MOTO-ZÜRICH',
      href: 'Sound.html'
    }, {
      label: 'Kontaktiere uns',
      href: 'https://pyrus.com/form/2399268',
      ext: true
    }]
  }, {
    id: 'medien',
    label: 'Medien',
    href: 'Medien.html'
  }];
  var AUSSTELLER_MAIL = 'mailto:yves@motozuerich.ch?subject=Aussteller-Anfrage%20MOTO-Z%C3%9CRICH%202027';
  var TICKETS = 'https://motozuerich.shop.bookinea.app/de';
  var CONTACT_FORM = 'https://pyrus.com/form/2399268';
  function childLink(c) {
    var act = c.id && c.id === page ? ' class="is-active"' : '';
    var tgt = c.ext ? ' target="_blank" rel="noopener"' : '';
    return '<li><a href="' + c.href + '"' + act + tgt + '>' + c.label + '</a></li>';
  }
  var navItems = nav.map(function (n) {
    if (n.children) {
      var groupActive = n.id === page || n.children.some(function (c) {
        return c.id === page;
      });
      var topCls = 'nav-top' + (groupActive ? ' nav-active' : '');
      var top = n.href ? '<a href="' + n.href + '" class="' + topCls + '">' + n.label + '<span class="nav-caret"></span></a>' : '<button type="button" class="' + topCls + '">' + n.label + '<span class="nav-caret"></span></button>';
      return '<li class="has-sub">' + top + '<ul class="submenu">' + n.children.map(childLink).join('') + '</ul></li>';
    }
    var active = n.id === page ? ' class="nav-active" aria-current="page"' : '';
    return '<li><a href="' + n.href + '"' + active + '>' + n.label + '</a></li>';
  }).join('');

  // build date bar track (3 repeats)
  var seg = '<span>MOTO-ZÜRICH 2027</span><span>19.–21. Februar 2027</span><span>Wird grösser</span><span>Save the Date</span>';
  var dateBar = '<div class="date-bar"><div class="date-bar-track">' + seg + seg + seg + '</div></div>';
  var header = '<header class="header"><div class="header-inner">' + '<a href="' + HOME + '" class="logo-link" aria-label="MOTO-ZÜRICH Home">' + '<img class="logo-svg" src="assets/logo-moto-zuerich.svg" alt="MOTO-ZÜRICH" />' + '</a>' + '<button class="nav-mobile-toggle" aria-label="Menü" onclick="document.getElementById(\'mainNav\').classList.toggle(\'open\')">☰</button>' + '<nav id="mainNav"><ul>' + navItems + '<li><a href="' + AUSSTELLER_MAIL + '" class="nav-cta">Aussteller werden →</a></li>' + '</ul></nav>' + '</div></header>';
  var partners = '<section class="partners-strip"><div class="partners-strip-inner">' + '<div class="partners-strip-label">Partner &amp; Medienpartner 2026</div>' + '<div class="partners-strip-logos">' + '<img src="assets/partners/Allianz.svg" alt="Allianz" title="Presenting Partner · Allianz" />' + '<img src="assets/partners/blick-logo.svg" alt="Blick" title="Medienpartner · Blick" />' + '<span class="partner-logo-text" title="Moto.ch"><b>Moto</b><small>.ch</small></span>' + '<span class="partner-logo-text" title="1000PS"><b>1000PS</b><small>.ch</small></span>' + '<img src="assets/partners/MotoScout24.svg" alt="MotoScout24" />' + '<img src="assets/partners/Radio-Zurisee.svg" alt="Radio Zürisee" />' + '<img src="assets/partners/Radio-Switzerland-Virgin.svg" alt="Radio Switzerland" />' + '<img src="assets/partners/Radio-Argovva.svg" alt="Radio Argovia" />' + '<span class="partner-logo-text" title="moto-lifestyle.ch"><b>moto-lifestyle</b><small>.ch</small></span>' + '</div>' + '</div></section>';
  var footer = '<footer><div class="footer-inner">' + '<div class="footer-brand">' + '<img class="footer-logo" src="assets/logo-moto-zuerich-white.svg" alt="MOTO-ZÜRICH" />' + '<p class="footer-tagline">Der unabhängige Saisonstart der Schweizer Motorradszene.<br />Urban. Kuratiert. Nahbar.</p>' + '<div class="footer-social" aria-label="Social Media">' + '<a href="https://www.instagram.com/motozuerich/" target="_blank" rel="noopener">IG</a>' + '<a href="https://www.facebook.com/motozuerich" target="_blank" rel="noopener">FB</a>' + '<a href="https://www.youtube.com/@motozuerich" target="_blank" rel="noopener">YT</a>' + '<a href="https://www.linkedin.com/company/motozuerich" target="_blank" rel="noopener">LI</a>' + '<a href="https://tiktok.me/motozuerich" target="_blank" rel="noopener">TT</a>' + '<a href="https://www.whatsapp.com/channel/0029VbAqa7tD38CIf5czGN2R" target="_blank" rel="noopener">WA</a>' + '</div>' + '</div>' + '<div class="footer-col"><h4>Besuch</h4><ul>' + '<li><a href="Programm.html">Programm</a></li>' + '<li><a href="Aussteller.html">Aussteller</a></li>' + '<li><a href="Party.html">Saisonstart-Party</a></li>' + '<li><a href="FAQ.html">Gut zu Wissen</a></li>' + '<li><a href="' + TICKETS + '" target="_blank" rel="noopener">Tickets</a></li>' + '</ul></div>' + '<div class="footer-col"><h4>Über uns</h4><ul>' + '<li><a href="Rueckblick-2026.html">MOTO-ZÜRICH 2026</a></li>' + '<li><a href="Team.html">Team</a></li>' + '<li><a href="Warum.html">Warum MOTO-ZÜRICH</a></li>' + '<li><a href="Sound.html">Sounds</a></li>' + '<li><a href="Medien.html">Medien</a></li>' + '</ul>' + '<a href="' + AUSSTELLER_MAIL + '" class="footer-cta">Aussteller werden <span>→</span></a></div>' + '<div class="footer-col"><h4>Kontakt</h4><ul>' + '<li><a href="mailto:team@motozuerich.ch">team@motozuerich.ch</a></li>' + '<li><a href="mailto:help@motozuerich.ch">help@motozuerich.ch</a></li>' + '<li><a href="tel:+41772871634">+41 77 287 16 34</a></li>' + '<li><a href="Volunteers.html">Volunteers</a></li>' + '<li><a href="Creators.html">Creators</a></li>' + '</ul></div>' + '</div>' + '<div class="footer-bottom">' + '<div><a href="Impressum.html">Impressum</a><a href="AGB.html">AGB</a><a href="Datenschutz.html">Datenschutz</a>' + '<a href="#" onclick="if(window.mzOpenConsent){window.mzOpenConsent();}return false;">Cookie-Einstellungen</a></div>' + '<div>© 2026 MOTO-ZÜRICH · Saisonstart Schweiz</div>' + '</div></footer>';
  var headerHTML = dateBar + header;
  var footerHTML = partners + footer;

  /* mount: header at the very top of <body>, footer/partners at the end */
  document.body.insertAdjacentHTML('afterbegin', headerHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "mz-chrome.js", error: String((e && e.message) || e) }); }

// mz-head.js
try { (() => {
/* ============================================================
   MOTO-ZÜRICH — shared <head> tracking + consent manager.
   Loaded SYNCHRONOUSLY in <head> of EVERY page (home + subs) so
   nothing is missed (does NOT rely on mz-chrome.js, which skips
   the home page and loads at end of body).

   - Google Consent Mode v2 (all denied by default)
   - GA4 (gtag.js)            — Measurement ID G-1MHSWJYZVN
   - Meta (Facebook) Pixel    — ID 1525171172005763
   - German cookie banner (Akzeptieren / Ablehnen / Einstellungen)
   Tags are loaded + fired ONLY after the user grants consent.
   ============================================================ */
(function () {
  var GA_ID = 'G-1MHSWJYZVN';
  var FB_ID = '1525171172005763';
  var STORE = 'mz-consent-v1';

  /* ---- Consent Mode v2: define gtag + default everything denied ---- */
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500
  });
  gtag('js', new Date());
  var gaLoaded = false;
  var pixelLoaded = false;
  function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('config', GA_ID, {
      anonymize_ip: true
    });
  }
  function loadPixel() {
    if (pixelLoaded) return;
    pixelLoaded = true;
    /* standard Meta Pixel bootstrap — only injected on consent */
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', FB_ID);
    window.fbq('track', 'PageView');
  }

  /* ---- read / write the stored decision ---- */
  function readConsent() {
    try {
      return JSON.parse(localStorage.getItem(STORE) || 'null');
    } catch (e) {
      return null;
    }
  }
  function writeConsent(c) {
    try {
      localStorage.setItem(STORE, JSON.stringify(c));
    } catch (e) {}
  }

  /* ---- apply a decision: update Consent Mode + (un)load tags ---- */
  function apply(c) {
    gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied'
    });
    if (c.analytics) loadGA();
    if (c.marketing) loadPixel();
  }

  /* ============================================================
     COOKIE BANNER  (sharp corners, no shadow, brand blue/red)
     ============================================================ */
  function buildBanner(existing) {
    var pref = existing || {
      analytics: true,
      marketing: true
    };
    var style = document.createElement('style');
    style.textContent = ['.mzc-banner{position:fixed;left:0;right:0;bottom:0;z-index:9000;', 'background:#fff;border-top:3px solid var(--brand,#2F65A0);', 'font-family:var(--font-body,system-ui,sans-serif);color:#14202e;}', '.mzc-inner{max-width:1440px;margin:0 auto;padding:24px 32px;', 'display:flex;gap:28px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;}', '.mzc-text{flex:1 1 460px;min-width:280px;}', '.mzc-label{font-family:var(--font-mono,monospace);font-weight:700;font-size:11px;', 'letter-spacing:.18em;text-transform:uppercase;color:var(--brand,#2F65A0);margin:0 0 8px;}', '.mzc-copy{font-size:14px;line-height:1.55;color:#45566a;margin:0;}', '.mzc-copy a{color:var(--brand-dark,#1f4571);text-decoration:underline;}', '.mzc-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;}', '.mzc-btn{font-family:var(--font-mono,monospace);font-weight:700;font-size:13px;', 'letter-spacing:.06em;text-transform:uppercase;border-radius:0;cursor:pointer;', 'padding:13px 22px;border:1px solid transparent;transition:background .2s,color .2s,transform .2s;}', '.mzc-btn:hover{transform:translateY(-1px);}', '.mzc-accept{background:var(--swiss-red,#C10D0D);color:#fff;border-color:var(--swiss-red,#C10D0D);}', '.mzc-accept:hover{background:var(--swiss-red-dark,#960909);border-color:var(--swiss-red-dark,#960909);}', '.mzc-reject{background:#fff;color:var(--brand,#2F65A0);border-color:var(--brand,#2F65A0);}', '.mzc-reject:hover{background:var(--brand,#2F65A0);color:#fff;}', '.mzc-settings{background:none;color:#5a6b7e;border-color:transparent;text-decoration:underline;padding:13px 8px;}', '.mzc-settings:hover{color:var(--brand,#2F65A0);}', '.mzc-panel{flex:1 1 100%;display:none;border-top:1px solid var(--line,rgba(47,101,160,.15));', 'margin-top:18px;padding-top:18px;}', '.mzc-panel.open{display:block;}', '.mzc-row{display:flex;gap:16px;align-items:flex-start;padding:12px 0;border-bottom:1px solid var(--line,rgba(47,101,160,.15));}', '.mzc-row:last-of-type{border-bottom:0;}', '.mzc-row-main{flex:1;}', '.mzc-row-name{font-family:var(--font-mono,monospace);font-weight:700;font-size:12px;', 'letter-spacing:.1em;text-transform:uppercase;color:#14202e;margin:0 0 3px;}', '.mzc-row-desc{font-size:13px;line-height:1.5;color:#5a6b7e;margin:0;}', '.mzc-toggle{appearance:none;-webkit-appearance:none;width:46px;height:24px;flex:none;', 'background:#c9d4e0;border-radius:0;position:relative;cursor:pointer;transition:background .2s;margin-top:2px;}', '.mzc-toggle:checked{background:var(--brand,#2F65A0);}', '.mzc-toggle:disabled{opacity:.5;cursor:not-allowed;}', '.mzc-toggle::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;', 'background:#fff;transition:transform .2s;}', '.mzc-toggle:checked::after{transform:translateX(22px);}', '.mzc-panel-actions{margin-top:16px;}', '@media(max-width:720px){.mzc-inner{padding:20px;gap:16px;}.mzc-actions{width:100%;}', '.mzc-accept,.mzc-reject{flex:1;text-align:center;}}'].join('');
    document.head.appendChild(style);
    var bar = document.createElement('div');
    bar.className = 'mzc-banner';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie-Einstellungen');
    bar.innerHTML = '<div class="mzc-inner">' + '<div class="mzc-text">' + '<p class="mzc-label">Cookies &amp; Datenschutz</p>' + '<p class="mzc-copy">Wir verwenden Cookies und Tracking-Technologien (Google Analytics 4, ' + 'Meta-Pixel), um die Nutzung unserer Website zu analysieren und unsere Inhalte zu verbessern. ' + 'Diese werden nur mit Ihrer Einwilligung geladen. Mehr dazu in der ' + '<a href="datenschutz">Datenschutzerklärung</a>.</p>' + '</div>' + '<div class="mzc-actions">' + '<button type="button" class="mzc-btn mzc-settings" data-mzc="settings">Einstellungen</button>' + '<button type="button" class="mzc-btn mzc-reject" data-mzc="reject">Ablehnen</button>' + '<button type="button" class="mzc-btn mzc-accept" data-mzc="accept">Akzeptieren</button>' + '</div>' + '<div class="mzc-panel" data-mzc-panel>' + '<div class="mzc-row">' + '<div class="mzc-row-main">' + '<p class="mzc-row-name">Notwendig</p>' + '<p class="mzc-row-desc">Für den Betrieb der Website technisch erforderlich. Immer aktiv.</p>' + '</div>' + '<input class="mzc-toggle" type="checkbox" checked disabled aria-label="Notwendig" />' + '</div>' + '<div class="mzc-row">' + '<div class="mzc-row-main">' + '<p class="mzc-row-name">Statistik</p>' + '<p class="mzc-row-desc">Google Analytics 4 — anonymisierte Messung der Seitennutzung.</p>' + '</div>' + '<input class="mzc-toggle" type="checkbox" data-mzc-pref="analytics"' + (pref.analytics ? ' checked' : '') + ' aria-label="Statistik" />' + '</div>' + '<div class="mzc-row">' + '<div class="mzc-row-main">' + '<p class="mzc-row-name">Marketing</p>' + '<p class="mzc-row-desc">Meta-Pixel — Reichweitenmessung und Werbung auf Facebook/Instagram.</p>' + '</div>' + '<input class="mzc-toggle" type="checkbox" data-mzc-pref="marketing"' + (pref.marketing ? ' checked' : '') + ' aria-label="Marketing" />' + '</div>' + '<div class="mzc-panel-actions">' + '<button type="button" class="mzc-btn mzc-reject" data-mzc="save">Auswahl speichern</button>' + '</div>' + '</div>' + '</div>';
    document.body.appendChild(bar);
    function close() {
      bar.parentNode && bar.parentNode.removeChild(bar);
    }
    function decide(c) {
      writeConsent(c);
      apply(c);
      close();
    }
    bar.addEventListener('click', function (e) {
      var act = e.target.getAttribute && e.target.getAttribute('data-mzc');
      if (!act) return;
      if (act === 'accept') {
        decide({
          analytics: true,
          marketing: true,
          ts: Date.now()
        });
      } else if (act === 'reject') {
        decide({
          analytics: false,
          marketing: false,
          ts: Date.now()
        });
      } else if (act === 'settings') {
        bar.querySelector('[data-mzc-panel]').classList.toggle('open');
      } else if (act === 'save') {
        var prefs = {};
        bar.querySelectorAll('[data-mzc-pref]').forEach(function (t) {
          prefs[t.getAttribute('data-mzc-pref')] = t.checked;
        });
        decide({
          analytics: !!prefs.analytics,
          marketing: !!prefs.marketing,
          ts: Date.now()
        });
      }
    });

    /* expose a re-open hook (e.g. a "Cookie-Einstellungen" footer link) */
    window.mzOpenConsent = function () {
      close();
      buildBanner(readConsent());
      var p = document.querySelector('[data-mzc-panel]');
      if (p) p.classList.add('open');
    };
  }

  /* ---- boot: apply prior decision, else show the banner ---- */
  function boot() {
    var stored = readConsent();
    if (stored && typeof stored.analytics === 'boolean') {
      apply(stored); // honour earlier choice, no banner
      window.mzOpenConsent = function () {
        buildBanner(stored);
      };
    } else {
      buildBanner(null); // first visit — ask
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "mz-head.js", error: String((e && e.message) || e) }); }

// mz-page.js
try { (() => {
/* ============================================================
   MOTO-ZÜRICH — shared page behaviours
   Used across all pages: mobile nav, video facade, scroll
   fade-ins, heading typewriter + plate reveal, animated
   counters, hash-driven <details> opening.
   (The home hero video/parallax lives inline on that page.)
   ============================================================ */
(function () {
  /* ---- mobile nav: close on link click ---- */
  document.querySelectorAll('#mainNav a').forEach(function (a) {
    a.addEventListener('click', function () {
      var nav = document.getElementById('mainNav');
      if (nav) nav.classList.remove('open');
    });
  });

  /* ---- video facade: click loads the YouTube iframe ---- */
  document.querySelectorAll('.video-card[data-embed]').forEach(function (card) {
    card.addEventListener('click', function () {
      if (card.classList.contains('playing')) return;
      var ifr = document.createElement('iframe');
      ifr.src = card.dataset.embed;
      ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      ifr.allowFullscreen = true;
      card.appendChild(ifr);
      card.classList.add('playing');
    });
  });

  /* ---- scroll fade-ins ---- */
  var faders = document.querySelectorAll('.body-fade');
  if (faders.length) {
    var fio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var d = parseInt(e.target.dataset.delay || '0', 10);
          setTimeout(function () {
            e.target.classList.add('in');
          }, d);
          fio.unobserve(e.target);
        }
      });
    }, {
      threshold: 0.15
    });
    faders.forEach(function (el) {
      fio.observe(el);
    });
  }

  /* ---- heading typewriter + plate reveal ----
     Each heading is split into per-character spans. On scroll-in the characters
     "type" one by one; when a character belongs to a highlight plate
     (.hl/.hl-soft/.hl-yellow) the plate's background slides in first, then its
     characters type on top. */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PLATE = '.hl, .hl-soft, .hl-yellow';
  function splitChars(element) {
    var childNodes = Array.prototype.slice.call(element.childNodes);
    childNodes.forEach(function (node, idx) {
      if (node.nodeType === Node.TEXT_NODE) {
        var text = node.textContent.replace(/\s+/g, ' ');
        var prev = node.previousSibling;
        var afterBr = prev && prev.nodeType === Node.ELEMENT_NODE && prev.tagName === 'BR';
        if (idx === 0 || afterBr) text = text.replace(/^\s+/, '');
        if (idx === childNodes.length - 1) text = text.replace(/\s+$/, '');
        if (!text.trim()) return;
        var frag = document.createDocumentFragment();
        for (var i = 0; i < text.length; i++) {
          var ch = text[i];
          var span = document.createElement('span');
          span.className = 'char';
          if (ch === ' ') span.innerHTML = '&nbsp;';else span.textContent = ch;
          frag.appendChild(span);
        }
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
        splitChars(node);
      }
    });
  }
  var headings = document.querySelectorAll('.section-title, .rueckblick-title, .page-hero-title');
  headings.forEach(function (h) {
    splitChars(h);
  });
  if (headings.length) {
    var titleObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var title = entry.target;
        titleObserver.unobserve(title);
        var chars = title.querySelectorAll('.char');
        var perChar = reduceMotion ? 0 : 28;
        var plateReveal = reduceMotion ? 0 : 550;
        var delay = 0;
        var seenPlates = new Set();
        chars.forEach(function (char) {
          var plate = char.closest(PLATE);
          if (plate && !seenPlates.has(plate)) {
            seenPlates.add(plate);
            (function (p, d) {
              setTimeout(function () {
                p.classList.add('revealed');
              }, d);
            })(plate, delay);
            delay += plateReveal;
          }
          (function (c, d) {
            setTimeout(function () {
              c.classList.add('shown');
            }, d);
          })(char, delay);
          delay += perChar;
        });
        title.querySelectorAll(PLATE).forEach(function (plate) {
          if (!seenPlates.has(plate)) {
            (function (p, d) {
              setTimeout(function () {
                p.classList.add('revealed');
              }, d);
            })(plate, delay);
            delay += plateReveal;
          }
        });
      });
    }, {
      threshold: 0.35
    });
    headings.forEach(function (h) {
      titleObserver.observe(h);
    });
  }

  /* ---- plates in body text (outside headings): just slide the background in ---- */
  var hlObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      setTimeout(function () {
        el.classList.add('revealed');
      }, 80);
      hlObserver.unobserve(el);
    });
  }, {
    threshold: 0.4
  });
  document.querySelectorAll(PLATE).forEach(function (el) {
    if (el.closest('.section-title, .rueckblick-title, .page-hero-title')) return;
    hlObserver.observe(el);
  });

  /* ---- sequential animated counters ---- */
  function chInt(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  }
  function deDec(n) {
    return n.toFixed(1).replace('.', ',');
  }
  var ease = function (t) {
    return 1 - Math.pow(1 - t, 3);
  };
  function fmt(v, f, s) {
    return (f === 'ch' ? chInt(v) : f === 'dec' ? deDec(v) : Math.round(v)) + (s || '');
  }
  function animate(big) {
    return new Promise(function (resolve) {
      var target = parseFloat(big.dataset.target),
        f = big.dataset.fmt,
        s = big.dataset.suffix || '',
        dur = 550,
        t0 = performance.now();
      (function step() {
        var p = Math.min((performance.now() - t0) / dur, 1);
        big.textContent = fmt(target * ease(p), f, s);
        if (p < 1) {
          setTimeout(step, 16);
        } else {
          big.textContent = fmt(target, f, s);
          big.closest('.num').classList.add('done');
          setTimeout(resolve, 280);
        }
      })();
    });
  }
  var grid = document.querySelector('.nums-grid');
  if (grid) {
    var started = false;
    function runSeq() {
      if (started) return;
      started = true;
      var cells = Array.prototype.slice.call(grid.querySelectorAll('.num-big'));
      (function next(i) {
        if (i >= cells.length) return;
        animate(cells[i]).then(function () {
          next(i + 1);
        });
      })(0);
    }
    var cio = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) {
        return e.isIntersecting;
      })) {
        runSeq();
        cio.disconnect();
      }
    }, {
      threshold: 0.2
    });
    cio.observe(grid);
  }

  /* ---- open targeted <details> on hash ---- */
  function openHashDetails() {
    var id = location.hash.slice(1);
    if (!id) return;
    var el = document.getElementById(id);
    if (el && el.tagName === 'DETAILS') el.open = true;
  }
  window.addEventListener('hashchange', openHashDetails);
  openHashDetails();
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "mz-page.js", error: String((e && e.message) || e) }); }

// ui_kits/website/Footer.jsx
try { (() => {
/* MOTO-ZÜRICH UI kit — Footer (dark) */

const LOGO_WHITE = "../../assets/logo-moto-zuerich-white.svg";
function Footer() {
  return /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("div", {
    className: "footer-inner"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    className: "footer-logo",
    src: LOGO_WHITE,
    alt: "MOTO-Z\xDCRICH"
  }), /*#__PURE__*/React.createElement("p", {
    className: "footer-tagline"
  }, "Der unabh\xE4ngige Saisonauftakt der Schweizer Motorradszene. 19.\u201321. Februar 2027 \xB7 Z\xFCrich-Oerlikon."), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "footer-cta"
  }, "Aussteller werden ", /*#__PURE__*/React.createElement("span", null, "\u2192"))), /*#__PURE__*/React.createElement("div", {
    className: "footer-col"
  }, /*#__PURE__*/React.createElement("h4", null, "Event"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#event"
  }, "Das Event")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#rueckblick"
  }, "R\xFCckblick 2026")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#programm"
  }, "Programm")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#presse"
  }, "Presse")))), /*#__PURE__*/React.createElement("div", {
    className: "footer-col"
  }, /*#__PURE__*/React.createElement("h4", null, "Besuchen"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Anreise")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Tickets")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "StageOne \xB7 Halle 550")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Z\xFCrich-Oerlikon")))), /*#__PURE__*/React.createElement("div", {
    className: "footer-col"
  }, /*#__PURE__*/React.createElement("h4", null, "Kontakt"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "yves@motozuerich.ch")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Instagram")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Newsletter")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Feedback"))))), /*#__PURE__*/React.createElement("div", {
    className: "footer-bottom"
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 MOTO-Z\xDCRICH"), /*#__PURE__*/React.createElement("span", null, "19.\u201321. Februar 2027 \xB7 Save the Date")));
}
Object.assign(window, {
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Header.jsx
try { (() => {
/* MOTO-ZÜRICH UI kit — Header (date bar + sticky glass nav) */
const {
  useState
} = React;
const LOGO = "../../assets/logo-moto-zuerich.svg";
function DateBar() {
  const items = ["MOTO-ZÜRICH 2027", "19.–21. Februar 2027", "Wird grösser", "Save the Date"];
  const run = [...items, ...items, ...items];
  return /*#__PURE__*/React.createElement("div", {
    className: "date-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "date-bar-track"
  }, run.map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i
  }, t))));
}
function Header() {
  const [open, setOpen] = useState(false);
  return /*#__PURE__*/React.createElement("header", {
    className: "header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-inner"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    className: "logo-link",
    "aria-label": "MOTO-Z\xDCRICH Home"
  }, /*#__PURE__*/React.createElement("img", {
    className: "logo-svg",
    src: LOGO,
    alt: "MOTO-Z\xDCRICH"
  })), /*#__PURE__*/React.createElement("button", {
    className: "nav-mobile-toggle",
    "aria-label": "Men\xFC",
    onClick: () => setOpen(o => !o)
  }, "\u2630"), /*#__PURE__*/React.createElement("nav", {
    className: open ? "open" : ""
  }, /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    onClick: () => setOpen(false)
  }, "Home")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#rueckblick",
    onClick: () => setOpen(false)
  }, "R\xFCckblick 2026")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#presse",
    onClick: () => setOpen(false)
  }, "Presse")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "nav-cta"
  }, "Aussteller werden \u2192"))))));
}
Object.assign(window, {
  DateBar,
  Header
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/HeroIdentity.jsx
try { (() => {
/* MOTO-ZÜRICH UI kit — Hero identity (gradient + wordmark) & Aussteller strip */

function HeroIdentity() {
  return /*#__PURE__*/React.createElement("section", {
    className: "hero-identity",
    id: "top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-identity-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-eyebrow"
  }, "Save the Date \xB7 Z\xFCrich-Oerlikon"), /*#__PURE__*/React.createElement("div", {
    className: "hero-wordmark"
  }, "MOTO-", /*#__PURE__*/React.createElement("wbr", null), "Z\xDCRICH"), /*#__PURE__*/React.createElement("div", {
    className: "hero-date-badge"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hero-date-num"
  }, "19.\u201321."), /*#__PURE__*/React.createElement("span", {
    className: "hero-date-rest"
  }, "Februar 2027")), /*#__PURE__*/React.createElement("div", {
    className: "hero-divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hero-slogan"
  }, "Erleben. Entdecken.", /*#__PURE__*/React.createElement("br", null), "Eintauchen.")));
}
function AusstellerStrip() {
  return /*#__PURE__*/React.createElement("section", {
    className: "strip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "strip-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "strip-text"
  }, "Werde Teil der ", /*#__PURE__*/React.createElement("b", null, "MOTO-Z\xDCRICH 2027")), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "strip-btn"
  }, "Aussteller werden ", /*#__PURE__*/React.createElement("span", null, "\u2192"))));
}
Object.assign(window, {
  HeroIdentity,
  AusstellerStrip
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/HeroIdentity.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/PillarSection.jsx
try { (() => {
/* MOTO-ZÜRICH UI kit — "Was ist MOTO-ZÜRICH" pillar grid */

const PILLARS = [{
  n: "01",
  cls: "aussteller",
  tag: "Erdgeschoss · StageOne",
  title: "Kuratierte Markenwelt",
  body: /*#__PURE__*/React.createElement(React.Fragment, null, "Echte Neuheiten der kommenden Saison \u2013 ausgew\xE4hlt und klar inszeniert. ", /*#__PURE__*/React.createElement("b", null, "Auf 5'740 m\xB2"), " pr\xE4sentieren Marken, H\xE4ndler und Importeure ihre Saison-Essenz.")
}, {
  n: "02",
  cls: "livearena",
  tag: "Bühne · StageOne",
  title: "Live Arena",
  body: /*#__PURE__*/React.createElement(React.Fragment, null, "Das ", /*#__PURE__*/React.createElement("b", null, "Herzst\xFCck"), " f\xFCr Talks, Interviews und Stories. Kurze Formate, keine endlosen Monologe \u2013 Racing-Einblicke, Reise-Geschichten und Premieren.")
}, {
  n: "03",
  cls: "yellow",
  tag: "Obergeschoss · Halle 550",
  title: "Action Zone",
  body: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "\xDCber 4'000 m\xB2"), " Erlebnisfl\xE4che f\xFCr Action, Show und Motorsport. Hier trifft ", /*#__PURE__*/React.createElement("b", null, "Adrenalin auf Community"), " \u2013 Motorsport zum Anfassen.")
}, {
  n: "04",
  cls: "",
  tag: "Chicago Bar",
  title: "Saisonstart-Party",
  body: /*#__PURE__*/React.createElement(React.Fragment, null, "Wenn der Tag endet, geht es weiter: Fahrer:innen, H\xE4ndler und Friends feiern den Saisonstart \u2013 mit ", /*#__PURE__*/React.createElement("b", null, "DJ-Sets, Drinks und Z\xFCrich-Flair."))
}];
function PillarSection() {
  return /*#__PURE__*/React.createElement("section", {
    className: "block",
    id: "event"
  }, /*#__PURE__*/React.createElement(FadeIn, {
    className: "section-label"
  }, /*#__PURE__*/React.createElement("span", null, "\xDCber das Event \xB7 F\xFCr alle, die noch nicht dabei waren")), /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, "Die ", /*#__PURE__*/React.createElement("span", {
    className: "hl"
  }, "MOTO-Z\xDCRICH"), /*#__PURE__*/React.createElement("br", null), "auf einen Blick"), /*#__PURE__*/React.createElement(FadeIn, {
    as: "p",
    className: "section-lead"
  }, "Der ", /*#__PURE__*/React.createElement("b", null, "unabh\xE4ngige Saisonauftakt"), " der Schweizer Motorradszene \u2013 ein urbanes, kuratiertes Drei-Tage-Event in Z\xFCrich-Oerlikon. Statt Messe-Gigantismus setzen wir auf", /*#__PURE__*/React.createElement("b", null, " Qualit\xE4t, N\xE4he und Erlebnis"), ": kompakt statt \xFCberdimensioniert, pers\xF6nlich statt anonym."), /*#__PURE__*/React.createElement("div", {
    className: "what-grid"
  }, PILLARS.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.n,
    className: "what-card " + p.cls
  }, /*#__PURE__*/React.createElement("div", {
    className: "what-card-num"
  }, p.n), /*#__PURE__*/React.createElement("div", {
    className: "what-card-tag"
  }, p.tag), /*#__PURE__*/React.createElement("h3", null, p.title), /*#__PURE__*/React.createElement("p", null, p.body)))));
}
Object.assign(window, {
  PillarSection
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/PillarSection.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/PressSection.jsx
try { (() => {
/* MOTO-ZÜRICH UI kit — Presse (media coverage cards) */

const PRESS = [{
  src: "Blick",
  title: "Publikumserfolg an der 1. MOTO-ZÜRICH"
}, {
  src: "Tages-Anzeiger",
  title: "Neue Motorradmesse in Oerlikon"
}, {
  src: "Moto.ch",
  title: "Der Messe-Rückblick"
}, {
  src: "1000PS",
  title: "Fotos und Bericht zur MOTO-ZÜRICH 2026"
}, {
  src: "Streetlife",
  title: "Das sind die Highlights der MOTO-ZÜRICH"
}];
function PressSection() {
  return /*#__PURE__*/React.createElement("section", {
    className: "block",
    id: "presse"
  }, /*#__PURE__*/React.createElement(FadeIn, {
    className: "section-label"
  }, /*#__PURE__*/React.createElement("span", null, "Presse \xB7 Berichterstattung 2026")), /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, "Die Presse \xFCber", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "hl"
  }, "MOTO-Z\xDCRICH 2026")), /*#__PURE__*/React.createElement(FadeIn, {
    as: "p",
    className: "section-lead"
  }, "Erste Eindr\xFCcke in der Berichterstattung. Die ", /*#__PURE__*/React.createElement("b", null, "vollst\xE4ndige Foto- und Videodokumentation"), " sowie der ausf\xFChrliche R\xFCckblick folgen", /*#__PURE__*/React.createElement("span", {
    className: "hl-soft"
  }, " im Juli 2026"), "."), /*#__PURE__*/React.createElement("div", {
    className: "press-grid"
  }, PRESS.map((p, i) => /*#__PURE__*/React.createElement("a", {
    className: "press-card",
    href: "#",
    key: i,
    onClick: e => e.preventDefault()
  }, /*#__PURE__*/React.createElement("div", {
    className: "press-card-source"
  }, p.src), /*#__PURE__*/React.createElement("div", {
    className: "press-card-title"
  }, p.title), /*#__PURE__*/React.createElement("div", {
    className: "press-card-arrow"
  }, "Artikel lesen \u2192")))));
}
Object.assign(window, {
  PressSection
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/PressSection.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/RueckblickSection.jsx
try { (() => {
/* MOTO-ZÜRICH UI kit — Rückblick 2026 (stats + programme accordion) */
const {
  useRef: useRefR,
  useState: useStateR
} = React;
const STATS = [{
  t: 2.5,
  fmt: "dec",
  suffix: "",
  label: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "Event-Tage"), /*#__PURE__*/React.createElement("br", null), "20.\u201322. Februar 2026")
}, {
  t: 10000,
  fmt: "ch",
  suffix: " m²",
  label: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "Eventfl\xE4che"), /*#__PURE__*/React.createElement("br", null), "StageOne + Halle 550")
}, {
  t: 80,
  fmt: "int",
  suffix: "",
  label: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "Aussteller & Acts"), /*#__PURE__*/React.createElement("br", null), "auf zwei Etagen")
}, {
  t: 84,
  fmt: "int",
  suffix: "",
  label: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "Programm-Auftritte"), /*#__PURE__*/React.createElement("br", null), "Live Arena & Action Zone")
}, {
  t: 22117,
  fmt: "ch",
  suffix: "",
  label: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "Besucher"), /*#__PURE__*/React.createElement("br", null), "MOTO-Z\xDCRICH 2026"),
  hi: true
}];
const PROGRAMME = [{
  side: "Live Arena",
  cls: "",
  title: "10 Programme · ~35 Auftritte",
  items: [["01", "Suse Mühlemeier · „Building Speed\"", "Frauen, Technik & Rennsport – Stories aus Boxengasse und Paddock."], ["02", "Horst Saiger LIVE · TT, Macau, NW200", "Onboard-Insights von den schnellsten Strassenkursen der Welt."], ["03", "Dominique Aegerter LIVE aus Phillip Island", "Live-Schaltung nach Australien vom WorldSBK-Wochenende."], ["04", "DJane INAMAR · Saisonstart-Party", "Night-Ride Vibes – Chill Lounge bis Melodic Techno."]]
}, {
  side: "Action Zone",
  cls: "action",
  title: "7 Shows · 49 Auftritte",
  items: [["01", "Live-Boxenstopp · Team Bolliger", "Boxenstopps im Minutentakt – wie an der echten 24h-Rennstrecke."], ["02", "Chris Lietsch · Harley-Davidson Stuntshow", "Offizieller H-D DACH Stuntfahrer auf der Low Rider S."], ["03", "Nicola L'Impennatore (IT) · Vespa Freestyle", "Italienischer Vespa-Profi mit 30+ Tricks – bis zum Backflip."]]
}, {
  side: "Aussteller 2026",
  cls: "aussteller",
  title: "92 Marken, Händler & Acts",
  items: [["—", "Ducati · BMW Motorrad · Harley-Davidson · Honda", "Erdgeschoss · StageOne – 32 Stände."], ["—", "Triumph · Zero · Vespa · Aprilia · Moto Guzzi", "Obergeschoss · Halle 550 – 30 Stände & Marken."], ["—", "SAIGER Racing · MotoGP-Simulator · Food Court", "Action Zone – 30 Acts & Erlebnisse."]]
}];
function Accordion() {
  const [open, setOpen] = useStateR(0);
  return /*#__PURE__*/React.createElement("div", {
    className: "programm-accordion",
    id: "programm"
  }, PROGRAMME.map((g, i) => /*#__PURE__*/React.createElement("div", {
    className: "programm-acc",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "programm-acc-summary",
    onClick: () => setOpen(open === i ? -1 : i),
    style: {
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "18px",
      padding: "20px 22px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "acc-side " + g.cls
  }, g.side), /*#__PURE__*/React.createElement("span", {
    className: "acc-title"
  }, g.title), /*#__PURE__*/React.createElement("span", {
    className: "acc-toggle"
  }, open === i ? "–" : "+")), open === i && /*#__PURE__*/React.createElement("ul", {
    className: "programm-list"
  }, g.items.map((it, j) => /*#__PURE__*/React.createElement("li", {
    className: "programm-item",
    key: j
  }, /*#__PURE__*/React.createElement("span", {
    className: "programm-num"
  }, it[0]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "programm-name"
  }, it[1]), /*#__PURE__*/React.createElement("div", {
    className: "programm-desc"
  }, it[2]))))))));
}
function RueckblickSection() {
  const gridRef = useRefR(null);
  useSequentialCounters(gridRef);
  return /*#__PURE__*/React.createElement("section", {
    className: "block-alt",
    id: "rueckblick"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inner"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hl"
  }, "R\xFCckblick"), " 2026"), /*#__PURE__*/React.createElement(FadeIn, {
    as: "p",
    className: "section-lead"
  }, "Mit der ersten Ausgabe ist ein ", /*#__PURE__*/React.createElement("b", null, "neuer Treffpunkt"), " f\xFCr die Schweizer Motorradszene entstanden. Auf ", /*#__PURE__*/React.createElement("b", null, "10'000 m\xB2"), " erwartete die Besucher:innen ein vielseitiges Programm \u2013 die Premiere hat gezeigt: die Szene w\xFCnscht sich ein", /*#__PURE__*/React.createElement("span", {
    className: "hl-soft"
  }, " unabh\xE4ngiges, kuratiertes Event zum Saisonstart"), "."), /*#__PURE__*/React.createElement("div", {
    className: "nums-grid",
    ref: gridRef
  }, STATS.map((s, i) => /*#__PURE__*/React.createElement("div", {
    className: "num" + (s.hi ? " hi" : ""),
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "num-big",
    "data-target": s.t,
    "data-fmt": s.fmt,
    "data-suffix": s.suffix
  }, "0"), /*#__PURE__*/React.createElement("div", {
    className: "num-label"
  }, s.label)))), /*#__PURE__*/React.createElement(Accordion, null)));
}
Object.assign(window, {
  RueckblickSection
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/RueckblickSection.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/helpers.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* MOTO-ZÜRICH UI kit — shared helpers: scroll fade-in + sequential counters */
const {
  useEffect,
  useRef
} = React;

/* Fade element up on scroll-in (mirrors .body-fade behavior). */
function FadeIn({
  as = "div",
  className = "",
  delay = 0,
  children,
  ...rest
}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(() => el.classList.add("in"), delay);
          io.unobserve(el);
        }
      });
    }, {
      threshold: 0.18
    });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    ref: ref,
    className: "body-fade " + className
  }, rest), children);
}

/* Swiss integer formatting: 22117 -> 22'117 */
function chInt(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}
function deDecimal(n) {
  return n.toFixed(1).replace(".", ",");
}
const EASE = t => 1 - Math.pow(1 - t, 3);
function fmtVal(v, fmt, suffix) {
  return (fmt === "ch" ? chInt(v) : fmt === "dec" ? deDecimal(v) : Math.round(v)) + suffix;
}

/* Animate one number cell over `dur` ms, resolve when done.
   Uses setTimeout ticks (not rAF) so it still completes and lands on the
   final value even when the tab/iframe is backgrounded (rAF gets paused). */
function animateCell(big, target, fmt, suffix, dur = 550) {
  return new Promise(resolve => {
    const start = performance.now();
    function step() {
      const p = Math.min((performance.now() - start) / dur, 1);
      big.textContent = fmtVal(target * EASE(p), fmt, suffix);
      if (p < 1) {
        setTimeout(step, 16);
      } else {
        big.textContent = fmtVal(target, fmt, suffix);
        big.closest(".num").classList.add("done");
        setTimeout(resolve, 280);
      }
    }
    step();
  });
}

/* Run all .num cells inside a grid sequentially, once it scrolls into view.
   Uses both IntersectionObserver and a scroll/visibility fallback so the
   sequence fires reliably regardless of how the grid enters the viewport. */
function useSequentialCounters(gridRef) {
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    let started = false;
    async function run() {
      if (started) return;
      started = true;
      const cells = Array.from(grid.querySelectorAll(".num-big"));
      for (const big of cells) {
        await animateCell(big, parseFloat(big.dataset.target), big.dataset.fmt, big.dataset.suffix || "");
      }
    }
    function visible() {
      const r = grid.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top < vh * 0.85 && r.bottom > 0;
    }
    function check() {
      if (!started && visible()) {
        run();
        cleanup();
      }
    }
    function cleanup() {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      if (io) io.disconnect();
    }
    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) {
          run();
          cleanup();
        }
      }, {
        threshold: 0.2
      });
      io.observe(grid);
    }
    window.addEventListener("scroll", check, {
      passive: true
    });
    window.addEventListener("resize", check);
    check(); // in case the grid is already on-screen at mount

    return cleanup;
  }, []);
}
Object.assign(window, {
  FadeIn,
  useSequentialCounters
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/helpers.jsx", error: String((e && e.message) || e) }); }

})();
