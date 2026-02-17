// ============================================================
// Mock Data for ProjectHub - 專案看板系統
// ============================================================

// --- Types ---

export type UserRole = "PM" | "Member" | "Executive";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
  department: string;
  avatar: string | null;
}

export type ProjectStatus = "planning" | "in_progress" | "on_hold" | "completed" | "cancelled";
export type ProjectType = "internal" | "external" | "research";
export type ProjectLevel = "high" | "medium" | "low";
export type HealthStatus = "green" | "yellow" | "red";

export interface SmartGoals {
  S: string;
  M: string;
  A: string;
  R: string;
  T: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  type: ProjectType;
  level: ProjectLevel;
  status: ProjectStatus;
  healthStatus: HealthStatus;
  startDate: string;
  endDate: string;
  budget: number;
  budgetUsed: number;
  ownerId: string;
  smartGoals: SmartGoals;
  description: string;
}

export type MilestoneStatus = "pending" | "in_progress" | "completed" | "overdue";

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
  status: MilestoneStatus;
  progress: number;
}

export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "blocked";
export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: string;
  milestoneId: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  startDate: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
}

export interface TaskLog {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  detail: string;
  timestamp: string;
}

export type RiskImpact = "critical" | "high" | "medium" | "low";
export type RiskStatus = "open" | "mitigating" | "resolved" | "accepted";

export interface Risk {
  id: string;
  projectId: string;
  title: string;
  description: string;
  impact: RiskImpact;
  probability: number;
  status: RiskStatus;
  mitigation: string;
  ownerId: string;
  createdAt: string;
}

export type DelayRequestStatus = "pending" | "approved" | "rejected";

export interface DelayRequest {
  id: string;
  taskId: string;
  projectId: string;
  requesterId: string;
  reason: string;
  originalDueDate: string;
  requestedDueDate: string;
  status: DelayRequestStatus;
  reviewerId: string | null;
  reviewComment: string | null;
  createdAt: string;
}

export interface Draft {
  id: string;
  projectId: string | null;
  title: string;
  content: string;
  authorId: string;
  updatedAt: string;
}

export type NotificationType = "info" | "warning" | "success" | "error";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link: string | null;
}

// --- Mock Users ---

export const mockUsers: User[] = [
  { id: "u1", email: "pm@demo.com", name: "王專案", role: "PM", password: "demo", department: "專案管理部", avatar: null },
  { id: "u2", email: "member1@demo.com", name: "李成員", role: "Member", password: "demo", department: "研發部", avatar: null },
  { id: "u3", email: "member2@demo.com", name: "張成員", role: "Member", password: "demo", department: "設計部", avatar: null },
  { id: "u4", email: "exec@demo.com", name: "陳主管", role: "Executive", password: "demo", department: "管理部", avatar: null },
];

// --- Mock Projects ---

export const mockProjects: Project[] = [
  {
    id: "p1",
    name: "電商平台改版專案",
    code: "EC-2026",
    type: "internal",
    level: "high",
    status: "in_progress",
    healthStatus: "green",
    startDate: "2026-01-15",
    endDate: "2026-06-30",
    budget: 2000000,
    budgetUsed: 750000,
    ownerId: "u1",
    smartGoals: {
      S: "完成電商平台前台與後台全面改版",
      M: "轉換率提升 30%，頁面載入時間降低至 2 秒以內",
      A: "團隊已有電商開發經驗，技術棧成熟",
      R: "配合公司數位轉型策略，提升線上銷售業績",
      T: "2026 年 6 月 30 日前完成並上線",
    },
    description: "針對現有電商平台進行全面 UI/UX 改版，提升使用者體驗與轉換率。",
  },
  {
    id: "p2",
    name: "客戶管理系統建置",
    code: "CRM-2026",
    type: "internal",
    level: "high",
    status: "in_progress",
    healthStatus: "yellow",
    startDate: "2026-02-01",
    endDate: "2026-05-31",
    budget: 1500000,
    budgetUsed: 680000,
    ownerId: "u1",
    smartGoals: {
      S: "建置完整 CRM 系統，含客戶資料管理、銷售漏斗、報表分析",
      M: "客戶跟進效率提升 50%，銷售週期縮短 20%",
      A: "已完成技術評估，團隊配置到位",
      R: "解決業務部門客戶管理痛點，提高成交率",
      T: "2026 年 5 月 31 日前完成 MVP 並試運行",
    },
    description: "建置企業級客戶關係管理系統，整合銷售流程與客戶數據。",
  },
  {
    id: "p3",
    name: "行動 App 開發專案",
    code: "APP-2026",
    type: "external",
    level: "medium",
    status: "planning",
    healthStatus: "green",
    startDate: "2026-03-01",
    endDate: "2026-06-15",
    budget: 1200000,
    budgetUsed: 120000,
    ownerId: "u1",
    smartGoals: {
      S: "開發 iOS 與 Android 原生行動應用程式",
      M: "上線首月下載量達 10,000 次",
      A: "外部合作團隊具備 React Native 經驗",
      R: "拓展行動端用戶群，增加品牌觸及率",
      T: "2026 年 6 月 15 日前上架各平台商店",
    },
    description: "為公司產品開發跨平台行動應用程式，支援 iOS 與 Android。",
  },
  {
    id: "p4",
    name: "AI 智能客服研究",
    code: "AI-2026",
    type: "research",
    level: "low",
    status: "in_progress",
    healthStatus: "red",
    startDate: "2026-01-10",
    endDate: "2026-04-30",
    budget: 800000,
    budgetUsed: 620000,
    ownerId: "u1",
    smartGoals: {
      S: "研究並驗證 AI 智能客服技術方案可行性",
      M: "自動回覆準確率達 85% 以上",
      A: "已取得 GPT API 存取權限，資料集準備中",
      R: "降低客服人力成本 40%，提升回覆速度",
      T: "2026 年 4 月 30 日前完成 POC 驗證",
    },
    description: "運用大型語言模型技術，研發智能客服系統的概念驗證。",
  },
  {
    id: "p5",
    name: "內部知識庫平台",
    code: "KB-2026",
    type: "internal",
    level: "medium",
    status: "completed",
    healthStatus: "green",
    startDate: "2026-01-05",
    endDate: "2026-03-15",
    budget: 500000,
    budgetUsed: 480000,
    ownerId: "u1",
    smartGoals: {
      S: "建立公司內部知識管理平台",
      M: "知識文件集中率達 90%，搜尋命中率達 80%",
      A: "使用開源方案 + 自訂開發",
      R: "減少知識流失風險，加速新人上手",
      T: "2026 年 3 月 15 日前全面上線",
    },
    description: "建立統一的內部知識庫平台，整合各部門文件與知識資產。",
  },
];

// --- Mock Milestones ---

export const mockMilestones: Milestone[] = [
  // Project 1 - 電商平台改版
  { id: "m1", projectId: "p1", name: "需求分析與設計", description: "完成需求訪談、UI/UX 設計稿", startDate: "2026-01-15", dueDate: "2026-02-28", status: "completed", progress: 100 },
  { id: "m2", projectId: "p1", name: "前端開發", description: "完成所有前台頁面開發", startDate: "2026-03-01", dueDate: "2026-04-30", status: "in_progress", progress: 45 },
  { id: "m3", projectId: "p1", name: "後端 API 開發", description: "完成 API 設計與開發", startDate: "2026-03-15", dueDate: "2026-05-15", status: "in_progress", progress: 30 },

  // Project 2 - CRM
  { id: "m4", projectId: "p2", name: "資料庫設計", description: "完成 ERD 與資料庫建置", startDate: "2026-02-01", dueDate: "2026-02-28", status: "completed", progress: 100 },
  { id: "m5", projectId: "p2", name: "核心模組開發", description: "客戶管理、銷售漏斗模組", startDate: "2026-03-01", dueDate: "2026-04-15", status: "in_progress", progress: 60 },
  { id: "m6", projectId: "p2", name: "報表與分析", description: "銷售報表、客戶分析儀表板", startDate: "2026-04-01", dueDate: "2026-05-15", status: "pending", progress: 0 },

  // Project 3 - App
  { id: "m7", projectId: "p3", name: "原型設計", description: "完成 App 原型與互動設計", startDate: "2026-03-01", dueDate: "2026-03-31", status: "in_progress", progress: 20 },
  { id: "m8", projectId: "p3", name: "前端開發", description: "React Native 頁面開發", startDate: "2026-04-01", dueDate: "2026-05-31", status: "pending", progress: 0 },

  // Project 4 - AI
  { id: "m9", projectId: "p4", name: "資料收集與標註", description: "收集客服對話資料並標註", startDate: "2026-01-10", dueDate: "2026-02-15", status: "completed", progress: 100 },
  { id: "m10", projectId: "p4", name: "模型訓練與調優", description: "Fine-tune 語言模型", startDate: "2026-02-16", dueDate: "2026-03-31", status: "overdue", progress: 70 },
  { id: "m11", projectId: "p4", name: "POC 驗證", description: "概念驗證與效果評估", startDate: "2026-04-01", dueDate: "2026-04-30", status: "pending", progress: 0 },

  // Project 5 - 知識庫
  { id: "m12", projectId: "p5", name: "平台搭建", description: "系統架構與基礎建設", startDate: "2026-01-05", dueDate: "2026-01-31", status: "completed", progress: 100 },
  { id: "m13", projectId: "p5", name: "內容遷移", description: "將現有文件遷移至新平台", startDate: "2026-02-01", dueDate: "2026-02-28", status: "completed", progress: 100 },
  { id: "m14", projectId: "p5", name: "上線與推廣", description: "全面上線並培訓員工使用", startDate: "2026-03-01", dueDate: "2026-03-15", status: "completed", progress: 100 },
];

// --- Mock Tasks ---

export const mockTasks: Task[] = [
  // Milestone 1 - 需求分析與設計 (P1)
  { id: "t1", milestoneId: "m1", projectId: "p1", title: "用戶訪談與需求收集", description: "進行 10 場用戶訪談", status: "done", priority: "high", assigneeId: "u1", startDate: "2026-01-15", dueDate: "2026-01-31", estimatedHours: 40, actualHours: 38 },
  { id: "t2", milestoneId: "m1", projectId: "p1", title: "UI 設計稿製作", description: "完成首頁與商品頁設計", status: "done", priority: "high", assigneeId: "u3", startDate: "2026-02-01", dueDate: "2026-02-15", estimatedHours: 60, actualHours: 55 },
  { id: "t3", milestoneId: "m1", projectId: "p1", title: "設計審查與修改", description: "與各 stakeholder 審查設計", status: "done", priority: "medium", assigneeId: "u3", startDate: "2026-02-16", dueDate: "2026-02-28", estimatedHours: 20, actualHours: 25 },

  // Milestone 2 - 前端開發 (P1)
  { id: "t4", milestoneId: "m2", projectId: "p1", title: "首頁元件開發", description: "Banner、推薦商品、分類導覽", status: "done", priority: "high", assigneeId: "u2", startDate: "2026-03-01", dueDate: "2026-03-15", estimatedHours: 40, actualHours: 42 },
  { id: "t5", milestoneId: "m2", projectId: "p1", title: "商品列表頁開發", description: "篩選、排序、分頁功能", status: "in_progress", priority: "high", assigneeId: "u2", startDate: "2026-03-16", dueDate: "2026-03-31", estimatedHours: 35, actualHours: 20 },
  { id: "t6", milestoneId: "m2", projectId: "p1", title: "商品詳情頁開發", description: "商品資訊、圖片輪播、規格選擇", status: "todo", priority: "medium", assigneeId: "u2", startDate: "2026-04-01", dueDate: "2026-04-15", estimatedHours: 30, actualHours: 0 },
  { id: "t7", milestoneId: "m2", projectId: "p1", title: "購物車與結帳流程", description: "購物車 CRUD、結帳頁面", status: "todo", priority: "high", assigneeId: "u2", startDate: "2026-04-16", dueDate: "2026-04-30", estimatedHours: 45, actualHours: 0 },

  // Milestone 3 - 後端 API (P1)
  { id: "t8", milestoneId: "m3", projectId: "p1", title: "API 架構設計", description: "RESTful API 規格文件", status: "done", priority: "high", assigneeId: "u2", startDate: "2026-03-15", dueDate: "2026-03-22", estimatedHours: 16, actualHours: 14 },
  { id: "t9", milestoneId: "m3", projectId: "p1", title: "商品 API 開發", description: "CRUD + 搜尋 + 分頁", status: "in_progress", priority: "high", assigneeId: "u2", startDate: "2026-03-23", dueDate: "2026-04-10", estimatedHours: 30, actualHours: 15 },
  { id: "t10", milestoneId: "m3", projectId: "p1", title: "訂單 API 開發", description: "建立訂單、付款、出貨流程", status: "todo", priority: "medium", assigneeId: "u2", startDate: "2026-04-11", dueDate: "2026-05-01", estimatedHours: 40, actualHours: 0 },

  // Milestone 5 - CRM 核心模組 (P2)
  { id: "t11", milestoneId: "m5", projectId: "p2", title: "客戶資料 CRUD", description: "客戶建檔、編輯、查詢、刪除", status: "done", priority: "high", assigneeId: "u2", startDate: "2026-03-01", dueDate: "2026-03-15", estimatedHours: 30, actualHours: 28 },
  { id: "t12", milestoneId: "m5", projectId: "p2", title: "銷售漏斗模組", description: "機會管理與階段追蹤", status: "in_progress", priority: "high", assigneeId: "u2", startDate: "2026-03-16", dueDate: "2026-04-01", estimatedHours: 35, actualHours: 18 },
  { id: "t13", milestoneId: "m5", projectId: "p2", title: "聯繫記錄功能", description: "通話、Email、拜訪記錄", status: "review", priority: "medium", assigneeId: "u3", startDate: "2026-03-20", dueDate: "2026-04-05", estimatedHours: 25, actualHours: 22 },
  { id: "t14", milestoneId: "m5", projectId: "p2", title: "客戶標籤系統", description: "自訂標籤與分類", status: "todo", priority: "low", assigneeId: "u3", startDate: "2026-04-06", dueDate: "2026-04-15", estimatedHours: 15, actualHours: 0 },

  // Milestone 7 - App 原型 (P3)
  { id: "t15", milestoneId: "m7", projectId: "p3", title: "App 線框圖設計", description: "主要頁面線框圖", status: "in_progress", priority: "high", assigneeId: "u3", startDate: "2026-03-01", dueDate: "2026-03-15", estimatedHours: 30, actualHours: 12 },
  { id: "t16", milestoneId: "m7", projectId: "p3", title: "互動原型製作", description: "Figma 可互動原型", status: "todo", priority: "medium", assigneeId: "u3", startDate: "2026-03-16", dueDate: "2026-03-31", estimatedHours: 25, actualHours: 0 },
  { id: "t17", milestoneId: "m7", projectId: "p3", title: "原型用戶測試", description: "邀請 5 位用戶進行測試", status: "todo", priority: "medium", assigneeId: "u1", startDate: "2026-03-25", dueDate: "2026-03-31", estimatedHours: 15, actualHours: 0 },

  // Milestone 10 - AI 模型訓練 (P4)
  { id: "t18", milestoneId: "m10", projectId: "p4", title: "訓練資料預處理", description: "清洗並格式化訓練資料", status: "done", priority: "high", assigneeId: "u2", startDate: "2026-02-16", dueDate: "2026-02-28", estimatedHours: 30, actualHours: 35 },
  { id: "t19", milestoneId: "m10", projectId: "p4", title: "模型 Fine-tuning", description: "使用 GPT API 進行微調", status: "blocked", priority: "high", assigneeId: "u2", startDate: "2026-03-01", dueDate: "2026-03-20", estimatedHours: 40, actualHours: 30 },
  { id: "t20", milestoneId: "m10", projectId: "p4", title: "效果評估與報告", description: "A/B 測試與準確率評估", status: "todo", priority: "medium", assigneeId: "u2", startDate: "2026-03-21", dueDate: "2026-03-31", estimatedHours: 20, actualHours: 0 },
];

// --- Mock Task Logs ---

export const mockTaskLogs: TaskLog[] = [
  { id: "tl1", taskId: "t5", userId: "u2", action: "status_change", detail: "狀態從「待辦」變更為「進行中」", timestamp: "2026-03-16T09:00:00Z" },
  { id: "tl2", taskId: "t5", userId: "u2", action: "comment", detail: "已完成篩選功能，排序功能開發中", timestamp: "2026-03-18T14:30:00Z" },
  { id: "tl3", taskId: "t9", userId: "u2", action: "status_change", detail: "狀態從「待辦」變更為「進行中」", timestamp: "2026-03-23T10:00:00Z" },
  { id: "tl4", taskId: "t12", userId: "u2", action: "status_change", detail: "狀態從「待辦」變更為「進行中」", timestamp: "2026-03-16T08:30:00Z" },
  { id: "tl5", taskId: "t13", userId: "u3", action: "status_change", detail: "狀態從「進行中」變更為「審查中」", timestamp: "2026-04-02T16:00:00Z" },
  { id: "tl6", taskId: "t15", userId: "u3", action: "comment", detail: "已完成 5 頁線框圖，剩餘 3 頁", timestamp: "2026-03-10T11:00:00Z" },
  { id: "tl7", taskId: "t19", userId: "u2", action: "status_change", detail: "狀態從「進行中」變更為「已阻塞」", timestamp: "2026-03-15T09:00:00Z" },
  { id: "tl8", taskId: "t19", userId: "u2", action: "comment", detail: "API 額度用完，等待額度申請通過", timestamp: "2026-03-15T09:05:00Z" },
  { id: "tl9", taskId: "t4", userId: "u2", action: "status_change", detail: "狀態從「進行中」變更為「完成」", timestamp: "2026-03-14T17:00:00Z" },
  { id: "tl10", taskId: "t11", userId: "u2", action: "status_change", detail: "狀態從「進行中」變更為「完成」", timestamp: "2026-03-14T18:00:00Z" },
  { id: "tl11", taskId: "t1", userId: "u1", action: "comment", detail: "訪談記錄已整理完成，共收集 47 項需求", timestamp: "2026-01-30T16:00:00Z" },
  { id: "tl12", taskId: "t18", userId: "u2", action: "status_change", detail: "狀態從「進行中」變更為「完成」", timestamp: "2026-02-27T17:30:00Z" },
];

// --- Mock Risks ---

export const mockRisks: Risk[] = [
  {
    id: "r1", projectId: "p1", title: "前端技術債累積", description: "舊版程式碼未完全重構，可能影響新功能開發速度",
    impact: "medium", probability: 0.6, status: "mitigating", mitigation: "安排技術債清理衝刺，每兩週處理一次", ownerId: "u2", createdAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "r2", projectId: "p2", title: "需求範圍蔓延", description: "業務部門持續追加功能需求，可能導致專案延期",
    impact: "high", probability: 0.7, status: "open", mitigation: "建立需求變更流程，設定需求凍結日期", ownerId: "u1", createdAt: "2026-02-20T14:00:00Z",
  },
  {
    id: "r3", projectId: "p4", title: "API 額度不足", description: "GPT API 使用量超出預期，訓練進度受阻",
    impact: "critical", probability: 0.9, status: "open", mitigation: "申請額外額度或考慮使用開源替代方案", ownerId: "u2", createdAt: "2026-03-15T09:00:00Z",
  },
  {
    id: "r4", projectId: "p3", title: "外部團隊溝通延遲", description: "與外部合作團隊時區差異導致溝通成本增加",
    impact: "medium", probability: 0.5, status: "mitigating", mitigation: "固定每週三次視訊會議，建立共用文件", ownerId: "u1", createdAt: "2026-03-05T11:00:00Z",
  },
  {
    id: "r5", projectId: "p1", title: "第三方金流整合風險", description: "金流 API 改版可能影響結帳流程",
    impact: "high", probability: 0.4, status: "open", mitigation: "提前與金流供應商確認 API 變更時程", ownerId: "u2", createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "r6", projectId: "p2", title: "資料遷移風險", description: "舊系統資料格式不一致，遷移可能遺漏",
    impact: "high", probability: 0.5, status: "mitigating", mitigation: "建立資料驗證腳本，進行三次遷移演練", ownerId: "u2", createdAt: "2026-02-25T13:00:00Z",
  },
  {
    id: "r7", projectId: "p4", title: "模型準確率不達標", description: "AI 客服回覆準確率可能無法達到 85% 目標",
    impact: "critical", probability: 0.6, status: "open", mitigation: "增加訓練資料量，引入人工審核機制", ownerId: "u2", createdAt: "2026-03-10T15:00:00Z",
  },
  {
    id: "r8", projectId: "p1", title: "人力資源不足", description: "前端工程師同時支援多個專案",
    impact: "medium", probability: 0.5, status: "accepted", mitigation: "調整工作優先級，必要時申請外包支援", ownerId: "u1", createdAt: "2026-02-15T09:00:00Z",
  },
];

// --- Mock Delay Requests ---

export const mockDelayRequests: DelayRequest[] = [
  {
    id: "dr1", taskId: "t5", projectId: "p1", requesterId: "u2",
    reason: "商品列表篩選邏輯比預期複雜，需額外時間處理效能優化",
    originalDueDate: "2026-03-31", requestedDueDate: "2026-04-10",
    status: "pending", reviewerId: null, reviewComment: null,
    createdAt: "2026-03-28T10:00:00Z",
  },
  {
    id: "dr2", taskId: "t19", projectId: "p4", requesterId: "u2",
    reason: "API 額度限制導致模型訓練暫停，需等待額度恢復",
    originalDueDate: "2026-03-20", requestedDueDate: "2026-04-05",
    status: "approved", reviewerId: "u1", reviewComment: "已確認 API 額度問題，同意延期",
    createdAt: "2026-03-16T09:00:00Z",
  },
  {
    id: "dr3", taskId: "t13", projectId: "p2", requesterId: "u3",
    reason: "設計稿修改導致前端需同步調整",
    originalDueDate: "2026-04-05", requestedDueDate: "2026-04-12",
    status: "pending", reviewerId: null, reviewComment: null,
    createdAt: "2026-04-03T14:00:00Z",
  },
  {
    id: "dr4", taskId: "t15", projectId: "p3", requesterId: "u3",
    reason: "用戶訪談延遲導致設計方向需要調整",
    originalDueDate: "2026-03-15", requestedDueDate: "2026-03-22",
    status: "approved", reviewerId: "u4", reviewComment: "合理延期，請加快進度",
    createdAt: "2026-03-12T11:00:00Z",
  },
  {
    id: "dr5", taskId: "t10", projectId: "p1", requesterId: "u2",
    reason: "金流 API 文件更新延遲，需等待新版文件",
    originalDueDate: "2026-05-01", requestedDueDate: "2026-05-15",
    status: "rejected", reviewerId: "u1", reviewComment: "請先使用舊版 API 開發，之後再升級",
    createdAt: "2026-04-25T10:00:00Z",
  },
];

// --- Mock Drafts ---

export const mockDrafts: Draft[] = [
  {
    id: "d1", projectId: "p3", title: "App 功能規格書草稿",
    content: "## 功能規格\n\n### 1. 首頁\n- 推薦內容\n- 快捷操作\n\n### 2. 搜尋\n- 關鍵字搜尋\n- 篩選條件\n\n（待完善...）",
    authorId: "u1", updatedAt: "2026-03-08T15:00:00Z",
  },
  {
    id: "d2", projectId: null, title: "Q2 專案規劃草稿",
    content: "## Q2 專案規劃\n\n### 優先項目\n1. 電商平台改版（持續）\n2. CRM 系統上線\n3. App 開發進入核心階段\n\n### 資源分配\n（規劃中...）",
    authorId: "u1", updatedAt: "2026-03-15T09:30:00Z",
  },
];

// --- Mock Notifications ---

export const mockNotifications: Notification[] = [
  {
    id: "n1", userId: "u1", title: "延期申請待審核",
    message: "李成員 提交了「商品列表頁開發」延期申請，請審核",
    type: "warning", read: false, createdAt: "2026-03-28T10:00:00Z", link: "/delay-requests",
  },
  {
    id: "n2", userId: "u1", title: "里程碑即將到期",
    message: "「前端開發」里程碑將於 2026-04-30 到期，目前進度 45%",
    type: "warning", read: false, createdAt: "2026-03-27T08:00:00Z", link: "/projects/p1",
  },
  {
    id: "n3", userId: "u2", title: "任務已完成審查",
    message: "「聯繫記錄功能」已進入審查階段",
    type: "info", read: true, createdAt: "2026-04-02T16:00:00Z", link: "/projects/p2",
  },
  {
    id: "n4", userId: "u1", title: "風險警告",
    message: "「AI 智能客服研究」專案健康狀態變為紅燈",
    type: "error", read: false, createdAt: "2026-03-15T09:10:00Z", link: "/projects/p4",
  },
  {
    id: "n5", userId: "u4", title: "月度報告已產生",
    message: "2026 年 3 月專案進度月報已自動產生",
    type: "success", read: true, createdAt: "2026-04-01T00:00:00Z", link: "/reports",
  },
];

// --- Helper Functions ---

export function getUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id);
}

export function getMilestonesByProjectId(projectId: string): Milestone[] {
  return mockMilestones.filter((m) => m.projectId === projectId);
}

export function getTasksByMilestoneId(milestoneId: string): Task[] {
  return mockTasks.filter((t) => t.milestoneId === milestoneId);
}

export function getTasksByProjectId(projectId: string): Task[] {
  return mockTasks.filter((t) => t.projectId === projectId);
}

export function getRisksByProjectId(projectId: string): Risk[] {
  return mockRisks.filter((r) => r.projectId === projectId);
}

export function getDelayRequestsByProjectId(projectId: string): DelayRequest[] {
  return mockDelayRequests.filter((dr) => dr.projectId === projectId);
}

export function getNotificationsByUserId(userId: string): Notification[] {
  return mockNotifications.filter((n) => n.userId === userId);
}

export function getProjectProgress(projectId: string): number {
  const tasks = getTasksByProjectId(projectId);
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === "done").length;
  return Math.round((done / tasks.length) * 100);
}

// Status display helpers

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: "規劃中",
  in_progress: "進行中",
  on_hold: "暫停",
  completed: "已完成",
  cancelled: "已取消",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: "待辦",
  in_progress: "進行中",
  review: "審查中",
  done: "已完成",
  blocked: "已阻塞",
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

export const riskImpactLabels: Record<RiskImpact, string> = {
  critical: "嚴重",
  high: "高",
  medium: "中",
  low: "低",
};

export const delayRequestStatusLabels: Record<DelayRequestStatus, string> = {
  pending: "待審核",
  approved: "已核准",
  rejected: "已駁回",
};

export const healthStatusLabels: Record<HealthStatus, string> = {
  green: "正常",
  yellow: "警告",
  red: "異常",
};
