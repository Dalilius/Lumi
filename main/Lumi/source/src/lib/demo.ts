import { defaultProfile, emptyData, type Data, type Profile } from './types';
import { baseRow, localDate, shiftDate } from './utils';
export function demoSeed(): {data:Data;profile:Profile} {
  const today=localDate(), yesterday=shiftDate(today,-1), tomorrow=shiftDate(today,1);
  const data=emptyData();
  data.tasks=[
    {title:'Finaliser ma candidature en M&A',module:'career',estimated_minutes:40,priority:'high' as const},
    {title:'Réviser le coût moyen pondéré du capital',module:'academic',estimated_minutes:25,priority:'medium' as const},
    {title:'Recontacter mon réseau alumni',module:'crm',estimated_minutes:15,priority:'medium' as const}
  ].map((task,i)=>({...baseRow(),...task,status:'todo',focus_date:today,focus_rank:i+1}));
  data.job_applications=[
    {company:'Lazard',job_title:'Analyste M&A · Stage',location:'Paris',status:'draft' as const,match_score:86,notes:'Exemple de candidature, aucune offre réelle synchronisée.'},
    {company:'Amundi',job_title:'Investment Analyst',location:'Paris',status:'ready' as const,match_score:92,cover_letter:'Exemple de lettre — à remplacer par un dossier réel.',cv_file_path:'demo/cv.pdf'},
    {company:'Deloitte',job_title:'Audit financier · Stage',location:'Lille',status:'applied' as const,match_score:88,applied_at:yesterday+'T09:00:00Z'},
    {company:'BNP Paribas',job_title:'Corporate Finance Intern',location:'Paris',status:'interview' as const,match_score:90,applied_at:yesterday+'T09:00:00Z',interview_at:tomorrow+'T13:00:00Z'}
  ].map(job=>({...baseRow(),source:'manual',revision:1,offer_text:'Données de démonstration. Analyse financière, valorisation, Excel, anglais professionnel.',...job}));
  data.crm_contacts=[
    {full_name:'Clara Martin',company:'Lazard',job_title:'Analyste M&A',kind:'alumni' as const,status:'to_follow_up' as const,tags:['EDHEC','Finance'],next_follow_up_at:yesterday+'T08:00:00Z'},
    {full_name:'Thomas Laurent',company:'Amundi',job_title:'Portfolio Manager',kind:'manager' as const,status:'waiting' as const,tags:['Asset management'],next_follow_up_at:tomorrow+'T08:00:00Z'},
    {full_name:'Sarah Dubois',company:'Deloitte',job_title:'Talent Acquisition',kind:'recruiter' as const,status:'connected' as const,tags:['Audit']}
  ].map(contact=>({...baseRow(),...contact,notes:'Contact fictif de démonstration.'}));
  for(let i=6;i>=0;i--) data.macros_sleep.push({...baseRow(),log_date:shiftDate(today,-i),protein_g:[139,152,146,160,148,153,62][6-i],carbs_g:[230,250,240,260,245,250,93][6-i],fat_g:i?70:24,calories_kcal:i?2350:920,nutrition_complete:i>0,sleep_hours:[7.1,7.5,6.8,8,7.2,7.8,7.6][6-i],sleep_quality:i===3?5:4,workout_minutes:i%2===0?45:0,workout_type:'Musculation'});
  data.calendar_events=[
    {title:'Corporate Finance',starts_at:today+'T08:00:00Z',ends_at:today+'T09:30:00Z',location:'Salle B.204',source:'academic' as const},
    {title:'Pause & déjeuner',starts_at:today+'T10:30:00Z',ends_at:today+'T11:30:00Z',source:'google' as const},
    {title:'Risk Management',starts_at:today+'T12:00:00Z',ends_at:today+'T13:30:00Z',location:'Amphi 2',source:'academic' as const},
    {title:'Séance musculation',starts_at:today+'T16:00:00Z',ends_at:today+'T17:00:00Z',source:'google' as const}
  ].map(event=>({...baseRow(),...event}));
  data.inbox_messages=[
    {subject:'Votre entretien — prochaine étape',sender:'Équipe recrutement · Exemple',preview:'Un exemple de message reçu après une candidature.',provider:'gmail' as const},
    {subject:'Supports de Corporate Finance',sender:'EDHEC · Exemple',preview:'Les supports du prochain cours sont disponibles.',provider:'outlook' as const},
    {subject:'Rencontre alumni jeudi',sender:'EDHEC Alumni · Exemple',preview:'Une rencontre fictive pour découvrir le brief matinal.',provider:'outlook' as const}
  ].map((message,i)=>({...baseRow(),...message,received_at:today+`T0${7-i}:15:00Z`,is_read:false}));
  data.academic_notes=[{...baseRow(),title:'Corporate Finance · Les essentiels',course_name:'Corporate Finance',tags:['Finance','Exemple'],file_path:'demo/finance.pdf',original_filename:'Exemple_Finance.pdf',mime_type:'application/pdf',processing_status:'ready',summary_markdown:'## La valeur dans le temps\nUn euro disponible aujourd’hui peut être investi. Pour comparer des flux à des dates différentes, on les **actualise**.\n\n## Valeur actuelle nette\n**VAN = somme des flux actualisés − investissement initial.** Une VAN positive indique une création de valeur sous les hypothèses retenues.\n\n## WACC\nLe **coût moyen pondéré du capital** combine le coût des capitaux propres et le coût de la dette après impôt, pondérés par leurs valeurs de marché.\n\n*Fiche de démonstration, sans document de cours importé.*',quiz:[
    {id:'q1',question:'Une VAN positive indique, sous les hypothèses du calcul…',options:[{id:'a',text:'Une création de valeur'},{id:'b',text:'Une absence de risque'},{id:'c',text:'Un remboursement immédiat'}],correct_option_id:'a',explanation:'La VAN mesure la valeur actualisée des flux, nette de l’investissement initial.'},
    {id:'q2',question:'Le WACC pondère les financements selon…',options:[{id:'a',text:'Le nombre d’investisseurs'},{id:'b',text:'Leurs valeurs de marché'},{id:'c',text:'Le chiffre d’affaires'}],correct_option_id:'b',explanation:'Les pondérations sont fondées sur la valeur de marché des capitaux propres et de la dette.'},
    {id:'q3',question:'Quand le taux d’actualisation augmente, la valeur actuelle d’un flux positif futur…',options:[{id:'a',text:'Augmente'},{id:'b',text:'Reste identique'},{id:'c',text:'Diminue'}],correct_option_id:'c',explanation:'VA = flux / (1 + taux)^n : un taux plus élevé augmente le dénominateur.'}
  ]}];
  return {data,profile:{...defaultProfile,full_name:'Adel',nutrition_targets:{protein_g:150,carbs_g:250,fat_g:75,calories_kcal:2400},career_profile:{summary:'Exemple : étudiant BBA4 à l’EDHEC, spécialisation finance.',skills:['Excel','Analyse financière','Anglais']}}};
}
