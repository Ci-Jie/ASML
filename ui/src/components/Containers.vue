<template>
  <div class="containers">
    <Card>
      <p slot="title" style="color: #ffffff">
        容器即時狀態
      </p>
      <div>
        <Table :columns="columns" :data="data" height="180" no-data-text="暫無數據"></Table>
      </div>
    </Card>
  </div>
</template>

<script>
export default {
  name: "containers",
  props: ['data'],
  data() {
    return {
      columns: [
        {
          title: "名稱",
          key: "containerId",
          render: (h, params) => {
            return h("div", [
              h("p", params.row.containerId.substring(0, 9))
            ])
          }
        },
        {
          title: "節點",
          key: "hostIP",
          render: (h, params) => {
            return h("div", [
              h("Tag", {
                props: {
                  color: "success"
                }
              }, params.row.hostIP)
            ])
          }
        },
        {
          title: "狀態",
          key: "running",
          render: (h, params) => {
            if (params.row.running) {
              return h("div", [
                h("Tag", {
                  props: {
                    color: "success"
                  }
                }, '運行中')
              ])
            } else {
              return h("div", [
                h("Tag", {
                  props: {
                    color: "error"
                  }
                }, '終止中')
              ])
            }
          }
        },
        {
          title: "資源狀態",
          key: "cpu",
          render: (h, params) => {
            return h("div", [
              h("Progress", {
                props: {
                  percent: parseFloat((params.row.cpuPercent).toFixed(2))
                }
              })
            ]);
          }
        }
      ]
    }
  }
};
</script>

<style lang="less">
.containers {
  margin: 10px;
  text-align: center;
}
</style>