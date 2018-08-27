const superagent = require('superagent');
require('superagent-charset')(superagent);
const cheerio = require('cheerio');
const http = require('http');
const url = require('url');
const async = require('async');
const server = http.createServer((req, res) => {
    let count = 0;
    const fetchUrl = function (offset, callback) {
        count++;
        console.log('当前并发数：', count);
        const baseUrl = 'https://www.dy2018.com/';
        superagent.get(baseUrl)
            .charset('gbk')
            .set({
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
                'Referrer': 'www.baidu.com'
            })
            .end(function (err, res) {
                if (err) return null;
                const $ = cheerio.load(res.text);
                const items = [];
                $('.co_content222 ul li').each(function (index, item) {
                    const tittle = $(this).find('a').text().replace(/[\r\n]/g, '');
                    const href = url.resolve(baseUrl, $(this).find('a').attr('href'));
                    items.push({
                        title: tittle,
                        href: href
                    });
                });
                count--;
                console.log('释放了并发数后，当前并发数：', count);
                callback(null, items);
            })
    };
    const offsets = [];
    for (let i = 0; i < 10; i++) {
        offsets.push(i * 5);
    }
    async.mapLimit(offsets, 5, function (offset, callback) {
        fetchUrl(offset, callback);
    }, function (err, result) {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf8',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(result));
    });
}).listen(9090);