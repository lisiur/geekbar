import { computed, defineComponent, PropType } from "vue";
import { ListFormItemSchema as ListFormItemSchema } from "../../schemas";
import Form from '..'
import { NButton, NIcon } from 'naive-ui'
import { TrashAltRegular as TrashIcon } from '@vicons/fa'


const props = {
    value: {
        type: Object as PropType<Array<Record<string, any>>>
    },
    schema: {
        type: Object as PropType<ListFormItemSchema>
    }
}

export default defineComponent({
    name: "ListFormItem",
    props,
    setup(props, { emit }) {
        const max = props.schema?.max ?? Infinity
        const min = props.schema?.min ?? 0
        const addHandler = () => {
            props.value?.push({})
        }
        const removeHandler = (index: number) => {
            props.value?.splice(index, 1)
        }
        const showRemoveIcon = props.value!.length > min
        const showAddButton = props.value!.length < max

        const forms = new Map<string, any>()

        function validate() {
            const visibleForms = [...forms.values()].filter(it => it !== null)
            return Promise.all((visibleForms as any).map((form: any) => form.validate()))
        }

        function registerForm(key: string, form: any) {
            forms.set(key, form)
        }

        return {
            forms,
            registerForm,
            max,
            min,
            addHandler,
            removeHandler,
            showRemoveIcon,
            showAddButton,
        };
    },
    methods: {
    },
    mounted() {
        this.$emit('mounted', this)
    },
    beforeUnmount() {
        this.$emit('unmounted', this)
    },
    render() {
        const styles = {
            width: '100%',
            border: '1px solid #eee',
            borderRadius: '.5rem',
            padding: '.5rem',
            marginBottom: '.5rem',
        }
        const items = this.$props.value!.map((item: any, index: number) => {
            const key = Math.random().toString()
            return <div class="relative" key={key}>
                {
                    this.showRemoveIcon ?
                        <div
                            class="absolute top-4 right-[-1.2rem] cursor-pointer"
                            onClick={() => this.removeHandler(index)}
                        >
                            <NIcon color="darkred">
                                <TrashIcon></TrashIcon>
                            </NIcon>
                        </div>
                        : null
                }
                <Form
                    ref={(el: any) => { this.registerForm(key, el) }}
                    class="w-full border rounded-md p-2 mt-2"
                    model={item}
                    schema={this.$props.schema?.items}
                ></Form>
            </div>
        })
        return <div class="w-full"> 
            {items}
            {
                this.showAddButton ?
                    <NButton
                        dashed
                        class="mt-2 w-full"
                        onClick={this.addHandler}
                    >Add</NButton>
                    : null
            }
        </div>
    },
});

