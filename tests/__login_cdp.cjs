const { spawn } = require('child_process');

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9222;
const profile = process.env.TEMP + '\\cp-cdp-login';

async function main() {
  const proc = spawn(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ], { stdio: 'ignore' });

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  let targets;
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      targets = await res.json();
      if (targets.length) break;
    } catch { /* retry */ }
  }
  const page = targets.find((t) => t.type === 'page');
  if (!page) { console.log('NO_PAGE_TARGET'); proc.kill(); return; }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let id = 0;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((resolve) => {
    const msgId = ++id;
    pending.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    }
    if (msg.method === 'Runtime.consoleAPICalled' || msg.method === 'Runtime.exceptionThrown') {
      const type = msg.method;
      const text = type === 'Runtime.exceptionThrown'
        ? JSON.stringify(msg.params.exceptionDetails)
        : msg.params.args.map((a) => a.value ?? a.description).join(' ');
      console.log(`[BROWSER ${type}]`, text.slice(0, 500));
    }
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:3000/admin/login' });

  await sleep(4000);

  const evalJs = async (expression) => {
    const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    return res.result ? res.result.value : res;
  };

  const url1 = await evalJs('location.href');
  console.log('URL_AFTER_LOAD:', url1);
  console.log('DEMO_ALERT:', await evalJs(`!!document.querySelector('.demo-credential-list')`));
  console.log('FORM_PRESENT:', await evalJs(`!!document.querySelector('.admin-login-form')`));

  const fillAndSubmit = await evalJs(`
    (async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      const email = document.querySelector('input[type="email"]');
      const pass = document.querySelector('input[type="password"]');
      setter.call(email, 'admin@sosfocinhocarente.org.br');
      email.dispatchEvent(new Event('input', { bubbles: true }));
      setter.call(pass, 'admin123');
      pass.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('.admin-login-form').requestSubmit();
      return 'submitted';
    })()
  `);
  console.log('SUBMIT:', fillAndSubmit);

  const t0 = Date.now();
  let url = await evalJs('location.href');
  let navMs = -1;
  while (Date.now() - t0 < 15000) {
    await sleep(250);
    url = await evalJs('location.href');
    if (url.endsWith('/admin')) { navMs = Date.now() - t0; break; }
  }
  console.log('NAV_TO_ADMIN_MS:', navMs);
  console.log('URL_AFTER_SUBMIT:', url);
  console.log('ERROR_ALERT:', await evalJs(`document.querySelector('.alert--error') ? document.querySelector('.alert--error').textContent.trim() : ''`));
  console.log('ADMIN_LAYOUT:', await evalJs(`!!document.querySelector('.admin-layout')`));
  console.log('SPINNER:', await evalJs(`!!document.querySelector('.page-loading')`));
  console.log('BODY_TEXT:', (await evalJs(`document.body.innerText.slice(0, 200)`)));

  proc.kill();
  process.exit(0);
}

main().catch((e) => { console.error('FAILED', e); process.exit(1); });
