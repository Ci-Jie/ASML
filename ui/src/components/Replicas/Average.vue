<template>
  <div class="average">
    <Card>
      <p slot="title" style="color: #ffffff">
        服務副本使用狀態
      </p>
      <div>
        <i-circle
          :size="180"
          :percent="percent"
          stroke-color="#ff5500"
          dashboard>
          <div class="demo">
            <p>平均服務副本使用量</p>
            <span>
              <i>{{ count }} 個/分鐘</i>
            </span>
          </div>
        </i-circle>
      </div>
    </Card>
  </div>
</template>

<script>
export default {
  name: "average",
  data () {
    return {
      percent: 0,
      count: 0,
      replicas: 0,
      index: 0
    }
  },
  props: ['data'],
  watch: {
    data () {
      let count = 0
      let replicas = 0
      for (let index = 0; index < this.data.length; index++ ) {
        if (this.data[index]["服務副本數量校正結果"] !== 0) {
          count += 1
          replicas += this.data[index]["服務副本數量校正結果"]
        } else {
          break
        }
      }
      if (count !== 0) {
        this.percent = parseInt((replicas / count) * 10)
        this.count = parseFloat(replicas / count).toFixed(2)
      } else {
        this.count = 0
        this.percent = 0
      }
    }
  }
}
</script>

<style lang="less">
.average {
  margin: 10px;
  text-align: center;
}

.demo {
  & h1{
    color: #3f414d;
    font-size: 28px;
    font-weight: normal;
  }
  & p{
    color: #657180;
    font-size: 14px;
    margin: 10px 0 15px;
  }
  & span{
    display: block;
    padding-top: 15px;
    color: #657180;
    font-size: 14px;
    &:before{
      content: '';
      display: block;
      width: 50px;
      height: 1px;
      margin: 0 auto;
      background: #e0e3e6;
      position: relative;
      top: -15px;
    };
  }
  & span i{
    font-style: normal;
    color: #3f414d;
  }
}
</style>