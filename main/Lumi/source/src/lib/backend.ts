import {ai} from './ai';
import {integrations} from './integrations';
export async function edge<T=Record<string,unknown>>(service:string,body:Record<string,unknown>):Promise<T>{if(service==='lumi-ai')return await ai(body) as T;if(service==='lumi-integrations')return await integrations(body) as T;throw new Error('Service inconnu.');}
