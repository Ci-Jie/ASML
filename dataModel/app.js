// 引入開發相關套件
import fs from 'fs'
import download from '../node_modules/download'
import request from '../node_modules/request'
import jsonFormat from '../node_modules/json-format'
import yyyymmdd from '../node_modules/yyyy-mm-dd'
import { load } from '../node_modules/cheerio'
import { fromPath } from '../node_modules/fast-csv'
import { mkdir } from '../node_modules/shelljs'

require('dotenv').config()

// 定義資料處理完成並匯出的檔案名稱，採用系統時間作為命名規則，例如: 2018-09-08.json
const outputName = `${ yyyymmdd() }.json`

// 由 TANet 下載當前使用者流量檔案儲存於配置下載暫存檔的目錄
const downloadURL = () => {
  return new Promise(resolve => {
    request(process.env.TANET_URL, (err, res, body) => {
      const $ = load(body)
      $('#content div table a').each((index, element) => {
        if (index === 1) {
          download(`http://cacti.tanet.edu.tw/${ $(element).attr('href').split('\n') }`, process.env.TANET_DOWNLOAD_PATH, {
            filename: 'data.csv'
          }).then(() => {
            resolve(true)
          })
        }
      })
    })
  })
}

// 將已下載的使用者流量資料做資料前處理，並匯出指定格式
const proccess = () => {
  let array = []
  fromPath(`${ process.env.TANET_DOWNLOAD_PATH }/data.csv`)
    .on('data', data => {
      if (data[2] !== undefined && data[2] !== 'col2-cdefa') {
        array.push({
          time: parseInt((data[0].split(' ')[1]).split(':')[0]) * 60 + parseInt((data[0].split(' ')[1]).split(':')[1]),
          request: {
            count: parseInt(parseFloat(data[1]) / 10000000) * 3,
            error: 0
          },
          replicas: {
            count: 0,
            prediction: 0
          }
        })
      }
    })
    .on('end', async () => {
      if (!(await fs.existsSync(`${ process.env.TANET_OUTPUT_PATH }${ outputName }`))) {
        mkdir(`${ process.env.TANET_OUTPUT_PATH }`)
        save(array)
      } else {
        save(await update(array))
      }
    })
}

// JSON 檔案格式化並寫入檔案
const save = async data => {
  await fs.writeFileSync(`${ process.env.TANET_OUTPUT_PATH }${ outputName }`, jsonFormat(data, {
    type: 'space',
    size: 2
  }))
}

// 更新原先檔案內容，將其讀取後新增新資料至陣列後方
const update = async data => {
  let jsonData = JSON.parse(await fs.readFileSync(`${ process.env.TANET_OUTPUT_PATH  }${ outputName }`, 'utf8'))
  const count = jsonData.length - (data[0].time - jsonData[0].time)
  for (let index = count; index < data.length; index++) {
    jsonData.push(data[index])
  }
  return jsonData
}

// 程式進入點
const main = async () => {
  await downloadURL()
  await proccess()
}

main()