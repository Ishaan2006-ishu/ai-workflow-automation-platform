import {
  AiFlowNode,
  ConditionFlowNode,
  NotificationFlowNode,
  StartFlowNode,
} from './CustomNodes';

export const nodeTypes = {
  start: StartFlowNode,
  ai: AiFlowNode,
  condition: ConditionFlowNode,
  notification: NotificationFlowNode,
};