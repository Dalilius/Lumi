import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Health, Profile } from './types';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export function localDate(date = new Date(), timezone = 'Europe/Paris') {
  return new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}
export function shiftDate(day: string, days: number) { const date=new Date(day+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+days);return date.toISOString().slice(0,10); }
export function clock(value:string, timezone='Europe/Paris') {return new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit',timeZone:timezone}).format(new Date(value));}
export function shortDate(value:string, timezone='Europe/Paris') {return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',timeZone:timezone}).format(new Date(value.length===10?value+'T12:00:00Z':value));}
export const uid = () => crypto.randomUUID();
export const baseRow = () => {const now=new Date().toISOString();return {id:uid(),created_at:now,updated_at:now,deleted_at:null};};
export const initials = (name:string) => name.split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase() || 'L';
export function safeUrl(value:string) { try {const url=new URL(value);return ['http:','https:'].includes(url.protocol) ? url.toString() : null;} catch {return null;} }
export function battery(today:Health|undefined,yesterday:Health|undefined,profile:Profile) {
  const targets=profile.nutrition_targets;
  if(today?.sleep_hours==null || today.sleep_quality==null || !yesterday?.nutrition_complete || !profile.sleep_target_hours) return null;
  const keys=['protein_g','carbs_g','fat_g','calories_kcal'] as const;
  const available=keys.filter(k=>(targets[k]??0)>0 && yesterday[k]!=null);
  if(!available.length) return null;
  const nutrition=available.reduce((sum,k)=>sum+Math.min((yesterday[k]??0)/targets[k]!,1),0)/available.length;
  return Math.round(100*(0.6*Math.min(today.sleep_hours/profile.sleep_target_hours,1)+0.2*today.sleep_quality/5+0.2*nutrition));
}
export function errorText(error:unknown) {return error instanceof Error?error.message:typeof error==='object'&&error&&'message' in error?String(error.message):'Une erreur est survenue. Réessaie.';}
export function exportName(value:string) {return value.replace(/[^\p{L}\p{N}_.-]+/gu,'_').slice(0,100);}
