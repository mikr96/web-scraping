const cheerio = require("cheerio")
const request = require("request")
const split = require("string-split-by")
const fs = require('fs')
const async = require('async');
const writeStream = fs.createWriteStream('test.csv')


//Write Headers
writeStream.write(`Title,Date,Soalan,Jawapan \n`)

	var base_url = []
	for (let i=0; i<52; i++) {
		var num = (i+1)*25
		base_url.push(`http://muftiwp.gov.my/en/artikel/al-kafi-li-al-fatawi?start=${num}`)
	}

		// async.eachSeries(
		// 	base_url, (q, next) => {
				request(base_url[0], (err, resp, html) => {
					if(!err && resp.statusCode == 200) {
						const $ = cheerio.load(html)
						$('tr').each((e, f) => {
							const date = $(f).find('td:nth-child(2)').text()
							const title = $(f).find('td:first-child>a').text()
							const link = $(f).find('td:first-child>a').attr('href')
							request(`http://muftiwp.gov.my/en/artikel/${link}`, (err, resp, html) => {
								if(!err && resp.statusCode == 200) {
									const options = { encoding: 'utf8' };
									const $ = cheerio.load(html)
									const content = $('div[itemprop="articleBody"]')
									const text = content.find('p').text()
			
									var arr = ['Jawapan:','JAWAPAN:','JAWAPAN','Jawapan','Answer:']
									var i = 0
									do {
										var [soalan, jawapan] = split(text, arr[i])
										i = i + 1
										if(i==5) 
											break;
									} while (jawapan === undefined)
									
									if (i!=5) {
										soalan = soalan.replace(/,/g, '')
										jawapan = jawapan.replace(/,/g, '')
										writeStream.write(`${title},${date},${soalan},${jawapan} \n`, options)
									}
								}
							})
						})
					}
				// next();
				})
			// })




//const res = num.map(e => extractPage(`http://muftiwp.gov.my/en/artikel/al-kafi-li-al-fatawi?start=${e}`))
