import { defineComponent } from "vue";
import Canvas from "./canvas"
import Demo from "./workflow.json"

export default defineComponent({
    name: "Setting",
    render() {
        return <Canvas config={Demo}></Canvas>
    }
})