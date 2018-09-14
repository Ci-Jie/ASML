<template>
  <div class="request">
    <Card>
      <p slot="title" style="color: #ffffff">
        使用者請求狀態
      </p>
      <div>
        <i-circle
          :size="180"
          :percent="percentInt"
          stroke-color="#ff5500"
          dashboard>
          <div class="demo">
            <p>使用者請求失敗率</p>
            <span>
              <i>{{ percent }}%</i>
            </span>
          </div>
        </i-circle>
      </div>
    </Card>
  </div>
</template>

<script>
export default {
  name: "request",
  props: ['data'],
  data () {
    return {
      percent: 0,
      percentInt: 0,
      origin: 0,
      error: 0
    }
  },
  watch: {
    data () {
      let origin = 0
      let error = 0
      for (let index in this.data) {
        if (this.data[index]["服務副本數量校正結果"] !== 0) {
          origin += this.data[index]["原始數據"]
          error += this.data[index]["請求錯誤次數"]
        } else {
          break
        }
      }
      this.origin = origin
      this.error = error
      if (this.origin !== 0) {
        this.percent = (parseFloat(this.error / this.origin) * 100).toFixed(2)
        this.percentInt = parseInt((parseFloat(this.error / this.origin) * 100).toFixed(2))
      } else {
        this.percent = 0
      }
    }
  }
}
</script>

<style lang="less">
.request {
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
