<template>
  <div class="cpu">
    <Card>
      <p slot="title" style="color: #ffffff">
        CPU 即時監控
      </p>
      <div>
        <i-circle
          :size="180"
          :percent="percent"
          dashboard>
          <div class="demo">
            <p>CPU 平均資源使用率</p>
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
  name: "cpu",
  props: ['data'],
  data () {
    return {
      percent: 0
    }
  },
  watch: {
    data () {
      this.percent = parseFloat(this.data)
    }
  }
}
</script>

<style lang="less">
.cpu {
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
