import {site} from '../content/site.mjs';
import {getPublishedDocs, docPath} from '../content/docs/navigation.mjs';

export const dynamic = 'force-static';

// Root и раздел документации всегда в sitemap; статьи добавляются только из
// опубликованных записей реестра (черновики и планы не публикуются).
export default function sitemap(){
  const urls = [
    {url:site.url+'/',changeFrequency:'monthly',priority:1},
    {url:site.url+'/docs/',changeFrequency:'monthly',priority:0.8},
  ];
  for (const d of getPublishedDocs()) {
    urls.push({url:site.url+docPath(d.slug),changeFrequency:'monthly',priority:0.7});
  }
  return urls;
}
