#!/usr/bin/env node
// ============================================================
// House of Nook — Browser AI Proxy
// Routes /api/assistant → claude.ai (your Max plan)
// Routes /api/generate-render → ChatGPT (your Pro plan, DALL-E)
// Uses the mbrowse daemon (already running with logged-in sessions)
//
// Start: node browser-proxy/proxy.js
// Requires: mbrowse daemon running (`node ~/.claude/skills/mbrowse/bin/mbrowse headed`)
// Set BROWSER_PROXY_URL=http://localhost:3001 in .env
// ============================================================

const http = require('http');
const { execFileSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const MBROWSE = path.join(os.homedir(), '.claude/skills/mbrowse/bin/mbrowse');
const PORT = parseInt(process.env.BROWSER_PROXY_PORT || '3001', 10);

// Tab indices (match what mbrowse shows via `mbrowse tabs`)
// These are detected at startup and cached.
let CLAUDE_TAB = 2;
let GPT_TAB = 1;

// ── mbrowse helpers ─────────────────────────────────────────
function mb(...args) {
  try {
    const out = execFileSync('node', [MBROWSE, ...args.map(String)], {
      timeout: 15000,
      encoding: 'utf8',
    });
    return JSON.parse(out.trim());
  } catch (e) {
    if (e.stdout && e.stdout.trim()) {
      try { return JSON.parse(e.stdout.trim()); } catch {}
    }
    return null;
  }
}

function mbJs(tab, code) {
  // Must switch to the tab first; mbrowse js has no tab-targeting syntax
  mb('tab', tab);
  const result = mb('js', code);
  if (!result) return null;
  // mbrowse wraps result in { value: "..." }
  const raw = result.value ?? result;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return raw; }
  }
  return raw;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Detect tab indices from live mbrowse sessions ────────────
function detectTabs() {
  try {
    const result = mb('tabs');
    const tabs = result?.tabs || [];
    for (const t of tabs) {
      if (t.url.includes('claude.ai')) CLAUDE_TAB = t.idx;
      if (t.url.includes('chatgpt.com')) GPT_TAB = t.idx;
    }
    console.log(`[proxy] Tabs detected — Claude: ${CLAUDE_TAB}, ChatGPT: ${GPT_TAB}`);
  } catch (e) {
    console.warn('[proxy] Could not detect tabs, using defaults:', e.message);
  }
}

// ── Fill a contenteditable (Tiptap/ProseMirror) via JS ───────
function fillContentEditable(tab, selector, text) {
  // Escape text for inline JS string
  const escaped = JSON.stringify(text);
  return mbJs(tab, `
    (function() {
      const el = document.querySelector('${selector}');
      if (!el) return {ok: false, reason: 'element not found'};
      el.focus();
      el.innerHTML = '';
      const ok = document.execCommand('insertText', false, ${escaped});
      if (!ok) {
        // Fallback: DataTransfer paste simulation
        const dt = new DataTransfer();
        dt.setData('text/plain', ${escaped});
        el.dispatchEvent(new ClipboardEvent('paste', {clipboardData: dt, bubbles: true, cancelable: true}));
      }
      el.dispatchEvent(new InputEvent('input', {bubbles: true, data: ${escaped}}));
      return {ok: true, length: el.innerText.length};
    })()
  `);
}

// ── System prompt (matches assistant.ts) ────────────────────
const ASSISTANT_SYSTEM = `You are House of Nook's AI planner — a warm interior designer, practical cabinetmaker, and installer in one. The business focuses on shippable, garage-buildable modular nook systems for real family homes: mudroom benches, locker towers, coffee hutches, playroom/Montessori storage, reading benches, laundry utility nooks, and simple low storage beds.

You will receive the current project as JSON plus a user request.

CRITICAL: Respond with ONLY a JSON object — no prose outside it, no markdown fences, no explanation before or after. Start your response with { and end it with }.

The JSON must match exactly:
{
  "message": "string — friendly response to the user",
  "actions": [],
  "questions": [],
  "warnings": []
}

DesignAction types allowed in "actions":
  {"type":"ADD_UNIT","unitType":"base"|"upper"|"tall"|"shelf","wallIndex":0,"offset":0,"dimensions":{"width":48,"height":84,"depth":18},"label":"Mudroom bench"}
  {"type":"UPDATE_UNIT","unitId":"string","patch":{}}
  {"type":"MOVE_UNIT","unitId":"string","wallIndex":0,"offset":0}
  {"type":"DELETE_UNIT","unitId":"string"}
  {"type":"SET_MATERIAL","unitId":"string","role":"carcass"|"doors"|"back","materialId":"white-oak"}
  {"type":"SET_ROOM","patch":{}}
  {"type":"EXPLAIN","message":"string"}

Rules: all dimensions in INCHES. Keep designs modest and shippable.`;

// ── Ask Claude via claude.ai browser ─────────────────────────
async function askClaude(userMessage, context) {
  console.log(`[claude] Asking: "${userMessage.slice(0, 60)}..."`);

  // Switch to claude.ai tab and navigate to new conversation
  mb('tab', CLAUDE_TAB);
  mb('goto', 'https://claude.ai/new');
  await sleep(3500);

  // Build the combined prompt
  const fullPrompt = `${ASSISTANT_SYSTEM}

---

PROJECT CONTEXT:
${JSON.stringify(context, null, 2).slice(0, 3000)}

USER REQUEST:
${userMessage}

Respond now with ONLY the JSON object:`;

  // Fill the Tiptap editor
  const fillResult = fillContentEditable(CLAUDE_TAB, '[data-testid="chat-input"]', fullPrompt);
  if (!fillResult?.ok) {
    throw new Error(`Could not fill claude.ai input: ${fillResult?.reason || 'unknown'}`);
  }
  await sleep(800);

  // Click send via JS (mb click uses text-matching, not CSS selector)
  const clickResult = mbJs(CLAUDE_TAB, `
    (function() {
      const btn = document.querySelector('button[aria-label="Send message"]');
      if (!btn) {
        // Fallback: Enter key on the input
        const inp = document.querySelector('[data-testid="chat-input"]');
        if (inp) {
          inp.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));
          return {method: 'enter', found: true};
        }
        return {method: 'none', found: false};
      }
      btn.click();
      return {method: 'click', found: true};
    })()
  `);
  console.log('[claude] Send attempt:', JSON.stringify(clickResult));
  await sleep(3000);

  // Poll until streaming stops (stop button disappears)
  let responseText = '';
  for (let i = 0; i < 60; i++) {
    await sleep(2000);
    const state = mbJs(CLAUDE_TAB, `
      (function() {
        const stopBtn = document.querySelector('button[aria-label*="Stop"]');
        // .standard-markdown is Claude's response container
        const allMsgs = document.querySelectorAll('.standard-markdown');
        const lastMsg = allMsgs[allMsgs.length - 1];
        return JSON.stringify({
          streaming: !!stopBtn,
          text: lastMsg ? lastMsg.innerText : '',
          msgCount: allMsgs.length,
          url: location.href
        });
      })()
    `);

    if (state) {
      const { streaming, text, msgCount } = typeof state === 'string' ? JSON.parse(state) : state;
      if (!streaming && msgCount > 0 && text.length > 10) {
        responseText = text;
        break;
      }
      if (i % 5 === 0) console.log(`[claude] Waiting... (streaming=${streaming}, chars=${text.length})`);
    }
  }

  if (!responseText) throw new Error('Claude response timed out or was empty');
  console.log(`[claude] Got response (${responseText.length} chars)`);
  return responseText;
}

// ── Generate image via ChatGPT DALL-E ────────────────────────
async function generateImage(designDesc) {
  console.log('[chatgpt] Generating render...');

  // Switch to ChatGPT tab
  mb('tab', GPT_TAB);
  await sleep(1000);

  const prompt = `Please generate an image using DALL-E: A photorealistic interior design photograph of a ${designDesc.slice(0, 400)}. Warm, natural light, hardwood floors, neutral walls. Custom built-in cabinetry, beautifully finished. Architectural photography, wide-angle, no people.`;

  // Fill the ChatGPT input (div[role=textbox])
  const fillResult = mbJs(GPT_TAB, `
    (function() {
      const el = document.querySelector('#prompt-textarea');
      if (!el) return {ok: false, reason: 'textarea not found'};
      el.focus();
      el.textContent = ${JSON.stringify(prompt)};
      el.dispatchEvent(new InputEvent('input', {bubbles: true, data: ${JSON.stringify(prompt)}}));
      return {ok: true};
    })()
  `);

  if (!fillResult?.ok) throw new Error(`Could not fill ChatGPT input: ${fillResult?.reason}`);
  await sleep(500);

  // Click send (tab already set by the mbJs call above)
  mb('js', `
    (function() {
      const btn = document.querySelector('[data-testid="send-button"]');
      if (btn && !btn.disabled) btn.click();
      return {clicked: !!btn};
    })()
  `);
  console.log('[chatgpt] Prompt sent, waiting for image (up to 90s)...');
  await sleep(5000);

  // Poll for generated image
  for (let i = 0; i < 45; i++) {
    await sleep(2000);
    const result = mbJs(GPT_TAB, `
      (function() {
        // Look for generated images in the last assistant message
        const assistantMsgs = document.querySelectorAll('[data-message-author-role="assistant"]');
        const lastMsg = assistantMsgs[assistantMsgs.length - 1];
        const imgs = lastMsg ? lastMsg.querySelectorAll('img') : [];
        const stopBtn = document.querySelector('button[aria-label*="Stop"], [data-testid="stop-button"]');

        // Filter for actual content images (not avatars/icons). ChatGPT now
        // serves generated images from backend-api/estuary/content.
        const contentImgs = [...imgs].filter(img => {
          const src = img.src || '';
          const alt = img.alt || '';
          return img.naturalWidth > 200 &&
                 (src.includes('oai.download') || src.includes('openai') ||
                  src.includes('backend-api') || src.includes('estuary') ||
                  alt.startsWith('Generated image') ||
                  src.startsWith('blob:') || src.startsWith('data:'));
        });

        return JSON.stringify({
          streaming: !!stopBtn,
          imgCount: contentImgs.length,
          imgUrl: contentImgs[0]?.src || null,
          msgCount: assistantMsgs.length
        });
      })()
    `);

    if (result) {
      const state = typeof result === 'string' ? JSON.parse(result) : result;
      if (state.imgUrl) {
        console.log('[chatgpt] Image found!');
        return state.imgUrl;
      }
      if (!state.streaming && state.msgCount > 0 && i > 5) {
        // Response done but no image found — take a screenshot of the area
        console.log('[chatgpt] No img URL found, taking screenshot...');
        const shot = mb('screenshot', `tab:${GPT_TAB}`);
        if (shot?.data) return `data:image/png;base64,${shot.data}`;
        break;
      }
      if (i % 5 === 0) console.log(`[chatgpt] Waiting for image... (streaming=${state.streaming})`);
    }
  }

  throw new Error('Image generation timed out or produced no image');
}

// ── Analyze a room photo via claude.ai vision ────────────────
const ROOM_SYSTEM = `You are an architectural assistant that estimates a room layout from a single photo for a custom cabinetry app.
Return ONLY a JSON object (no prose, no markdown fences) matching exactly:
{
 "version":"1.0",
 "summary": string,
 "confidence": number,
 "assumptions": string[],
 "room": { "shape":"rect"|"l"|"u"|"alcove"|"corner", "width"?:number, "length"?:number, "height"?:number, "notchW"?:number, "notchL"?:number, "recessW"?:number, "recessD"?:number, "corner"?:number },
 "openings": [ { "kind":"window"|"door", "wallIndex":number, "offset":number, "width":number, "height":number, "sill":number, "confidence":number, "label"?:string } ],
 "recommendedCabinetZones": [ { "wallIndex":number, "startOffset":number, "endOffset":number, "recommendedDepth":number, "notes":string } ],
 "requiredMeasurements": [ { "key":string, "label":string, "reason":string, "unit":"in", "value"?:number } ]
}
All dimensions are INCHES. Wall 0 is the main/back wall. This is a STARTING DRAFT — populate requiredMeasurements with what the user must confirm before ordering. Never claim the photo gives exact measurements.`;

async function analyzeRoom(imageBase64, mediaType) {
  console.log('[claude-vision] Analyzing room photo...');

  // Decode the base64 image to a temp file for upload.
  const ext = (mediaType || 'image/jpeg').split('/')[1].replace('jpeg', 'jpg') || 'jpg';
  const tmpFile = path.join(os.tmpdir(), `nook-room-${Date.now()}.${ext}`);
  fs.writeFileSync(tmpFile, Buffer.from(imageBase64, 'base64'));

  try {
    mb('tab', CLAUDE_TAB);
    mb('goto', 'https://claude.ai/new');
    await sleep(3500);

    // Attach the photo to claude.ai's hidden file input.
    const up = mb('upload', '@input[data-testid="file-upload"]', tmpFile);
    if (!up || !up.ok) throw new Error('Could not attach the room photo to claude.ai');
    await sleep(3500); // let the thumbnail/upload settle

    // Type the vision prompt.
    const prompt = `${ROOM_SYSTEM}\n\nAnalyze the attached room photo and return ONLY the JSON object described above. Respond with just the JSON, starting with { and ending with }.`;
    const fillResult = fillContentEditable(CLAUDE_TAB, '[data-testid="chat-input"]', prompt);
    if (!fillResult || !fillResult.ok) throw new Error('Could not fill claude.ai input for vision');
    await sleep(800);

    // Send.
    mbJs(CLAUDE_TAB, `
      (function() {
        const btn = document.querySelector('button[aria-label="Send message"]');
        if (btn && !btn.disabled) { btn.click(); return {clicked:true}; }
        return {clicked:false};
      })()
    `);
    console.log('[claude-vision] Photo sent, waiting for analysis...');
    await sleep(4000);

    // Poll for the response (vision takes longer).
    let responseText = '';
    for (let i = 0; i < 75; i++) {
      await sleep(2000);
      const state = mbJs(CLAUDE_TAB, `
        (function() {
          const stopBtn = document.querySelector('button[aria-label*="Stop"]');
          const allMsgs = document.querySelectorAll('.standard-markdown');
          const lastMsg = allMsgs[allMsgs.length - 1];
          return JSON.stringify({ streaming: !!stopBtn, text: lastMsg ? lastMsg.innerText : '', msgCount: allMsgs.length });
        })()
      `);
      if (state) {
        const { streaming, text, msgCount } = typeof state === 'string' ? JSON.parse(state) : state;
        if (!streaming && msgCount > 0 && text.length > 20) { responseText = text; break; }
        if (i % 5 === 0) console.log(`[claude-vision] Waiting... (streaming=${streaming}, chars=${text.length})`);
      }
    }
    if (!responseText) throw new Error('Room analysis timed out or was empty');
    console.log(`[claude-vision] Got analysis (${responseText.length} chars)`);
    return responseText;
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

// ── JSON extraction ───────────────────────────────────────────
function extractJson(text) {
  const a = text.indexOf('{');
  const b = text.lastIndexOf('}');
  if (a < 0 || b < 0) return null;
  try { return JSON.parse(text.slice(a, b + 1)); } catch { return null; }
}

// ── HTTP server ───────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; });
    req.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(json);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  console.log(`\n[proxy] ${req.method} ${req.url}`);

  // ── POST /api/assistant ──
  if (req.url === '/api/assistant' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      if (!body.message) return send(res, 400, { error: 'No message provided.' });
      if (body.message.length > 4000) return send(res, 400, { error: 'Message too long.' });

      const responseText = await askClaude(body.message, body.context || {});
      const parsed = extractJson(responseText);

      if (parsed && typeof parsed.message === 'string' && Array.isArray(parsed.actions)) {
        return send(res, 200, parsed);
      }

      // Fallback: return raw text as an EXPLAIN action
      console.warn('[proxy] Claude did not return expected JSON shape, wrapping as EXPLAIN');
      return send(res, 200, {
        message: responseText.replace(/```json|```/g, '').trim().slice(0, 800),
        actions: [{ type: 'EXPLAIN', message: responseText.slice(0, 500) }],
      });
    } catch (e) {
      console.error('[proxy] assistant error:', e.message);
      return send(res, 502, { error: e.message || 'Browser assistant failed.' });
    }
  }

  // ── POST /api/generate-render ──
  if (req.url === '/api/generate-render' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const designDesc = (body.designDesc || '').slice(0, 3800);
      if (!designDesc) return send(res, 400, { error: 'No design description provided.' });

      const url = await generateImage(designDesc);
      if (!url) return send(res, 502, { error: 'No image generated.' });
      return send(res, 200, { url, revisedPrompt: null });
    } catch (e) {
      console.error('[proxy] render error:', e.message);
      return send(res, 502, { error: e.message || 'Browser render failed.' });
    }
  }

  // ── POST /api/analyze-room ──
  if (req.url === '/api/analyze-room' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      if (!body.imageBase64) return send(res, 400, { error: 'No image provided.' });
      const responseText = await analyzeRoom(body.imageBase64, body.mediaType || 'image/jpeg');
      const parsed = extractJson(responseText);
      if (!parsed || parsed.version !== '1.0' || !parsed.room) {
        return send(res, 502, { error: 'Vision model returned an unexpected shape.' });
      }
      return send(res, 200, parsed);
    } catch (e) {
      console.error('[proxy] analyze-room error:', e.message);
      return send(res, 502, { error: e.message || 'Browser room analysis failed.' });
    }
  }

  send(res, 404, { error: 'Not found.' });
});

// ── Startup ───────────────────────────────────────────────────
detectTabs();

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  House of Nook — Browser AI Proxy                          ║
║  Listening on http://localhost:${PORT}                       ║
║                                                              ║
║  Routes:                                                     ║
║    POST /api/assistant       → claude.ai (Max plan, tab ${CLAUDE_TAB}) ║
║    POST /api/generate-render → ChatGPT DALL-E (tab ${GPT_TAB})    ║
║                                                              ║
║  Make sure mbrowse is running headed with both sites open:  ║
║    node ~/.claude/skills/mbrowse/bin/mbrowse headed          ║
║                                                              ║
║  Then in .env: BROWSER_PROXY_URL=http://localhost:${PORT}    ║
╚══════════════════════════════════════════════════════════════╝
`);
});

server.on('error', e => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} already in use. Kill with: lsof -ti:${PORT} | xargs kill`);
  } else {
    console.error('Server error:', e);
  }
  process.exit(1);
});
