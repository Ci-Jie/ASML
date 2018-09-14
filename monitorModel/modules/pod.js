import axios from '../../node_modules/axios'

require('dotenv').config()

const list = () => {
  return new Promise(resolve => {
    let list = []
    axios.get(`https://${ process.env.K8S_MASTER_IP }:6443/api/v1/namespaces/s3-portal/pods`, {
        headers: {
          'Authorization': `Bearer ${ process.env.K8S_TOKEN }`,
          'Content-Type': 'application/yaml'
        }
      })
      .then(response => {
        const containers = response.data.items
        for (let index in containers) {
          if (containers[index].spec.containers[0].image === process.env.ASML_MONITOR_IMAGE && containers[index].status.phase === 'Running') {
            list.push({
              containerId: (containers[index].status.containerStatuses[0].containerID).split('//')[1],
              hostIP: containers[index].status.hostIP,
              cpuDelta: {
                last: '-',
                next: '-'
              },
              systemDelta: {
                last: '-',
                next: '-'
              },
              cpuPercent: '-',
              time: 0,
              running: !(containers[index].metadata.hasOwnProperty('deletionTimestamp'))
            })
          }
        }
        resolve(list)
      })
  })
}

const get = () => {
  return new Promise(resolve => {
    axios.get(`https://${ process.env.K8S_MASTER_IP }:6443/apis/extensions/v1beta1/namespaces/s3-portal/deployments/api-deploy/scale`, {
        headers: {
          'Authorization': `Bearer ${ process.env.K8S_TOKEN }`,
          'Content-Type': 'application/yaml'
        }
      })
      .then(response => {
        resolve(response)
      })
      .catch(err => {
        resolve(false)
      })
  })
}

const increase = async (count) => {
  let obj = (await get()).data
  return new Promise(resolve => {
    obj.spec.replicas = count
    axios.put(`https://${ process.env.K8S_MASTER_IP }:6443/apis/extensions/v1beta1/namespaces/s3-portal/deployments/api-deploy/scale`, obj, {
        headers: {
          'Authorization': `Bearer ${ process.env.K8S_TOKEN }`,
          'Content-Type': 'application/yaml'
        }
      })
      .then(response => {
        resolve(true)
      })
      .catch(err => {
        resolve(false)
      })
  })
}

const decrease = async (count) => {
  let obj = (await get()).data
  return new Promise(resolve => {
    obj.spec.replicas = count
    axios.put(`https://${ process.env.K8S_MASTER_IP }:6443/apis/extensions/v1beta1/namespaces/s3-portal/deployments/api-deploy/scale`, obj, {
        headers: {
          'Authorization': `Bearer ${ process.env.K8S_TOKEN }`,
          'Content-Type': 'application/yaml'
        }
      })
      .then(response => {
        resolve(true)
      })
      .catch(err => {
        resolve(false)
      })
  })
}

export {
  list,
  increase,
  decrease
}