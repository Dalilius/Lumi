import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['scripts/preview.mjs'],{env:{...process.env,PORT:'3000'}});
await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.LUMI_CHROMIUM_PATH?{executablePath:process.env.LUMI_CHROMIUM_PATH}:{}),...(process.env.LUMI_SINGLE_PROCESS?{args:['--single-process','--no-zygote','--disable-gpu']}: {})});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.addInitScript(()=>{
  localStorage.setItem('lumi-mode','local');window.__commands=[];let configured=false;
  const status=()=>({gemini_configured:configured,model:'gemini-3.8-flash',google_client_id:'',microsoft_client_id:'',microsoft_tenant:'common',connections:[{provider:'google',connected:false},{provider:'microsoft',connected:false}]});
  const ready=new Promise((resolve,reject)=>{const req=indexedDB.open('lumi-desktop-v1',1);req.onupgradeneeded=()=>{req.result.createObjectStore('rows',{keyPath:'key'});req.result.createObjectStore('files');req.result.createObjectStore('settings');};req.onerror=reject;req.onsuccess=()=>{const db=req.result;if(localStorage.getItem('fixture-seeded')){db.close();resolve();return;}const tx=db.transaction(['rows','files'],'readwrite');const row={id:'migrated',title:'Priorité migrée',module:'brief',status:'todo',priority:'high',created_at:'2026-10-23T08:00:00Z',updated_at:'2026-10-23T08:00:00Z'};tx.objectStore('rows').put({key:'local:tasks:migrated',mode:'local',table:'tasks',record:row});tx.objectStore('files').put(new Blob(['%PDF-old'],{type:'application/pdf'}),'local:lumi-academic:local/old.pdf');tx.oncomplete=()=>{localStorage.setItem('fixture-seeded','1');db.close();resolve();};tx.onerror=reject;};});
  window.__TAURI_INTERNALS__={invoke:async(command,args={})=>{
   await ready;window.__commands.push(command);const db=JSON.parse(localStorage.getItem('mock-sqlite')||'{}');
   if(command==='local_get')return db[args.key]??null;
   if(command==='local_list')return Object.entries(db).filter(([k])=>k.startsWith(args.prefix)).map(([key,value])=>({key,value}));
   if(command==='local_batch'){const next={...db};for(const w of args.writes){if('expected'in w&&JSON.stringify(next[w.key]??null)!==JSON.stringify(w.expected))throw new Error('CONFLICT');next[w.key]=w.value;}localStorage.setItem('mock-sqlite',JSON.stringify(next));return;}
   if(command==='plugin:dialog|save')return 'C:/Lumi-sauvegarde.json';
   if(command==='plugin:fs|write_file'){window.__backup=JSON.parse(new TextDecoder().decode(args));return;}
   if(command==='service_status')return status();
   if(command==='service_configure'){configured=!!args.settings.gemini_key;return status();}
   if(command==='gemini_generate')return {candidates:[{finishReason:'STOP',content:{parts:[{text:'Connexion simulée réussie.'}]}}]};
   throw new Error('Unexpected bridge command '+command);
  }};
 });
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:3000');await page.getByRole('button',{name:'Terminer Priorité migrée'}).waitFor();
 const snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('mock-sqlite')));assert.equal(snapshot['meta/migrated-v1'],true);assert.equal(snapshot['files/local:lumi-academic:local/old.pdf'].data,btoa('%PDF-old'));console.log('PASS Migration des anciennes données et pièces jointes vers le pont SQLite');
 await page.reload();await page.getByRole('button',{name:'Terminer Priorité migrée'}).waitFor();assert.equal((await page.evaluate(()=>window.__commands)).filter(x=>x==='local_batch').length,0);console.log('PASS Migration exécutée une seule fois');
 await page.getByRole('button',{name:'Réglages',exact:true}).click();await page.getByLabel('Clé API Gemini',{exact:false}).fill('fake-key-for-test');await page.getByRole('button',{name:'Enregistrer Gemini'}).click();await page.getByText('Clé enregistrée sur ce PC',{exact:true}).waitFor();assert.equal(await page.getByLabel('Clé API Gemini',{exact:false}).inputValue(),'');assert.equal(await page.evaluate(()=>JSON.stringify(localStorage).includes('fake-key-for-test')),false);await page.getByRole('button',{name:'Tester la connexion'}).click();await page.getByText('Gemini répond : connexion vérifiée.').waitFor();console.log('PASS Gemini utilise le pont natif ; la clé ne reste pas dans le champ ni le stockage web');
 const entry={key:'rows/local:tasks:restored',value:{id:'restored',title:'Priorité restaurée',module:'brief',status:'todo',priority:'medium',created_at:'2026-10-23T08:00:00Z',updated_at:'2026-10-23T08:00:00Z'}};
 await page.getByText('Choisir une sauvegarde',{exact:true}).locator('input').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:2,entries:[entry]}))});await page.getByRole('button',{name:'Restaurer cette sauvegarde'}).click();await page.getByText('Sauvegarde restaurée.',{exact:true}).waitFor();const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('mock-sqlite')));assert.equal(restored[entry.key].title,entry.value.title);assert.ok(restored['rows/local:tasks:migrated']);console.log('PASS Restauration explicite préservant les autres enregistrements');assert.deepEqual(errors,[]);
 await page.getByRole('button',{name:'Sauvegarder mon espace'}).click();await page.waitForFunction(()=>!!window.__backup);const exported=await page.evaluate(()=>window.__backup);assert.equal(exported.version,2);assert.ok(exported.entries.some(e=>e.key==='files/local:lumi-academic:local/old.pdf'));assert.ok(exported.entries.some(e=>e.key==="rows/local:tasks:restored"));assert.ok(exported.entries.every(e=>!e.key.startsWith('config/')));assert.ok(!JSON.stringify(exported).includes('fake-key-for-test'));console.log('PASS Sauvegarde complète avec pièces jointes et sans identifiants');await page.locator('.main-scroll').evaluate(e=>e.scrollTo(0,0));await page.screenshot({path:'tests/settings-local.png'});
 console.log('RESULT: 5 groupes du pont natif simulé validés ; appels externes et coffre Windows non exécutés.');
}finally{await browser?.close();server.kill();}
