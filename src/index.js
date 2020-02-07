/**
 * 目标网站：http://www.douyingequ.com/
 * 子页面：
 *        1.http://www.douyingequ.com/douyinyingwen.htm 抖音英文歌曲
 *        2.http://www.douyingequ.com/douyinbang.htm  抖音最火歌曲
 *        3.http://www.douyingequ.com/douyinzhongwen.htm  抖音中文歌曲
 *        4.http://www.douyingequ.com/douyinnew.htm  抖音最新歌曲
 *        5.http://www.douyingequ.com/douyinbgm.htm  抖音BGM
 *        6.http://www.douyingequ.com/douyinshenqu.htm 抖音十大神曲
 */

const path = require('path');
const fs = require('fs');

const request = require('request');
const puppeteer = require('puppeteer');

const ramdomUA = require('random-fake-useragent');

function downloadFile(url, fileName, cb) {
  const stream = fs.createWriteStream(fileName);
  request(url).pipe(stream).on('close',cb);
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let ua = ramdomUA.getRandom();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent(ua);
  await page.goto('http://www.douyingequ.com/douyinshenqu.htm ');

  await page.screenshot({
    path: path.resolve(__dirname,'snapshot/bb.png'),
    fullPage: true,
  });

  // 获取f1下的音乐单曲播放页面地址
  let musicUrlList = await page.$$eval('#f1 li>a', eles => eles.map(ele => ele.href));
  const musicUrlList2 = await page.$$eval('#f2 li>a', eles => eles.map(ele => ele.href));
  const musicUrlList3 = await page.$$eval('#f3 li>a', eles => eles.map(ele => ele.href));
  await page.close();

  musicUrlList = musicUrlList.concat(musicUrlList2).concat(musicUrlList3);
  console.log('musicUrlList的长度---->', musicUrlList.length);

  // 遍历访问每个url获取音乐的下载地址
  for (let index = 48; index < musicUrlList.length; index += 1) {
    const musicUr = musicUrlList[index];
    // 新开一个页面
    const musicPage = await browser.newPage();
    ua = ramdomUA.getRandom();
    await musicPage.setUserAgent(ua);

    await musicPage.goto(musicUr);
    let songName = await musicPage.$eval('.playingTit h1', el => el.innerText);
    let singer = await musicPage.$eval('.playingTit h2', el => el.innerText);
    const url = await musicPage.$eval('#kuPlayer audio', el => el.src);
    const ext = path.extname(url);
    // 处理歌名中特殊符号
    songName = songName.replace(/\//g, '&');
    singer = singer.replace(/\//g, '&');
    console.log(`歌手：${singer}&&歌名：${songName}&&下载地址：${url}`)
    
    await musicPage.close();
    // 下载
    if (!url) continue;
    downloadFile(url, path.resolve(__dirname, 'music/', `${songName}-${singer}${ext}`), () => {
      console.log(`第${index + 1}首歌曲----${songName}-----下载完毕！剩余${musicUrlList.length - index - 1}首`);
    });
  }

  // 关闭浏览器
  await browser.close();
})();