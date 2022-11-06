import { defineComponent, onMounted } from 'vue';
import { useConfigProvider } from './hooks/configProvider'
import { NConfigProvider } from 'naive-ui'
import { RouterView } from 'vue-router'
import { event } from '@tauri-apps/api';

const { config } = useConfigProvider()

export default defineComponent({
  setup() {
    onMounted(() => {
      event.emit("hide_splashscreen")
    })
  },
  render() {
    return <NConfigProvider
      {...config.value}
    >
      <RouterView></RouterView>
    </NConfigProvider>
  }
})
