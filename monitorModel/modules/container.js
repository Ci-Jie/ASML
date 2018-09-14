import axios from '../../node_modules/axios'

// 取得容器列表中各容器當前 CPU 資源使用率
const stats = async list => {
  for (let index in list.containers) {
    await axios.get(`http://${ list.containers[index].hostIP }:5555/containers/${ list.containers[index].containerId }/stats?stream=false`)
      .then(response => {
        if (list.containers[index].cpuDelta.last === '-') {
          list.containers[index].cpuDelta.last = response.data.cpu_stats.cpu_usage.total_usage
          list.containers[index].systemDelta.last = response.data.cpu_stats.system_cpu_usage
        } else {
          list.containers[index].cpuDelta.next = response.data.cpu_stats.cpu_usage.total_usage
          list.containers[index].systemDelta.next = response.data.cpu_stats.system_cpu_usage
          const cpuDelta = list.containers[index].cpuDelta.next - list.containers[index].cpuDelta.last
          const systemDelta = list.containers[index].systemDelta.next - list.containers[index].systemDelta.last
          const cpuPercent = (cpuDelta / systemDelta) * response.data.cpu_stats.cpu_usage.percpu_usage.length * 100
          list.containers[index].cpuPercent = cpuPercent
          list.containers[index].cpuDelta.last = list.containers[index].cpuDelta.next
          list.containers[index].systemDelta.last = list.containers[index].systemDelta.next
        }
      })
      .catch(error => {
        // nothing to do
      })
  }
  return list
}

export {
  stats
}