import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['scripts/preview.mjs'],{env:{...process.env,PORT:'3000'}});
await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error('Preview exited '+code)));});
let browser;
let passed=0;
try {
 browser=await chromium.launch({headless:true,...(process.env.LUMI_CHROMIUM_PATH?{executablePath:process.env.LUMI_CHROMIUM_PATH}:{}),...(process.env.LUMI_SINGLE_PROCESS?{args:['--single-process','--no-zygote','--disable-gpu']}: {})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Europe/Paris'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const check=async(name,fn)=>{await fn();passed++;console.log('PASS '+name);};
 const nav=async(name)=>{await page.getByRole('navigation').getByRole('button',{name}).click();};
 const dialog=()=>page.getByRole('dialog');
 const close=()=>dialog().getByRole('button',{name:'Fermer',exact:true}).click();
 const pdf={name:'Finance-test.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF')};
 await page.goto('http://127.0.0.1:3000');await page.waitForSelector('.hero-panel');
 await check('Découverte séparée des données personnelles',async()=>{assert.match(await page.locator('.demo-banner').innerText(),/données d’exemple/);await page.getByRole('button',{name:'Utiliser mon espace'}).click();await page.getByText('Une journée, trois priorités',{exact:true}).waitFor();assert.equal(await page.locator('.demo-banner').count(),0);});
 await check('Priorité : création, achèvement, annulation et persistance',async()=>{
  await page.getByRole('button',{name:'Ajouter une priorité'}).first().click();await dialog().getByLabel('Qu’allez-vous accomplir ?').fill('Réviser le DCF');await dialog().getByRole('button',{name:'Ajouter',exact:true}).click();
  await page.getByRole('button',{name:'Terminer Réviser le DCF'}).click();await page.getByRole('button',{name:'Réouvrir Réviser le DCF'}).waitFor();await page.getByRole('button',{name:'Annuler',exact:true}).last().click();await page.getByRole('button',{name:'Terminer Réviser le DCF'}).waitFor();
  await page.reload();await page.getByRole('button',{name:'Terminer Réviser le DCF'}).waitFor();
 });
 await check('CRM : saisie, tags et import CSV dédupliqué',async()=>{
  await nav('Réseau');await page.getByRole('button',{name:'Ajouter un contact'}).first().click();await dialog().getByLabel('Nom complet').fill('Alice Test');await dialog().getByLabel('Email',{exact:true}).fill('alice@example.test');await dialog().getByLabel('Entreprise',{exact:true}).fill('Finance Test');await dialog().getByLabel('Tags séparés par des virgules').pressSequentially('EDHEC,Finance');await dialog().getByRole('button',{name:'Enregistrer le contact'}).click();await dialog().waitFor({state:'hidden'});await page.getByText('Alice Test',{exact:true}).waitFor();
  await page.locator('input[type=file]').setInputFiles({name:'reseau.csv',mimeType:'text/csv',buffer:Buffer.from('nom,email,entreprise\nAlice Test,alice@example.test,Doublon\nBob Test,bob@example.test,Audit\n')});await page.getByText('Bob Test',{exact:true}).waitFor();assert.equal(await page.locator('tbody tr').count(),2,JSON.stringify(await page.locator('tbody tr').allTextContents()));assert.equal(await page.getByText('Finance',{exact:true}).count(),1);
 });
 await check('Santé : journal conservé après rechargement',async()=>{
  await nav('Santé & énergie');await page.getByRole('button',{name:'Saisir ma journée'}).click();for(const [name,value] of [['Sommeil (heures)','8'],['Protéines (g)','130'],['Glucides (g)','220'],['Lipides (g)','60'],['Énergie (kcal)','2200'],['Entraînement (minutes)','45']])await dialog().getByLabel(name,{exact:true}).fill(value);
  await dialog().getByLabel('Qualité du sommeil (1 à 5)').selectOption('4');await dialog().getByLabel('Charge cognitive ressentie (1 à 5)').selectOption('3');await dialog().getByRole('button',{name:'Enregistrer'}).click();await dialog().waitFor({state:'hidden'});await page.reload();await page.getByRole('button',{name:'Saisir ma journée'}).click();assert.equal(await dialog().getByLabel('Sommeil (heures)',{exact:true}).inputValue(),'8');await close();
 });
 await check('Académique : import PDF, suppression et annulation',async()=>{
  await nav('Espace académique');await page.locator('input[type=file]').setInputFiles(pdf);await page.getByRole('button',{name:/Finance-test/}).click();await dialog().getByRole('button',{name:'Supprimer',exact:true}).click();await page.getByRole('button',{name:'Annuler',exact:true}).last().click();await page.getByRole('button',{name:/Finance-test/}).waitFor();
 });
 await check('Candidature : révision, validation humaine, dossier envoyé figé',async()=>{
  await nav('Carrière');await page.getByRole('button',{name:'Ajouter une offre'}).click();await dialog().getByLabel('Entreprise',{exact:true}).fill('Entreprise Test');await dialog().getByLabel('Intitulé du poste').fill('Stage Analyste');await dialog().getByLabel('Texte de l’offre',{exact:false}).fill('Analyse financière et valorisation.');await dialog().getByLabel('Lettre de motivation').fill('Madame, Monsieur, voici ma lettre de candidature personnalisée.');await dialog().locator('input[type=file]').nth(1).setInputFiles({...pdf,name:'CV-test.pdf'});
  await dialog().getByRole('button',{name:'Enregistrer',exact:true}).click();await dialog().getByRole('button',{name:'Marquer prêt'}).click();await dialog().getByRole('button',{name:'Valider le dossier'}).click();await dialog().getByRole('button',{name:'J’ai envoyé ma candidature'}).waitFor();
  await dialog().getByLabel('Lettre de motivation').fill('Ma lettre mise à jour demande une nouvelle validation humaine.');await dialog().getByRole('button',{name:'Enregistrer',exact:true}).click();await dialog().getByRole('button',{name:'J’ai envoyé ma candidature'}).waitFor({state:'hidden'});
  await dialog().getByRole('button',{name:'Marquer prêt'}).click();await dialog().getByRole('button',{name:'Valider le dossier'}).click();await dialog().getByRole('button',{name:'J’ai envoyé ma candidature'}).click();await page.waitForFunction(()=>document.querySelector('textarea[disabled]')!==null);assert.equal(await dialog().getByLabel('Lettre de motivation').isDisabled(),true);await close();
 });
 await check('Réglages OLED et réorganisation de la navigation',async()=>{
  await page.getByRole('button',{name:'Réglages',exact:true}).click();await page.getByRole('switch',{name:'Mode OLED'}).click();await page.waitForFunction(()=>document.documentElement.dataset.oled==='true');await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.oled==='true');
  await page.getByRole('navigation').getByRole('button',{name:'Réseau',exact:true}).press('Alt+ArrowUp');await page.waitForFunction(()=>JSON.stringify([...document.querySelectorAll('nav button')].map(n=>n.textContent)).indexOf('Réseau')<JSON.stringify([...document.querySelectorAll('nav button')].map(n=>n.textContent)).indexOf('Santé'));
 });
 await check('Commande globale et seconde fenêtre',async()=>{
  await page.keyboard.press('Control+k');await dialog().getByLabel('Rechercher dans Lumi').fill('académique');await dialog().getByRole('button',{name:'Espace académique'}).click();await page.getByRole('heading',{name:'Comprendre. Retenir. Avancer.'}).waitFor();
  const popupPromise=context.waitForEvent('page');await page.getByRole('button',{name:'Détacher le module'}).click();const popup=await popupPromise;await popup.waitForSelector('h1');assert.match(await popup.locator('h1').innerText(),/Comprendre/);await popup.close();
 });
 await check('Widget : espace local et barre compacte',async()=>{const widget=await context.newPage();await widget.goto('http://127.0.0.1:3000/widget/');await widget.locator('.widget-shell').waitFor();assert.equal(await widget.locator('.widget-shell input').count(),1);await widget.close();});
 await check('Pas d’erreur JavaScript ni débordement horizontal à 960 px',async()=>{await page.setViewportSize({width:960,height:720});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);});
 console.log(`RESULT: ${passed} groupes de parcours validés dans Chromium. Les API externes et Windows ne sont pas exécutés par ce test.`);
}finally{await browser?.close();server.kill();}
