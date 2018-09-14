<template>
  <div class="chart">
    <Card>
      <p slot="title" style="color: #ffffff">
        使用者流量數據 ({{ date }})
      </p>
      <DatePicker 
        class="date"
        slot="extra"
        type="date"
        placeholder="選擇日期"
        placement="bottom-end"
        size="small"
        @on-change="change">
      </DatePicker>
      <div>
        <ve-line :data="chartData" :settings="chartSettings"></ve-line>
      </div>
    </Card>
  </div>
</template>

<script>
export default {
  name: "chart",
  props: ["data", "date"],
  data() {
    this.chartSettings = {
      axisSite: { right: ["服務副本數量預測結果", "服務副本數量校正結果"] },
      yAxisType: ["normal", "normal"],
      yAxisName: ["請求數量", "服務副本數量"]
    }
    return {
      chartData: {
        columns: ["日期", "原始數據", "服務副本數量預測結果", "服務副本數量校正結果"],
        rows: []
      }
    }
  },
  watch: {
    data () {
      this.chartData.rows = this.data
    }
  },
  methods: {
    change(date) {
      this.date = date;
      this.$emit("updateDate", date)
    }
  }
};
</script>

<style lang="less">
.chart {
  margin: 10px;
  text-align: center;
}

.chart .ivu-card-body {
  height: 465px;
}
</style>