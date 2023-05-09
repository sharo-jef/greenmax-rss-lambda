import { readFileSync } from 'fs';

import Parser from 'rss-parser';

const parser = new Parser();

const feed = readFileSync('rss.xml', 'utf-8');

console.log(await parser.parseString(feed));
