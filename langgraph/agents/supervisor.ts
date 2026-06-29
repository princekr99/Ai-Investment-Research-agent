import { AgentStateType } from "../state";

export async function supervisorAgentNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  console.log(`[Supervisor] Current state check. Completed analysis: ${state.ticker || "N/A"}. Active node pointer: ${state.nextAgent}`);
  
  // The supervisor can log execution telemetry or perform sanity checks on the state.
  // It acts as the gateway before forwarding to individual agents.
  return {
    // Keep the next agent pointer as is, unless it's empty, in which case default to research
    nextAgent: state.nextAgent || "research"
  };
}
