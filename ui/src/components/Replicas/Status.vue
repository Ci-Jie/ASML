<template>
  <div class="status">
    <Card>
      <p slot="title" style="color: #ffffff">
        模型預測狀態
      </p>
      <div>
        <i-circle
          :size="180"
          :percent="percent"
          stroke-color="#ff5500"
          dashboard>
          <div class="demo">
            <p>預測準確率</p>
            <span>
              <i>{{ percent }} %</i>
            </span>
          </div>
        </i-circle>
      </div>
    </Card>
  </div>
</template>

<script>
export default {
  name: "status",
  data () {
    return {
      percent: 0
    }
  },
  props: ['data'],
  watch: {
    data () {
      let success = 0
      let count = 0
      for (let index = 0; index < this.data.length; index++ ) {
        if (this.data[index]["服務副本數量校正結果"] !== 0) {
          if (this.data[index]["服務副本數量校正結果"] === this.data[index]["服務副本數量預測結果"]) {
            success += 1
          }
          count += 1
        }
      }
      if (count !== 0) {
        this.percent = parseInt((success / count) * 100)
      } else {
        this.percent = 0
      }
    }
  }
}
</script>

<style lang="less">
.status {
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