import test from 'node:test';
import assert from 'node:assert/strict';
import {battery,localDate,shiftDate,safeUrl} from '../src/lib/utils';
import {parseContacts,parseCalendar} from '../src/lib/imports';
import {defaultProfile,type Health} from '../src/lib/types';

test('Dates : minuit à Paris et passage à l’heure d’été',()=>{
 assert.equal(localDate(new Date('2026-10-20T22:30:00Z'),'Europe/Paris'),'2026-10-21');
 assert.equal(shiftDate('2026-03-29',1),'2026-03-30');
 assert.equal(shiftDate('2026-01-01',-1),'2025-12-31');
});
test('Batterie : pas de valeur inventée lorsque le journal est incomplet',()=>{
 const today={sleep_hours:8,sleep_quality:5} as Health;
 const yesterday={nutrition_complete:true,protein_g:100,carbs_g:200,fat_g:50,calories_kcal:2000} as Health;
 const profile={...defaultProfile,nutrition_targets:{protein_g:100,carbs_g:200,fat_g:50,calories_kcal:2000}};
 assert.equal(battery(undefined,yesterday,profile),null);
 assert.equal(battery(today,{...yesterday,nutrition_complete:false},profile),null);
 assert.equal(battery(today,yesterday,defaultProfile),null);
 assert.equal(battery(today,yesterday,profile),100);
 assert.equal(battery({...today,sleep_hours:4},yesterday,profile),70);
});
test('CSV : BOM, colonnes françaises, séparateur, doublons et champs cités',()=>{
 const result=parseContacts('\uFEFFNom;Email;Entreprise;tags\r\nAlice;A@EXAMPLE.TEST;"Finance; Conseil";EDHEC|Alumni\r\nAlice; a@example.test ;Autre;\r\n;vide@example.test;;\r\nBob;;Cabinet;Audit');
 assert.equal(result.rows.length,2);assert.equal(result.skipped,2);
 assert.equal(result.rows[0].company,'Finance; Conseil');
 assert.deepEqual(result.rows[0].tags,['EDHEC','Alumni']);
 assert.equal(result.rows[0].email,'a@example.test');
 assert.throws(()=>parseContacts('nom,email\n"Alice,a@example.test'),/guillemets/);
});
test('ICS : récurrences, exception déplacée et date exclue',()=>{
 const ics=['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT','UID:finance','DTSTART:20261020T090000Z','DTEND:20261020T100000Z','RRULE:FREQ=DAILY;COUNT=4','EXDATE:20261022T090000Z','SUMMARY:Finance','END:VEVENT','BEGIN:VEVENT','UID:finance','RECURRENCE-ID:20261021T090000Z','DTSTART:20261021T110000Z','DTEND:20261021T120000Z','SUMMARY:Finance déplacé','END:VEVENT','END:VCALENDAR'].join('\r\n');
 const events=parseCalendar(ics,new Date('2026-10-19'),new Date('2026-10-25'));
 assert.equal(events.length,3);
 assert.equal(events[1].starts_at,'2026-10-21T11:00:00.000Z');
 assert.equal(events[1].title,'Finance déplacé');
 assert.equal(new Set(events.map(e=>e.external_id)).size,3);
});
test('ICS : événements annulés et import vide sans faux événement',()=>{
 const ics=['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT','UID:cancelled','DTSTART:20261021T090000Z','DTEND:20261021T100000Z','STATUS:CANCELLED','END:VEVENT','END:VCALENDAR'].join('\r\n');
 assert.equal(parseCalendar(ics).length,0);
 assert.throws(()=>parseCalendar('not a calendar'));
});
test('Les liens externes refusent JavaScript, les fichiers et les données embarquées',()=>{
 for(const value of ['javascript:alert(1)','file:///etc/passwd','data:text/html,hello','not a url'])assert.equal(safeUrl(value),null);
 assert.equal(safeUrl('https://www.edhec.edu'),'https://www.edhec.edu/');
});
