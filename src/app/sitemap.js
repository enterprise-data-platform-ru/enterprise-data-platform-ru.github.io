import {site} from '../content/site.mjs';
export const dynamic = 'force-static';
export default function sitemap(){return [{url:site.url+'/',changeFrequency:'monthly',priority:1},{url:site.url+'/docs/',changeFrequency:'monthly',priority:0.8}];}
