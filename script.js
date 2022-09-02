import { readCSV } from 'https://deno.land/x/flat@0.0.15/mod.ts';
import { tidy, count } from 'https://esm.sh/@tidyjs/tidy@2.5.1';

// 获取当前目录下的所有 csv 文件
const entries = [];
for await (const dirEntry of Deno.readDir('.')) {
  if (dirEntry.isFile && dirEntry.name.endsWith('.csv')) {
    entries.push(dirEntry.name);
  }
}

const all = await Promise.all(
  entries.map(async (entry) => {
    // console.log(entry);
    return await readCSV(entry, {
      columns: ['id', 'name', 'percent', 'difficulty', 'unknown', 'url'],
      skipFirstRow: false,
    });
  })
).then((res) => res.reduce((pre, cur) => pre.concat(cur), []));

// 统计出现的次数，以及难度
const data = tidy(
  all,
  count(['name', 'difficulty', 'url'], { name: 'count', sort: true })
);

// console.log(data.slice(0, 200));
await Deno.writeTextFile(
  `README.md`,
  '# 统计各大公司出题频率\n\n' +
    data
      .slice(0, 200) // 取前200道题
      .map(
        (v) => `- [${v.name}](${v.url.trim()}) - ${v.difficulty} - ${v.count}`
      )
      .join('\n')
);
