import * as container from './modules/container'
import * as pod from './modules/pod'
import * as TANetData from './modules/TANetData'

import Koa from 'koa'
import Router from 'koa-router'

const router = Router()
const app = new Koa()
const server = require('http').createServer(app.callback())
const io = require('socket.io')(server)

import format from 'date-format'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

let res = {}

const update = async list => {
  let total = 0
  let count = 0
  if (list.containers.length === 0) {
    list.containers = await pod.list()
  } else {
    list.time += 1
    const newList = await pod.list()
    
    // 更新容器列表資訊
    for (let index in newList) {
      if (list.containers.findIndex(container => container.containerId === newList[index].containerId) === -1) {
        list.containers.push(newList[index])
        list.containers[list.containers.length - 1].time = list.time
      } else {
        const id = list.containers.findIndex(container => container.containerId == newList[index].containerId)
        list.containers[id].running = newList[index].running
        list.containers[id].time = list.time
      }
      // console.log(list.containers[index])
    }

    // 將過期失效的容器移除
    for (let index in list.containers) {
      if (list.containers[index].time !== list.time) {
        list.containers.splice(index, 1)
      }
    }

    // 更新容器狀態資訊
    list = await container.stats(list)

    // 計算當前運行容器 CPU 總使用量與容器數量(排除正在關閉的容器)
    for (let index in list.containers) {
      if (list.containers[index].cpuPercent !== '-' && list.containers[index].running === true) {
        total += list.containers[index].cpuPercent
        count += 1
      }
    }

    // 計算 CPU 總平均資源使用率
    list.avgUsage = parseFloat((total / count).toFixed(2))

    // 將結果與門檻值比較並作服務副本調整
    if (list.avgUsage > process.env.ASML_USAGE_MAX) {
      if (count < process.env.ASML_COUNT_MAX) {
        console.log('increase')
        await pod.increase(count + 1)
      }
    } else if (list.avgUsage < process.env.ASML_USAGE_MIN) {
      if (count > process.env.ASML_COUNT_MIN) {
        console.log('decrease')
        await pod.decrease(count - 1)
      }
    }
  }
  console.log(`avg_usage: ${ list.avgUsage }, number of container: ${ list.containers.length }`)
  
  // 初始化參數
  total = 0
  count = 0

  // 遞迴執行
  res = list
  await update(list)
}

io.on('connection', async socket => {
  console.log('Add client!!')
  let date = format('yyyy-MM-dd', new Date())
  setInterval(async () => {
    socket.volatile.emit('news', res)
  }, 2000)
  setInterval(async () => {
    socket.volatile.emit('userData', {
      date: date || format('yyyy-MM-dd', new Date()),
      data: await TANetData.sort(`${ date }.json`)
    })
  }, 60000)
  socket.on('updateDate', async value => {
    date = value || format('yyyy-MM-dd', new Date())
    socket.volatile.emit('userData', {
      date: date,
      data: await TANetData.sort(`${ date }.json`)
    })
  })
})

server.listen(3000, () => {
  console.log('Application is starting on port 3000.')
})

const main = async () => {
  const list = {
    avgUsage: 0,
    time: 0,
    containers: []
  }
  await update(list)
}

main()