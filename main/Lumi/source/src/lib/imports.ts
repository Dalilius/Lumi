import Papa from 'papaparse';
import ICAL from 'ical.js';
import {baseRow,localDate} from './utils';
import {save,load} from './repository';
import type {Mode,Contact,CalendarEvent} from './types';
export function parseContacts(text:string):{rows:Partial<Contact>[];skipped:number} {
 const result=Papa.parse<Record<string,string>>(text,{header:true,skipEmptyLines:'greedy',transformHeader:h=>h.trim().replace(/^\uFEFF/,'').toLowerCase()});
 if(result.errors.some(e=>e.type==='Quotes'))throw new Error('Le CSV contient des guillemets non fermés.');
 const rows:Partial<Contact>[]=[];let skipped=0;const seen=new Set<string>();
 for(const row of result.data){const full_name=(row.full_name||row.nom||row.name||'').trim();const email=(row.email||row.mail||'').trim().toLowerCase();if(!full_name||(email&&seen.has(email))){skipped++;continue;}if(email)seen.add(email);rows.push({full_name,email:email||undefined,company:row.company||row.entreprise||'',job_title:row.job_title||row.poste||'',kind:['alumni','manager','recruiter','other'].includes(row.kind)?row.kind as Contact['kind']:'other',status:'to_contact',tags:(row.tags||'').split(/[;|]/).map(t=>t.trim()).filter(Boolean),linkedin_url:row.linkedin_url||row.linkedin||undefined});}
 return {rows,skipped};
}
export function parseCalendar(text:string,from=new Date(Date.now()-7*86400000),to=new Date(Date.now()+120*86400000)) {
 const root=new ICAL.Component(ICAL.parse(text));
 if(root.name!=='vcalendar')throw new Error('Le fichier ne contient pas de calendrier valide.');
 for(const tz of root.getAllSubcomponents('vtimezone')){const id=tz.getFirstPropertyValue('tzid');if(typeof id==='string')ICAL.TimezoneService.register(new ICAL.Timezone(tz),id);}
 const components=root.getAllSubcomponents('vevent');
 const result=new Map<string,Omit<CalendarEvent,'id'|'created_at'|'updated_at'>>();
 for(const component of components.filter(c=>!c.hasProperty('recurrence-id'))){
  if(component.getFirstPropertyValue('status')==='CANCELLED')continue;
  const event=new ICAL.Event(component);
  if(!event.uid||!event.startDate)throw new Error('Un événement est incomplet (UID ou date manquant).');
  for(const exception of components.filter(c=>c.hasProperty('recurrence-id')&&c.getFirstPropertyValue('uid')===event.uid))event.relateException(exception);
  const instances:{key:string;start:ICAL.Time;end:ICAL.Time;item:ICAL.Event}[]=[];
  if(event.isRecurring()) {
   const iterator=event.iterator();let next:ICAL.Time|null;let guard=0;
   while((next=iterator.next())){
    if(++guard>10000)throw new Error('Récurrence trop longue : exportez une période plus récente.');
    if(next.toJSDate()>to)break;
    if(next.toJSDate()>=from){const occurrence=event.getOccurrenceDetails(next);instances.push({key:next.toString(),start:occurrence.startDate,end:occurrence.endDate,item:occurrence.item});}
   }
  } else instances.push({key:event.startDate.toString(),start:event.startDate,end:event.endDate,item:event});
  for(const {key,start,end,item} of instances){
   if(item.component.getFirstPropertyValue('status')==='CANCELLED')continue;
   const external_id=`ics:${event.uid}:${key}`;
   result.set(external_id,{title:item.summary||'Cours',starts_at:start.toJSDate().toISOString(),ends_at:end.toJSDate().toISOString(),source:'academic',location:item.location||'',external_id,all_day:start.isDate});
   if(result.size>1500)throw new Error('Import limité à 1 500 événements. Réduisez la période du calendrier.');
  }
 }
 return [...result.values()];
}
export async function importCalendar(file:File,mode:Mode) {
 if(file.size>5*1024*1024)throw new Error('Le calendrier doit peser moins de 5 Mo.');
 const records=parseCalendar(await file.text());
 const {data}=await load(mode);
 for(const record of records){const existing=data.calendar_events.find(x=>x.external_id===record.external_id);await save(mode,'calendar_events',{...(existing||baseRow()),...record},!existing);}
 return records.length;
}
