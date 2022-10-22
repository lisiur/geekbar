import { defineComponent } from 'vue';
import { useConfigProvider } from './hooks/configProvider'
import { NConfigProvider } from 'naive-ui'
import { RouterView } from 'vue-router'

const { config } = useConfigProvider()

export default defineComponent({
  render() {
    return <NConfigProvider
      {...config.value}
    >
      <RouterView></RouterView>
    </NConfigProvider>
  }
})
