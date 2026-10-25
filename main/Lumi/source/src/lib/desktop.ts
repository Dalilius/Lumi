import {safeUrl} from './utils';
import type {Module} from './types';
export const isDesktop=()=>typeof window!=='undefined'&&'__TAURI_INTERNALS__' in window;
export async function detach(module:Module|'widget') {
  if(isDesktop()){const {invoke}=await import('@tauri-apps/api/core');await invoke('open_lumi_window',{module});}
  else {const url=module==='widget'?'/widget/':`/?module=${module}`;const win=window.open(url,`lumi-${module}`,module==='widget'?'width=380,height=500':'width=1200,height=800');if(!win)throw new Error('Autorise les fenêtres pour ouvrir ce module.');}
}
export async function openExternal(value:string) {
  const url=safeUrl(value);if(!url)throw new Error('Lien invalide.');
  if(isDesktop()){const {openUrl}=await import('@tauri-apps/plugin-opener');await openUrl(url);}else window.open(url,'_blank','noopener,noreferrer');
}
export async function download(blob:Blob,name:string) {
  if(isDesktop()){const {save}=await import('@tauri-apps/plugin-dialog');const {writeFile}=await import('@tauri-apps/plugin-fs');const path=await save({defaultPath:name});if(path)await writeFile(path,new Uint8Array(await blob.arrayBuffer()));}
  else {const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
}
