// ============================================================
// Type re-exports and additional types for ProjectHub
// ============================================================

// Re-export all types from mock-data for convenience
export type {
  UserRole,
  User,
  ProjectStatus,
  ProjectType,
  ProjectLevel,
  HealthStatus,
  SmartGoals,
  Project,
  MilestoneStatus,
  Milestone,
  TaskStatus,
  TaskPriority,
  Task,
  TaskLog,
  RiskImpact,
  RiskStatus,
  Risk,
  DelayRequestStatus,
  DelayRequest,
  Draft,
  NotificationType,
  Notification,
} from "./mock-data";

// Additional types used across the app

export type Priority = "high" | "medium" | "low";

export type Impact = "critical" | "high" | "medium" | "low";

export type DependencyType = "FS" | "SS" | "FF" | "SF";

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  type: DependencyType;
}

export interface MilestoneBaseline {
  id: string;
  projectId: string;
  milestoneId: string;
  snapshotName: string;
  plannedEnd: string;
  progress?: number;
  status?: string;
  snapshotAt: string;
}

export interface SMARTGoal {
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
}
