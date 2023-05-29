import axios from 'axios';
import { parse } from 'node-html-parser';
import RSS from 'rss';

const generateFeed = async () => {
  const indexPage = await axios.get('https://www.greenmax.co.jp/gm-product/completed-product/index.html');
  const lastPageUrl = parse(indexPage.data).querySelector('a.link_last').getAttribute('href');
  const lastPage = await axios.get(lastPageUrl);
  const prevPageUrl = parse(lastPage.data).querySelectorAll('.link_page').pop().getAttribute('href');
  const prevPage = await axios.get(prevPageUrl);
  const items = [
    ...parse(prevPage.data).querySelectorAll('#contentinner > div.col_box > div.col'),
    ...parse(lastPage.data).querySelectorAll('#contentinner > div.col_box > div.col'),
  ]
    .map(element => ({
      guid: element.querySelector('.col_num > small').textContent.match(/[0-9]+/g)[0],
      title: element.querySelector('a').getAttribute('title'),
      description: 'TBD',
      url: element.querySelector('a').getAttribute('href'),
      custom_elements: [{ image: element.querySelector('.col_thumb > img').getAttribute('src') }],
    }));

  const feed = new RSS({
    title: 'Nゲージ車両（完成品モデル）一覧｜Nゲージ鉄道模型のグリーンマックス',
    site_url: 'https://www.greenmax.co.jp/gm-product/completed-product/index.html',
    description: 'グリーンマックスの完成品モデルの RSS Feed です。',
    language: 'ja',
  });
  items.forEach(item => feed.item(item));
  return feed.xml();
};

export const handler = async () => ({
  statusCode: 200,
  body: await generateFeed(),
});

console.log(await generateFeed());
