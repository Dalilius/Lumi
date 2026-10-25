'use client';
import {useEffect,useState} from 'react';
import {Pause,Play,RotateCcw,Check} from 'lucide-react';
import {Dialog} from './ui/dialog';
import {Button} from './ui/button';
export function Focus({open,onOpenChange}:{open:boolean;onOpenChange:(value:boolean)=>void}){
 const [remaining,setRemaining]=useState(25*60);const [end,setEnd]=useState<number|null>(null);
 useEffect(()=>{if(!end)return;const tick=()=>{const n=Math.max(0,Math.ceil((end-Date.now())/1000));setRemaining(n);if(n===0)setEnd(null);};tick();const timer=setInterval(tick,250);return()=>clearInterval(timer);},[end]);
 return <Dialog open={open} onOpenChange={onOpenChange} title="Une chose à la fois." description="Une session de concentration, à ton rythme."><div className="focus-display"><div className="focus-ring"><div>{remaining===0?<Check size={48}/>:<span>{String(Math.floor(remaining/60)).padStart(2,'0')}<b>:</b>{String(remaining%60).padStart(2,'0')}</span>}</div></div><p>{remaining===0?'Session terminée. Prends une pause.':end?'Tu peux fermer cette fenêtre : le minuteur continue.':'Choisis ta priorité, éloigne les distractions.'}</p><div className="button-row"><Button onClick={()=>end?setEnd(null):setEnd(Date.now()+remaining*1000)} disabled={remaining===0}>{end?<Pause size={16}/>:<Play size={16}/>} {end?'Pause':'Commencer'}</Button><Button variant="ghost" onClick={()=>{setEnd(null);setRemaining(25*60);}}><RotateCcw size={16}/>Réinitialiser</Button></div></div></Dialog>;
}
