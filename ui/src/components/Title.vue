<template>
  <div class="title">
    {{ title }}
  </div>
</template>

<script>
export default {
  name: 'title',
  data() {
    return {
      title: '基於深度學習技術之服務自動擴展機制(ASML)'
    }
  }
}
</script>

<style>
.title {
  background-color: #4e5a6e;
  line-height: 60px;
  font-size: 24px;
  color: #ffffff;
  padding-left: 20px;
}
</style>
