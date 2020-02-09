/**
 * 2020年部编版一年级下册语文电子课本: https://mp.weixin.qq.com/s/uDtA3CpZWPWseOud90YFCw
 * 【北师大版】一年级下册教材电子版: https://mp.weixin.qq.com/s/GABIYfIDmly7VjX1BCj6VA
 * jpeg-->pdf: https://smallpdf.com/cn/result#r=0db0c713ddc93b824eeddfd9bc796d71&t=jpg
 */
const path = require('path');
const puppeteer = require('puppeteer');
const ramdomUA = require('random-fake-useragent');

const download = require('../utils/download');

(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  let ua = ramdomUA.getRandom();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent(ua);
  // 【北师大版】一年级下册教材电子版
  await page.goto('https://mp.weixin.qq.com/s/GABIYfIDmly7VjX1BCj6VA', {
    waitUntil: 'load'
  });

  const scrollTimer = page.evaluate(() => {
  return new Promise((resolve, reject) => {
    let totalHeight = 0;
    const distance = 600;
    const timer = setInterval(() => {
      window.scrollBy(0, distance);
      totalHeight += distance;
      if(totalHeight >= 1000){
        clearInterval(timer);
        resolve();
      }
      // 无需全部加载

      // if(totalHeight >= document.body.scrollHeight){
      //     clearInterval(timer)
      //     resolve()
      // }
    }, 200)
  })
    
})

const crawler = scrollTimer.then(async () => {
  const urls = await page.$$eval('#js_content p>img', imgs => imgs.map(img => img.getAttribute("data-src")));
  await page.close();
  await browser.close();
  return Promise.resolve(urls);
}).catch((e) => {
  console.log(e);
})

crawler.then(urls => {
  for (let index = 0; index < 3; index++) {
    const url = urls[index];
    // 教材图片下载到res下
    download(url, path.resolve(__dirname, 'res/', `${index}.jpeg`), () => {
    });
  }
})
})();