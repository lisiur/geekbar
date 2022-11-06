import { invoke } from "@tauri-apps/api";
import { ConfigSchema } from "./schemas";

export async function getAllWorkflows(): Promise<Array<ConfigSchema>> {
  return invoke<string[]>("fetch_all_workflows").then((workflows) => {
    return workflows.map(json => JSON.parse(json))
  })
}

export async function saveWorkflow(workflow: ConfigSchema) {
  return invoke("save_workflow", {
    workflowJson: JSON.stringify(workflow)
  })
}

export async function createWorkflow(workflowName: string) {
  return invoke<string>("create_workflow", {
    workflowName,
  }).then(workflow_json => {
    return JSON.parse(workflow_json) as ConfigSchema
  })
}

export async function deleteWorkflow(workflowId: string) {
  return invoke<string>("delete_workflow", {
    workflowId,
  })
}
