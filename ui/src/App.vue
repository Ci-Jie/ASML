<template>
  <div id="app">
    <Layout>
      <Header>
        <Title />
      </Header>
      <Content>
        <Home />
      </Content>
    </Layout>
  </div>
</template>

<script>
import Title from '@/components/Title.vue'
import Home from '@/components/Home.vue'

export default {
  name: 'app',
  components: {
    Title,
    Home
  }
}
</script>