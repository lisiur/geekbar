import { clipboardConfigSchema } from './nodeSchemas/clipboard'
import { listFilterConfigSchema } from './nodeSchemas/listFilter'
import { notifyConfigSchema } from './nodeSchemas/notify'
import { openUrlConfigSchema } from './nodeSchemas/openUrl'
import { triggerConfigSchema } from './nodeSchemas/trigger'
export * from './types'

export const schemas = {
    [clipboardConfigSchema.type]: clipboardConfigSchema.config,
    [listFilterConfigSchema.type]: listFilterConfigSchema.config,
    [notifyConfigSchema.type]: notifyConfigSchema.config,
    [triggerConfigSchema.type]: triggerConfigSchema.config,
    [openUrlConfigSchema.type]: openUrlConfigSchema.config,
}