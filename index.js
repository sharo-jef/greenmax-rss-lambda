import axios from 'axios';
import { parse } from 'node-html-parser';
import { json2xml } from 'xml-js';

const generateFeed = async () => {
  const indexPage = await axios.get('https://www.greenmax.co.jp/gm-product/completed-product/index.html');
  const lastPageUrl = parse(indexPage.data).querySelector('a.link_last').getAttribute('href');
  const lastPage = await axios.get(lastPageUrl);
  const prevPageUrl = parse(lastPage.data).querySelectorAll('.link_page').pop().getAttribute('href');
  const prevPage = await axios.get(prevPageUrl);
  const feedObject = {
    declaration: {
      attributes: {
        version: '1.0',
        encoding: 'utf-8',
      },
    },
    elements: [{
      type: 'element',
      name: 'rss',
      attributes: {
        version: '2.0',
      },
      elements: [
        {
          type: 'element',
          name: 'channel',
          elements: [
            {
              type: 'element',
              name: 'title',
              elements: [
                {
                  type: 'text',
                  text: 'Nゲージ車両（完成品モデル）一覧｜Nゲージ鉄道模型のグリーンマックス',
                },
              ],
            },
            {
              type: 'element',
              name: 'link',
              elements: [
                {
                  type: 'text',
                  text: 'https://www.greenmax.co.jp/gm-product/completed-product/index.html',
                },
              ],
            },
            {
              type: 'element',
              name: 'description',
              elements: [
                {
                  type: 'text',
                  text: 'グリーンマックスの完成品モデルの RSS Feed です。',
                },
              ],
            },
            {
              type: 'element',
              name: 'language',
              elements: [
                {
                  type: 'text',
                  text: 'ja',
                },
              ],
            },
          ],
        },
      ],
    }],
  };
  for (const element of [...parse(prevPage.data).querySelectorAll('#contentinner > div.col_box > div.col'), ...parse(lastPage.data).querySelectorAll('#contentinner > div.col_box > div.col')]) {
    // description の取得処理が重いので一旦 TBD を返すようにしている
    // const detailPage = await axios.get(element.querySelector('a').getAttribute('href'));
    // const description = Array
    //   .from(parse(detailPage.data).querySelector('div.info_box').childNodes)
    //   .map(e => e.textContent)
    //   .join('\n');
    const description = 'TBD';
    feedObject.elements[0].elements[0].elements.push({
      type: 'element',
      name: 'item',
      elements: [
        {
          type: 'element',
          name: 'guid',
          attributes: {
            isPermaLink: false,
          },
          elements: [
            {
              type: 'text',
              text: element.querySelector('.col_num > small').textContent.match(/[0-9]+/g)[0],
            },
          ],
        },
        {
          type: 'element',
          name: 'title',
          elements: [
            {
              type: 'text',
              text: element.querySelector('a').getAttribute('title'),
            },
          ],
        },
        {
          type: 'element',
          name: 'description',
          elements: [
            {
              type: 'text',
              text: description,
            },
          ],
        },
        {
          type: 'element',
          name: 'link',
          elements: [
            {
              type: 'text',
              text: element.querySelector('a').getAttribute('href'),
            },
          ],
        },
        {
          type: 'element',
          name: 'image',
          elements: [
            {
              type: 'text',
              text: element.querySelector('.col_thumb > img').getAttribute('src'),
            },
          ],
        },
      ],
    });
  }
  feedObject.elements[0].elements[0].elements.reverse();
  return json2xml(feedObject);
};

export const handler = async () => ({
  statusCode: 200,
  body: await generateFeed(),
});
