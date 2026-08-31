export const courseProgressData = {
  courseId: "nexuspay-fundamentals",
  courseTitle: "NexusPay Fundamentals",
  institution: "NexusTech Institute",
  overallCompletion: 65,
  startDate: "Oct 12, 2024",
  estimatedTimeLeft: "4 hours left",
  currentGrade: "A",
  gradePercentage: 92.5,
  quizzesCompleted: 2,
  totalQuizzes: 4,
  certificateEligible: false,
  modules: [
    {
      id: 1,
      moduleNumber: "MODULE 1",
      title: "Foundations of NexusPay",
      progress: 100,
      status: "completed",
      items: [
        { id: "1.1", title: "1.1 Core Architecture & Protocol Overview", type: "video", duration: "12 min", completed: true, score: null },
        { id: "1.2", title: "1.2 Transaction Lifecycle & Status Transitions", type: "video", duration: "18 min", completed: true, score: null },
        { id: "1.3", title: "1.3 Security Standards & Token Vaults", type: "reading", duration: "10 min", completed: true, score: null },
        { id: "1.4", title: "1.4 Fundamentals Assessment Quiz", type: "quiz", duration: "20 min", completed: true, score: "96%" }
      ]
    },
    {
      id: 2,
      moduleNumber: "MODULE 2",
      title: "Advanced Logic & State Management",
      progress: 60,
      status: "in-progress",
      items: [
        { id: "2.1", title: "2.1 Idempotency Keys & Distributed Locking", type: "video", duration: "15 min", completed: true, score: null },
        { id: "2.2", title: "2.2 Webhook Engine & Exponential Retries", type: "video", duration: "22 min", completed: true, score: null },
        { id: "2.3", title: "2.3 State Management in NexusPay (Active)", type: "video", duration: "11 min", completed: false, current: true },
        { id: "2.4", title: "2.4 Module 2 Assessment: Risk & States", type: "quiz", duration: "25 min", completed: false, score: null }
      ]
    },
    {
      id: 3,
      moduleNumber: "MODULE 3",
      title: "High-Throughput Ledger Clearing",
      progress: 0,
      status: "locked",
      items: [
        { id: "3.1", title: "3.1 Double-Entry Balance Calculation", type: "video", duration: "20 min", completed: false },
        { id: "3.2", title: "3.2 High-Concurrency SQL Partitioning", type: "video", duration: "25 min", completed: false },
        { id: "3.3", title: "3.3 Practical Ledger Implementation Lab", type: "assignment", duration: "45 min", completed: false },
        { id: "3.4", title: "3.4 Module 3 Knowledge Check", type: "quiz", duration: "20 min", completed: false }
      ]
    },
    {
      id: 4,
      moduleNumber: "MODULE 4",
      title: "Compliance, Auditing & Final Certification",
      progress: 0,
      status: "locked",
      items: [
        { id: "4.1", title: "4.1 SOC2 & PCI-DSS Continuous Audit", type: "video", duration: "18 min", completed: false },
        { id: "4.2", title: "4.2 End-to-End Payment Capstone Project", type: "project", duration: "90 min", completed: false },
        { id: "4.3", title: "4.3 Final Comprehensive Exam", type: "quiz", duration: "60 min", completed: false }
      ]
    }
  ]
};
