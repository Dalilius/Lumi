import type {Metadata} from 'next';
import '@fontsource/geist/400.css';
import '@fontsource/geist/500.css';
import '@fontsource/geist/600.css';
import './globals.css';
export const metadata:Metadata={title:'Lumi — Votre second cerveau',description:'Un espace de clarté pour vos études, votre carrière et votre énergie.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>;}
