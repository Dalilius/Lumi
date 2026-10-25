import {isDesktop} from './desktop';
export async function native<T>(command:string,args:Record<string,unknown>={}):Promise<T>{if(!isDesktop())throw new Error('Cette connexion utilise le coffre Windows. Ouvrez la version bureau de Lumi.');const {invoke}=await import('@tauri-apps/api/core');try{return await invoke<T>(command,args);}catch(e){throw new Error(typeof e==='string'?e:'L’opération native a échoué.');}}
export const bytesToBase64=(bytes:Uint8Array)=>{let s='';for(let i=0;i<bytes.length;i+=16384)s+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(s);};
export const base64ToBytes=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
export type ServiceStatus={gemini_configured:boolean;model:string;google_client_id?:string;google_secret_configured?:boolean;microsoft_client_id?:string;microsoft_tenant:string;connections:{provider:'google'|'microsoft';connected:boolean;email?:string}[]};
