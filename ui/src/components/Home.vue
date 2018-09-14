<template>
  <div class="home">
    <i-row>
      <i-col span="6">
        <Replicas :data="userData.data" />
      </i-col>
      <i-col span="6">
        <CPU :data="status.cpu" />
      </i-col>
      <i-col span="12">
        <Containers :data="status.containers" />
      </i-col>
    </i-row>
    <i-row>
      <i-col span="6">
        <Request :data="userData.data" />
        <Average :data="userData.data" />
      </i-col>
      <i-col span="18">
        <Chart @updateDate="updateDate" :data="userData.data" :date="userData.date"/>
      </i-col>
    </i-row>
  </div>
</template>

<script>
import CPU from '@/components/CPU'
import Replicas from '@/components/Replicas/Status'
import Containers from '@/components/Containers'
import Chart from '@/components/Chart'
import Request from '@/components/Request'
import Average from '@/components/Replicas/Average'

export default {
  name: 'home',
  data () {
    return {
      status: {
        cpu: 0,
        count: 0,
        containers: []
      },
      userData: {
        date: '',
        data: []
      }
    }
  },
  sockets: {
    connect () {
      this.isConnected = true
    },
    news (msg) {
      this.status = {
        cpu: parseFloat(msg.avgUsage),
        count: msg.containers.length,
        containers: msg.containers
      }
    },
    userData (userData) {
      this.userData.date = userData.date
      this.userData.data = userData.data
    }
  },
  mounted () {
    this.$socket.emit('updateDate', this.userData.date)
  },
  methods: {
    updateDate (date) {
      this.date = date
      this.$socket.emit('updateDate', date)
    }
  },
  components: {
    Average,
    Containers,
    CPU,
    Chart,
    Replicas,
    Request
  }
}
</script>

<style>
.ivu-card-body {
  height: 200px;
}

.ivu-card-head {
  background-color: #6c7e97;
}
</style>
