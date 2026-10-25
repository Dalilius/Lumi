'use client';
import {useEffect} from 'react';
import {X,ArrowUpRight,GripHorizontal} from 'lucide-react';
import {Toaster} from 'sonner';
import {LumiProvider} from '@/lib/store';
import {Prism} from '@/components/prism';
import {Chat} from '@/components/chat';
import {detach,isDesktop} from '@/lib/desktop';
export default function Widget(){useEffect(()=>{document.body.classList.add('widget-body');return()=>document.body.classList.remove('widget-body');},[]);async function close(){if(isDesktop()){const {getCurrentWindow}=await import('@tauri-apps/api/window');await getCurrentWindow().close();}else window.close();}return <LumiProvider><div className="widget-shell"><header data-tauri-drag-region><span><span className="status-dot"/> Lumi</span><GripHorizontal size={18}/><div><button className="icon-button" aria-label="Ouvrir Lumi" onClick={()=>void detach('brief')}><ArrowUpRight size={15}/></button><button className="icon-button" aria-label="Fermer le widget" onClick={()=>void close()}><X size={15}/></button></div></header><Prism/><h2>Un esprit plus léger.</h2><p>Je suis là quand tu en as besoin.</p><Chat compact/></div><Toaster theme="dark" position="bottom-right"/></LumiProvider>;}
