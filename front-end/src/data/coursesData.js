export const coursesData = [
  {
    id: "advanced-api-integrations",
    title: "Advanced API Integrations for Enterprise Payments",
    subtitle: "Master high-throughput transaction pipelines, tokenization, idempotent architectures, and resilient payment gateways.",
    institution: "NexusTech Institute",
    instructor: {
      name: "Dr. Marcus Vance",
      title: "Principal Payment Systems Architect & Ex-Fintech Lead",
      rating: 4.9,
      students: 42800,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
    },
    rating: 4.9,
    reviewsCount: 3840,
    studentsCount: 18450,
    level: "Advanced",
    duration: "6 Weeks (8-10 hrs/week)",
    language: "English",
    lastUpdated: "October 2024",
    price: 89.99,
    originalPrice: 129.99,
    badge: "Bestseller",
    category: "Computer Science",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    whatYouWillLearn: [
      "Design robust payment routing architectures for global reach and 99.999% uptime.",
      "Implement PCI-DSS compliant tokenization flows securely without storing raw card data.",
      "Handle high-concurrency race conditions, idempotency keys, and ledger reconciliation.",
      "Integrate multi-currency settlement rails, webhooks, and retry fallback mechanisms."
    ],
    skills: [
      "API Design",
      "Payment Routing",
      "System Architecture",
      "Security & Compliance",
      "JSON Web Tokens",
      "Idempotency",
      "Distributed Systems",
      "PostgreSQL"
    ],
    description: "This comprehensive course dives deep into the architecture of modern enterprise payment systems. Designed for software engineers, tech leads, and technical product managers, this course provides hands-on architectural blueprints for designing, scaling, and maintaining mission-critical transactional platforms. You will build end-to-end payment adapters, implement secure vault tokenization, configure automatic ledger reconciliations, and handle distributed transaction anomalies.",
    modules: [
      {
        id: 1,
        title: "Foundations of Enterprise Payment Gateways",
        duration: "2 hours",
        lessonsCount: 4,
        lessons: [
          { id: "1.1", title: "Core Architecture & Topology", duration: "18 min", type: "video", completed: true },
          { id: "1.2", title: "PCI-DSS v4.0 Scope Reduction", duration: "24 min", type: "video", completed: true },
          { id: "1.3", title: "Card Networks, Issuers, and Acquirers", duration: "32 min", type: "video", completed: true },
          { id: "1.4", title: "Module 1 Knowledge Check", duration: "15 min", type: "quiz", completed: true }
        ]
      },
      {
        id: 2,
        title: "Idempotent API Design & Distributed State",
        duration: "3.5 hours",
        lessonsCount: 5,
        lessons: [
          { id: "2.1", title: "Idempotency Keys and Atomic Locks", duration: "28 min", type: "video", completed: true },
          { id: "2.2", title: "Handling Network Timeouts & Partitions", duration: "35 min", type: "video", completed: true },
          { id: "2.3", title: "State Management in NexusPay", duration: "10 min 45s", type: "video", completed: false, current: true },
          { id: "2.4", title: "Webhook Deliverability & Exponential Backoff", duration: "25 min", type: "video", completed: false },
          { id: "2.5", title: "Module 2 Quiz: State & Retries", duration: "20 min", type: "quiz", completed: false }
        ]
      },
      {
        id: 3,
        title: "Tokenization & Vault Security Architectures",
        duration: "4 hours",
        lessonsCount: 4,
        lessons: [
          { id: "3.1", title: "Format-Preserving Encryption (FPE)", duration: "40 min", type: "video", completed: false },
          { id: "3.2", title: "Building an Isolated Token Vault", duration: "45 min", type: "video", completed: false },
          { id: "3.3", title: "Key Rotation and HSM Integration", duration: "30 min", type: "video", completed: false },
          { id: "3.4", title: "Lab: Vault Token Security Audit", duration: "60 min", type: "assignment", completed: false }
        ]
      },
      {
        id: 4,
        title: "Multi-Currency Clearing & Ledger Reconciliation",
        duration: "3 hours",
        lessonsCount: 4,
        lessons: [
          { id: "4.1", title: "Double-Entry Ledger Fundamentals", duration: "35 min", type: "video", completed: false },
          { id: "4.2", title: "Real-Time Balance Settlement", duration: "40 min", type: "video", completed: false },
          { id: "4.3", title: "Dispute & Chargeback Automation", duration: "25 min", type: "video", completed: false },
          { id: "4.4", title: "Final Capstone Project & Certification", duration: "90 min", type: "project", completed: false }
        ]
      }
    ]
  },
  {
    id: "aws-solutions-architect",
    title: "Advanced AWS Solutions Architect",
    subtitle: "Master complex architectural patterns and prepare for the professional certification exam with hands-on labs.",
    institution: "CloudTech Academy",
    instructor: {
      name: "Elena Rostova",
      title: "AWS Certified Solution Architect Fellow",
      rating: 4.8,
      students: 58000,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
    },
    rating: 4.8,
    reviewsCount: 4120,
    studentsCount: 32900,
    level: "Advanced",
    duration: "8 Weeks (6-8 hrs/week)",
    language: "English",
    lastUpdated: "September 2024",
    price: 99.99,
    originalPrice: 149.99,
    badge: "Featured",
    category: "Cloud Architecture",
    progress: 72,
    currentModule: "Module 3 of 8",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    whatYouWillLearn: [
      "Architect multi-region, active-active high availability systems on AWS with Transit Gateway.",
      "Design fault-tolerant storage topologies with DynamoDB Global Tables and Aurora Multi-Master.",
      "Automate infrastructure as code (IaC) with Terraform, CloudFormation, and CI/CD pipelines.",
      "Implement zero-trust enterprise security with AWS IAM, KMS, Shield, and GuardDuty."
    ],
    skills: ["AWS IAM", "VPC Peering", "DynamoDB Global Tables", "Transit Gateway", "Terraform", "Serverless", "KMS Encryption"],
    description: "Prepare for senior cloud leadership and the official AWS Certified Solutions Architect Professional exam. You will tackle real-world architecture scenarios including legacy-to-cloud lift and shift, hybrid networking with Direct Connect, serverless event-driven microservices, and cost optimization at scale.",
    modules: [
      {
        id: 1,
        title: "Multi-Account & Multi-Region VPC Networking",
        duration: "3 hours",
        lessonsCount: 4,
        lessons: [
          { id: "1.1", title: "AWS Organizations & Control Tower", duration: "25 min", type: "video", completed: true },
          { id: "1.2", title: "Transit Gateway & Cross-Account Peering", duration: "35 min", type: "video", completed: true },
          { id: "1.3", title: "Hybrid Direct Connect & VPN Fallback", duration: "40 min", type: "video", completed: true },
          { id: "1.4", title: "Networking Assessment Quiz", duration: "20 min", type: "quiz", completed: true }
        ]
      },
      {
        id: 2,
        title: "Global Data Resilience & Storage Architecture",
        duration: "4 hours",
        lessonsCount: 4,
        lessons: [
          { id: "2.1", title: "DynamoDB Global Tables & CRDTs", duration: "30 min", type: "video", completed: true },
          { id: "2.2", title: "Aurora Global Database & Read Replicas", duration: "45 min", type: "video", completed: true },
          { id: "2.3", title: "S3 Cross-Region Replication & Lifecycle", duration: "25 min", type: "video", completed: true },
          { id: "2.4", title: "Hands-on Lab: Multi-Region Failover", duration: "60 min", type: "assignment", completed: true }
        ]
      },
      {
        id: 3,
        title: "High-Performance Compute & Kubernetes (EKS)",
        duration: "3.5 hours",
        lessonsCount: 4,
        lessons: [
          { id: "3.1", title: "EKS Cluster Provisioning with Terraform", duration: "40 min", type: "video", completed: true },
          { id: "3.2", title: "Spot Fleet Auto-Scaling Strategies", duration: "30 min", type: "video", completed: false, current: true },
          { id: "3.3", title: "Lambda Provisioned Concurrency & EventBridge", duration: "35 min", type: "video", completed: false },
          { id: "3.4", title: "Module 3 Exam", duration: "25 min", type: "quiz", completed: false }
        ]
      }
    ]
  },
  {
    id: "python-data-science",
    title: "Python for Data Science Fundamentals",
    subtitle: "Comprehensive guide to pandas, NumPy, data visualization, and exploratory analysis for data-driven decisions.",
    institution: "Tech University",
    instructor: {
      name: "Dr. Alan Turing",
      title: "Data Science Lead & Stanford Fellow",
      rating: 4.9,
      students: 84000,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
    },
    rating: 4.9,
    reviewsCount: 6540,
    studentsCount: 48200,
    level: "Beginner",
    duration: "5 Weeks (5-7 hrs/week)",
    language: "English",
    lastUpdated: "November 2024",
    price: 49.99,
    originalPrice: 79.99,
    badge: "Popular",
    category: "Data Science",
    progress: 78,
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&auto=format&fit=crop&q=80",
    whatYouWillLearn: [
      "Master vectorized data wrangling with NumPy arrays and pandas DataFrames.",
      "Build interactive visual dashboards with Matplotlib, Seaborn, and Plotly.",
      "Perform statistical hypothesis testing, A/B testing, and anomaly detection.",
      "Train baseline regression and classification models using Scikit-Learn."
    ],
    skills: ["Python", "Pandas", "NumPy", "Matplotlib", "Jupyter", "Data Cleaning", "Scikit-Learn"],
    description: "Transform raw data into strategic business insights. This course guides you step-by-step through real-world financial datasets, customer transaction logs, and churn prediction models with clean, reusable Python code.",
    modules: [
      {
        id: 1,
        title: "Python Environments & Vectorized Operations",
        duration: "2 hours",
        lessonsCount: 3,
        lessons: [
          { id: "1.1", title: "JupyterLab & NumPy Array Indexing", duration: "25 min", type: "video", completed: true },
          { id: "1.2", title: "Broadcasting and Vectorized Math", duration: "30 min", type: "video", completed: true },
          { id: "1.3", title: "NumPy Matrix Operations Quiz", duration: "15 min", type: "quiz", completed: true }
        ]
      },
      {
        id: 2,
        title: "Pandas Data Analysis & Time Series",
        duration: "3 hours",
        lessonsCount: 3,
        lessons: [
          { id: "2.1", title: "Data Cleaning, Imputation & Merging", duration: "35 min", type: "video", completed: true },
          { id: "2.2", title: "Financial Time Series Resampling", duration: "40 min", type: "video", completed: true },
          { id: "2.3", title: "Hands-on Project: Transaction Log Parser", duration: "60 min", type: "assignment", completed: true }
        ]
      }
    ]
  },
  {
    id: "agile-project-management",
    title: "Agile Project Management Leadership",
    subtitle: "Lead high-velocity engineering sprints, unblock dependencies, and drive product roadmap alignment.",
    institution: "Business Institute",
    instructor: {
      name: "Sarah Jenkins",
      title: "Scrum Master & VP of Agile Product Delivery",
      rating: 4.7,
      students: 29000,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80"
    },
    rating: 4.7,
    reviewsCount: 2190,
    studentsCount: 19400,
    level: "Intermediate",
    duration: "4 Weeks (4-6 hrs/week)",
    language: "English",
    lastUpdated: "October 2024",
    price: 59.99,
    originalPrice: 89.99,
    category: "Business",
    progress: 22,
    thumbnail: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
    whatYouWillLearn: [
      "Facilitate high-impact sprint ceremonies: Planning, Standups, Reviews, and Retrospectives.",
      "Manage complex technical dependencies and cross-functional team roadmaps.",
      "Implement Jira workflows, burn-down metrics, and velocity estimation models.",
      "Resolve stakeholder conflicts and streamline release train governance."
    ],
    skills: ["Scrum", "Kanban", "Sprint Planning", "Jira", "Risk Management", "Roadmapping"],
    description: "Learn how modern tech giants deliver software on time without burnout. This course provides practical toolkits for leading engineering and cross-functional teams with Scrum and Kanban methodologies.",
    modules: [
      {
        id: 1,
        title: "Agile Frameworks & Scrum Ceremonies",
        duration: "2 hours",
        lessonsCount: 3,
        lessons: [
          { id: "1.1", title: "Scrum Roles: Product Owner vs Scrum Master", duration: "25 min", type: "video", completed: true },
          { id: "1.2", title: "Crafting Actionable User Stories & Epics", duration: "30 min", type: "video", completed: false, current: true },
          { id: "1.3", title: "Ceremonies Knowledge Check", duration: "15 min", type: "quiz", completed: false }
        ]
      }
    ]
  },
  {
    id: "applied-machine-learning",
    title: "Applied Machine Learning Masterclass",
    subtitle: "End-to-end model development, feature engineering, transformer architectures, and deployment pipelines.",
    institution: "Global Tech Uni",
    instructor: {
      name: "Dr. Eleanor Rigby",
      title: "Stanford AI Researcher & ML Consultant",
      rating: 4.9,
      students: 62000,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80"
    },
    rating: 4.8,
    reviewsCount: 12400,
    studentsCount: 54000,
    level: "Intermediate",
    duration: "3 Months (8-10 hrs/week)",
    language: "English",
    lastUpdated: "October 2024",
    price: 89.99,
    originalPrice: 99.99,
    badge: "Specialization",
    category: "Computer Science",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80",
    whatYouWillLearn: [
      "Train state-of-the-art neural networks with PyTorch and Hugging Face transformers.",
      "Build automated feature engineering pipelines with automated model validation.",
      "Deploy models as low-latency microservices with Docker, FastAPI, and Triton Server.",
      "Monitor data drift, latency degradation, and continuous retraining in production."
    ],
    skills: ["Machine Learning", "PyTorch", "Scikit-Learn", "Feature Engineering", "MLOps", "Transformers", "FastAPI"],
    description: "A complete masterclass in production machine learning. Transition from Jupyter prototypes to scalable, high-throughput inference microservices in enterprise environments.",
    modules: [
      {
        id: 1,
        title: "Deep Learning Foundations & Neural Networks",
        duration: "3 hours",
        lessonsCount: 3,
        lessons: [
          { id: "1.1", title: "PyTorch Tensor Architecture & Autograd", duration: "35 min", type: "video", completed: true },
          { id: "1.2", title: "Optimizers, Loss Functions & Regularization", duration: "40 min", type: "video", completed: false },
          { id: "1.3", title: "Hands-on Lab: Neural Network from Scratch", duration: "50 min", type: "assignment", completed: false }
        ]
      }
    ]
  },
  {
    id: "corporate-finance-essentials",
    title: "Corporate Finance Essentials & Risk Management",
    subtitle: "Financial modeling, CAPM risk assessment, DCF valuations, and capital allocation frameworks for tech leaders.",
    institution: "Business School",
    instructor: {
      name: "Prof. Arthur Stern",
      title: "Senior Finance Chair & Former Wall Street Strategist",
      rating: 4.9,
      students: 41000,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
    },
    rating: 4.9,
    reviewsCount: 8200,
    studentsCount: 38000,
    level: "Beginner",
    duration: "4 Weeks (4-6 hrs/week)",
    language: "English",
    lastUpdated: "August 2024",
    price: 74.99,
    originalPrice: 110.00,
    category: "Finance",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80",
    whatYouWillLearn: [
      "Calculate cost of capital (WACC) and optimal debt-to-equity leverage ratios.",
      "Apply Capital Asset Pricing Model (CAPM) to evaluate portfolio systematic risk (Beta).",
      "Construct Discounted Cash Flow (DCF) models with sensitivity analysis in Excel/Google Sheets.",
      "Evaluate mergers, acquisitions, and technology venture capital deal structures."
    ],
    skills: ["CAPM", "DCF Modeling", "Valuation", "Risk Analysis", "Balance Sheet Optimization", "WACC"],
    description: "Essential corporate finance concepts for modern decision makers. Understand the math behind enterprise valuations, portfolio beta adjustments, and capital expenditure decisions.",
    modules: [
      {
        id: 1,
        title: "Capital Structure & Cost of Capital (WACC)",
        duration: "2 hours",
        lessonsCount: 3,
        lessons: [
          { id: "1.1", title: "Cost of Debt, Equity & Tax Shields", duration: "25 min", type: "video", completed: true },
          { id: "1.2", title: "WACC Formula & Optimal Capitalization", duration: "35 min", type: "video", completed: true },
          { id: "1.3", title: "Module 1 Knowledge Check", duration: "15 min", type: "quiz", completed: true }
        ]
      },
      {
        id: 2,
        title: "Risk Management & Asset Pricing (CAPM)",
        duration: "3 hours",
        lessonsCount: 3,
        lessons: [
          { id: "2.1", title: "Systematic vs Idiosyncratic Risk", duration: "30 min", type: "video", completed: true },
          { id: "2.2", title: "Beta Coefficient Calculation & SML", duration: "40 min", type: "video", completed: false, current: true },
          { id: "2.3", title: "Final Module 4 Assessment: CAPM", duration: "15 min", type: "quiz", completed: false }
        ]
      }
    ]
  },
  {
    id: "cloud-security-compliance",
    title: "Cloud Security, SOC2 & FinTech Compliance",
    subtitle: "Protect sensitive transactional infrastructures with zero-trust architecture and automated compliance auditing.",
    institution: "NexusPay Security Academy",
    instructor: {
      name: "Sarah Jenkins",
      title: "Fintech CISO & Cyber Defense Lead",
      rating: 4.9,
      students: 19000,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80"
    },
    rating: 4.9,
    reviewsCount: 1890,
    studentsCount: 14200,
    level: "Advanced",
    duration: "6 Weeks (6-8 hrs/week)",
    language: "English",
    lastUpdated: "November 2024",
    price: 59.99,
    originalPrice: 89.99,
    category: "Security",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1200&auto=format&fit=crop&q=80",
    whatYouWillLearn: [
      "Implement SOC2 Type II controls and automated evidence collection scripts.",
      "Design zero-trust microservice networks with mTLS, SPIFFE/SPIRE, and IAM roles.",
      "Build hardware security module (HSM) key rotation and token vaults.",
      "Audit cloud environments against NIST CSF and PCI-DSS v4.0 standards."
    ],
    skills: ["SOC2", "Zero Trust", "Vault KMS", "Audit Logs", "Vulnerability Assessment", "PCI-DSS"],
    description: "Hardening cloud infrastructure for regulated financial transactions. Master continuous compliance automation, secret rotation, and incident response playbooks.",
    modules: [
      {
        id: 1,
        title: "Zero-Trust Architecture & Identity",
        duration: "2.5 hours",
        lessonsCount: 3,
        lessons: [
          { id: "1.1", title: "mTLS & Service-to-Service Authentication", duration: "30 min", type: "video", completed: true },
          { id: "1.2", title: "KMS Envelope Encryption Architecture", duration: "35 min", type: "video", completed: false },
          { id: "1.3", title: "Security Controls Assessment", duration: "20 min", type: "quiz", completed: false }
        ]
      }
    ]
  },
  {
    id: "ux-design-systems",
    title: "UX Design Systems & Micro-Interactions",
    subtitle: "Create cohesive, scalable component libraries with atomic design principles in Figma and modern CSS.",
    institution: "Design Hub",
    instructor: {
      name: "Maya Lin",
      title: "Design Director & UI Architecture Consultant",
      rating: 4.8,
      students: 23000,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
    },
    rating: 4.8,
    reviewsCount: 3100,
    studentsCount: 22000,
    level: "Intermediate",
    duration: "4 Weeks (4-5 hrs/week)",
    language: "English",
    lastUpdated: "September 2024",
    price: 49.99,
    originalPrice: 69.99,
    category: "Design",
    progress: 45,
    thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80",
    whatYouWillLearn: [
      "Construct multi-brand design tokens for spacing, typography, and color elevations.",
      "Design WCAG 2.2 AA compliant accessible components with ARIA patterns.",
      "Prototype fluid micro-interactions, spring physics, and state transitions.",
      "Bridge design and engineering with Tailwind CSS token configuration."
    ],
    skills: ["Figma", "Design Tokens", "Accessibility WCAG", "Micro-Interactions", "Atomic Design", "Tailwind CSS"],
    description: "Step-by-step masterclass in creating enterprise design systems that scale seamlessly across web, iOS, and Android platforms.",
    modules: [
      {
        id: 1,
        title: "Atomic Design & Token Architecture",
        duration: "2 hours",
        lessonsCount: 3,
        lessons: [
          { id: "1.1", title: "Primitives vs Semantic Tokens", duration: "25 min", type: "video", completed: true },
          { id: "1.2", title: "Figma Variables & Mode Switching", duration: "35 min", type: "video", completed: false },
          { id: "1.3", title: "Design System Quiz", duration: "15 min", type: "quiz", completed: false }
        ]
      }
    ]
  }
];

export const exploreCategories = [
  "All Subjects",
  "Computer Science",
  "Cloud Architecture",
  "Data Science",
  "Finance",
  "Security",
  "Business",
  "Design"
];
