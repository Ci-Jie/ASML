import sortBy from '../../node_modules/sort-by'
import fs from 'fs'

require('dotenv').config()

const read = date => {
  return JSON.parse(fs.readFileSync(`${ process.env.TANET_OUTPUT_PATH }${ date }`, 'utf8'))
}

const sort = async date => {
  let result = []
  const userData = await read(date).sort(sortBy('time'))
  for (let index = 0; index < userData.length; index++) {
    result.push({
      '日期': userData[index].time,
      '原始數據': parseInt(userData[index].request.count),
      '請求錯誤次數': parseInt(userData[index].request.error),
      '服務副本數量預測結果': parseInt(userData[index].replicas.prediction),
      '服務副本數量校正結果': parseInt(userData[index].replicas.count)
    })
  }
  return result
}

export {
  sort
}