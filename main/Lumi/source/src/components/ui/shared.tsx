import type {ReactNode} from 'react';
import {ArrowUpRight,LoaderCircle,Plus} from 'lucide-react';
import {Button} from './button';
export function PageHeader({eyebrow,title,description,children}:{eyebrow:string;title:string;description:string;children?:ReactNode}){return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div><div className="page-actions">{children}</div></div>;}
export function Panel({title,subtitle,action,children,className=''}:{title?:string;subtitle?:string;action?:ReactNode;children:ReactNode;className?:string}){return <section className={'panel '+className}>{title&&<div className="panel-heading"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>}{children}</section>;}
export function Empty({title,text,action,label}:{title:string;text:string;action?:()=>void;label?:string}){return <div className="empty-state"><div className="empty-symbol"><Plus size={23}/></div><h3>{title}</h3><p>{text}</p>{action&&<Button variant="secondary" onClick={action}>{label||'Commencer'}<ArrowUpRight size={14}/></Button>}</div>;}
export function Field({label,children,help}:{label:string;children:ReactNode;help?:string}){return <label className="field"><span>{label}</span>{children}{help&&<small>{help}</small>}</label>;}
export function Busy({text='Lumi réfléchit…'}:{text?:string}){return <span className="busy"><LoaderCircle size={16} className="spin"/>{text}</span>;}
export function Badge({children,tone='neutral'}:{children:ReactNode;tone?:string}){return <span className={'badge badge-'+tone}>{children}</span>;}
