const express = require('express')
const https = require('https')
const cheerio = require('cheerio')

const app = express()
const request = https.request
const cheerioHandler = html => {
    let els = cheerio(html).find('table.table-striped').find('tr')
    let data = []
    for (let i = 0; i < els.length; i++) {
        let item = els.eq(i)
        let title = item.find('.views-field-title h2').text().trim()
        data.push({
            title,
            img: item.find('img').eq(0).attr('src'),
            start: item.find('.date-display-start').attr('content'),
            end: item.find('.date-display-end').attr('content'),
            detail: item.text().trim().replace(title, ''),
            href: 'https://www.vatsim.net' + item.find('a').eq(0).attr('href')
        })
    }
    return data
}
const htmlParser = response => {
    console.log(`resposne statusCode : ${response.statusCode}`)
    return new Promise(resolve => {
        let html = ''
        response.on('data', chunck => html += chunck)
        response.on('end', end => {
            resolve(cheerioHandler(html))
        })
    })
}

app.get('/api/events', (req, res) => {
    const xhr = request('https://www.vatsim.net/events', response => htmlParser(response).then(data => {
        res.json(data)
    }))
    xhr.end()
    xhr.on('error', console.error)
})

app.listen(8200, listen => console.log(`server is listening on 8200 `))
