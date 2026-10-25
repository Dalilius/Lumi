'use client';
import {useState,useRef} from 'react';
import {ArrowUp,Mic,Sparkles,MessageSquare} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {toast} from 'sonner';
import {useLumi} from '@/lib/store';
import {edge} from '@/lib/backend';
import {errorText,baseRow} from '@/lib/utils';
import {Dialog} from './ui/dialog';
import {Busy} from './ui/shared';
type Recognition={lang:string;interimResults:boolean;onresult:((event:{results:{[index:number]:{[index:number]:{transcript:string}}}})=>void)|null;onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void};
export function Chat({compact=false}:{compact?:boolean}){
 const {mode,data,profile,save}=useLumi();const [input,setInput]=useState('');const [busy,setBusy]=useState(false);const [open,setOpen]=useState(false);const [history,setHistory]=useState<{role:string;text:string}[]>([]);const [listening,setListening]=useState(false);const recognition=useRef<Recognition|null>(null);
 async function submit(){if(!input.trim()||busy)return;const prompt=input.trim();
  if(prompt.startsWith('/tache ')){try{await save('tasks',{...baseRow(),title:prompt.slice(7),module:'brief',priority:'medium',status:'todo'},true,'Tâche ajoutée');setInput('');}catch(e){toast.error(errorText(e));}return;}
  setOpen(true);setBusy(true);setInput('');setHistory(h=>[...h,{role:'user',text:prompt}]);
  try {if(mode==='demo')throw new Error('Passe dans ton espace personnel puis ajoute ta clé Gemini dans Réglages.');
   const result=await edge<{text:string}>('lumi-ai',{action:'chat',prompt,history:history.slice(-8),context:{profile:{full_name:profile.full_name,study_program:profile.study_program},tasks:data.tasks.map(x=>({title:x.title,status:x.status,due_at:x.due_at})),applications:data.job_applications.map(x=>({company:x.company,job_title:x.job_title,status:x.status}))}});setHistory(h=>[...h,{role:'model',text:result.text}]);
  }catch(e){setHistory(h=>[...h,{role:'system',text:errorText(e)}]);}finally{setBusy(false);}
 }
 function voice(){if(listening){recognition.current?.stop();return;}const w=window as unknown as {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};const R=w.SpeechRecognition||w.webkitSpeechRecognition;if(!R){toast('La dictée n’est pas disponible dans cette fenêtre. Sous Windows, utilise Win + H dans le champ.');return;}const r=new R();recognition.current=r;r.lang='fr-FR';r.interimResults=false;r.onresult=e=>setInput(v=>(v+' '+e.results[0][0].transcript).trim());r.onerror=e=>{setListening(false);toast.error('Dictée interrompue : '+e.error);};r.onend=()=>setListening(false);r.start();setListening(true);}
 return <><form className={'chat-composer '+(compact?'chat-compact':'')} onSubmit={e=>{e.preventDefault();void submit();}}><span className="chat-spark"><Sparkles size={18}/></span><input aria-label="Message pour Lumi" value={input} onChange={e=>setInput(e.target.value)} placeholder={compact?'Une question pour Lumi…':'Demande à Lumi, ou ajoute une /tache…'}/>{history.length>0&&<button type="button" className="icon-button" aria-label="Voir la conversation" onClick={()=>setOpen(true)}><MessageSquare size={16}/></button>}<button type="button" className={'icon-button '+(listening?'recording':'')} onClick={voice} aria-label={listening?'Arrêter la dictée':'Dicter un message'}><Mic size={17}/></button><button type="submit" className="send-button" disabled={busy||!input.trim()} aria-label="Envoyer à Lumi"><ArrowUp size={18}/></button></form><Dialog open={open} onOpenChange={setOpen} title="Un peu de clarté, avec Lumi" description={mode==='local'?'Gemini · tes messages restent dans cette session.':'Ajoute ta clé Gemini dans les réglages de l’application bureau.'} wide><div className="chat-history">{history.map((m,i)=><div className={'chat-message '+m.role} key={i}><small>{m.role==='user'?'Vous':m.role==='system'?'Information':'Lumi'}</small><div className="markdown"><ReactMarkdown>{m.text}</ReactMarkdown></div></div>)}{busy&&<Busy/>}</div><form className="chat-dialog-form" onSubmit={e=>{e.preventDefault();void submit();}}><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Continuer la conversation…" aria-label="Continuer la conversation"/><button className="send-button" disabled={busy||!input.trim()}><ArrowUp size={18}/></button></form></Dialog></>;
}
