// Minimal CDP client: evaluate JS in a tab by id. Usage: node cdp.mjs <tabId> <expression-file|expr>
import WebSocket from 'ws';
import fs from 'node:fs';
const [,, tabId, exprArg] = process.argv;
const expr = fs.existsSync(exprArg) ? fs.readFileSync(exprArg,'utf8') : exprArg;
const tabs = await (await fetch('http://localhost:9222/json')).json();
const tab = tabs.find(t=>t.id===tabId);
if(!tab){console.error('no tab');process.exit(1)}
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(r=>ws.on('open',r));
let id=0; const pending={};
ws.on('message',m=>{const d=JSON.parse(m);if(d.id&&pending[d.id]){pending[d.id](d);delete pending[d.id]}});
const send=(method,params={})=>new Promise(res=>{const i=++id;pending[i]=res;ws.send(JSON.stringify({id:i,method,params}))});
const r = await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});
if(r.result?.exceptionDetails) console.error(JSON.stringify(r.result.exceptionDetails,null,1));
else console.log(typeof r.result.result.value==='string'?r.result.result.value:JSON.stringify(r.result.result.value,null,1));
ws.close(); process.exit(0);
