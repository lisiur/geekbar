import { onBeforeMount, onBeforeUnmount } from "vue"

interface LifetimeListener {
    (): Promise<(() => void)> | (() => void)
}

export function registerLifetimeListener(listener: LifetimeListener) {
    onBeforeMount(() => {
        const unListenPromise = listener()
        onBeforeUnmount(() => {
            if ('then' in unListenPromise) {
                unListenPromise.then(unListen => unListen())
            } else {
                unListenPromise()
            }
        })
    })
}