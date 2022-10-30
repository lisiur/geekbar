import { ConfigSchema } from "./schemas";
import Demo from "./workflow.json";

export async function getAllWorkflows(): Promise<Array<ConfigSchema>> {
  return [Demo];
}

export async function saveWorkflow() {}

export async function createWorkflow() {}
