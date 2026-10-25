import test from 'node:test';
import assert from 'node:assert/strict';
import {revisedJob,validateBackup} from '../src/lib/repository';
import type {Job} from '../src/lib/types';
const job:Job={id:'job',company:'Test',job_title:'Analyste',source:'manual',status:'ready',created_at:'2026-10-23',updated_at:'2026-10-23',revision:3,cover_letter:'Lettre validée',cv_file_path:'local/cv.pdf',approved_at:'2026-10-23',approved_revision:3};
test('Candidatures : une modification invalide la validation, un envoi est figé',()=>{
 const next=revisedJob({...job,cover_letter:'Nouvelle lettre'},job);assert.equal(next.revision,4);assert.equal(next.approved_at,null);assert.equal(next.status,'draft');
 assert.throws(()=>revisedJob({...next,applied_at:'2026-10-23'},next),/Validez/);
 const sent=revisedJob({...job,applied_at:'2026-10-23',status:'applied'},job);assert.equal(sent.applied_at,'2026-10-23');
 assert.throws(()=>revisedJob({...sent,cover_letter:'Modifiée'},sent),/figé/);
 assert.equal(revisedJob({...sent,status:'interview'},sent).status,'interview');
});
test('Candidatures : aucun nouveau dossier ne peut importer une validation',()=>{const next=revisedJob({...job,applied_at:'2026-10-23'});assert.equal(next.revision,1);assert.equal(next.approved_at,null);assert.equal(next.applied_at,null);});
test('Sauvegarde : données et fichiers, sans entrée de configuration ni identifiants',()=>{
 const entries=[{key:'rows/local:tasks:one',value:{id:'one',created_at:'2026-10-23',updated_at:'2026-10-23',title:'Réviser',module:'brief',status:'todo',priority:'medium'}},{key:'files/local:lumi-academic:local/a.pdf',value:{mime:'application/pdf',data:btoa('%PDF-1.4')} }];
 assert.deepEqual(validateBackup({version:2,entries}),entries);
 for(const key of ['config/services','meta/migrated-v1','rows/demo:tasks:one','settings/local:secrets'])assert.throws(()=>validateBackup({version:2,entries:[{key,value:{id:'one'}}]}));
 assert.throws(()=>validateBackup({version:2,entries:[entries[0],entries[0]]}));
 assert.throws(()=>validateBackup({version:2,entries:[{key:'rows/local:tasks:other',value:{id:'one'}}]}));
 assert.throws(()=>validateBackup({version:1,entries:[]}));
 assert.throws(()=>validateBackup({version:2,entries:[{key:'files/local:x',value:{mime:'application/pdf',data:'%%%'}}]}));
});
