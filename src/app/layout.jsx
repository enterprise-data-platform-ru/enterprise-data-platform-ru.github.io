import {assetPath} from '../lib/paths.mjs';
import React from 'react';
import {site} from '../content/site.mjs';
import './globals.css';
export const metadata = { metadataBase: new URL(site.url), title: 'Enterprise Data Platform — корпоративная платформа данных', description: site.description, alternates:{canonical:'/'}, openGraph:{title:site.name,description:site.description,url:site.url,siteName:site.name,locale:'ru_RU',type:'website',images:[{url:'/og.png',width:1200,height:630,alt:site.name}]}, icons:{icon:assetPath('/favicon.svg')}, robots:{index:true,follow:true} };
export default function RootLayout({children}){return <html lang="ru"><body>{children}</body></html>}
