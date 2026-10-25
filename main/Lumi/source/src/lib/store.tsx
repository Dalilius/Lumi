'use client';
import {createContext,useContext,useEffect,useState,useCallback,useRef,type ReactNode} from 'react';
import {toast} from 'sonner';
import {defaultProfile,emptyData,type Mode,type Data,type Profile,type Table,type Tables} from './types';
import * as repo from './repository';
import {edge} from './backend';
import {isDesktop} from './desktop';
import {errorText} from './utils';
type Store={mode:Mode;data:Data;profile:Profile;loading:boolean;error:string;setMode:(mode:Mode)=>void;refresh:()=>Promise<void>;save:<K extends Table>(table:K,record:Tables[K],isNew?:boolean,label?:string)=>Promise<void>;remove:<K extends Table>(table:K,record:Tables[K])=>Promise<void>;updateProfile:(profile:Profile)=>Promise<void>};
const Context=createContext<Store|null>(null);
export function LumiProvider({children}:{children:ReactNode}) {
  const [mode,setModeState]=useState<Mode>('demo');const [data,setData]=useState<Data>(emptyData);const [profile,setProfile]=useState(defaultProfile);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const ticket=useRef(0);
  const refresh=useCallback(async()=>{const n=++ticket.current;try{const result=await repo.load(mode);if(n===ticket.current){setData(result.data);setProfile(result.profile);setError('');}}catch(e){if(n===ticket.current){setData(emptyData());setProfile(defaultProfile);setError(errorText(e));}}finally{if(n===ticket.current)setLoading(false);}},[mode]);
  useEffect(()=>{const saved=localStorage.getItem('lumi-mode');if(saved==='local'||saved==='cloud'){setModeState('local');localStorage.setItem('lumi-mode','local');}},[]);
  useEffect(()=>{setLoading(true);void refresh();const update=()=>{void refresh();};window.addEventListener('lumi-refresh',update);const bc=new BroadcastChannel('lumi');bc.onmessage=update;return()=>{ticket.current++;window.removeEventListener('lumi-refresh',update);bc.close();};},[mode,refresh]);
  useEffect(()=>{const onStorage=(event:StorageEvent)=>{if(event.key==='lumi-mode'&&['demo','local'].includes(event.newValue||'')){setData(emptyData());setLoading(true);setModeState(event.newValue as Mode);}};window.addEventListener('storage',onStorage);return()=>window.removeEventListener('storage',onStorage);},[]);
  useEffect(()=>{
    if(mode!=='local'||!isDesktop())return;
    let stopped=false;
    const sync=async()=>{if(document.visibilityState!=='visible'||stopped)return;const key='lumi-sync:'+profile.id;try{if(Date.now()-Number(localStorage.getItem(key)||0)<300000)return;localStorage.setItem(key,String(Date.now()));await edge('lumi-integrations',{action:'sync'});if(!stopped)await refresh();}catch{/* Manual sync in settings exposes connection errors without repeated toasts. */}};
    const run=()=>{if(navigator.locks)void navigator.locks.request('lumi-sync',{ifAvailable:true},lock=>lock?sync():undefined);else void sync();};
    run();const timer=setInterval(run,300000);return()=>{stopped=true;clearInterval(timer);};
  },[mode,profile.id,refresh]);
  useEffect(()=>{document.documentElement.dataset.oled=String(profile.oled_mode);},[profile.oled_mode]);
  const setMode=(next:Mode)=>{if(next===mode)return;localStorage.setItem('lumi-mode',next);setData(emptyData());setProfile(defaultProfile);setLoading(true);setModeState(next);};
  async function save<K extends Table>(table:K,record:Tables[K],isNew=false,label='Enregistré') {await repo.save(mode,table,record,isNew);await refresh();if(label)toast.success(label);}
  async function remove<K extends Table>(table:K,record:Tables[K]) {await repo.save(mode,table,{...record,deleted_at:new Date().toISOString()});await refresh();toast('Élément supprimé',{action:{label:'Annuler',onClick:()=>{void repo.save(mode,table,{...record,deleted_at:null}).catch(e=>toast.error(errorText(e)));}}});}
  async function updateProfile(next:Profile){await repo.saveProfile(mode,next);await refresh();}
  return <Context.Provider value={{mode,data,profile,loading,error,setMode,refresh,save,remove,updateProfile}}>{children}</Context.Provider>;
}
export function useLumi(){const context=useContext(Context);if(!context)throw new Error('LumiProvider manquant');return context;}
