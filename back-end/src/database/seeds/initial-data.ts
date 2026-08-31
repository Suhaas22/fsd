// ==========================================
// 1. Users Data (Actors: Student, Instructor, Organization, Admin)
// ==========================================
export const initialUsersData = [
  {
    id: "usr-1",
    name: "Dr. Sarah Jenkins",
    email: "sarah.jenkins@university.edu",
    password: "Password123!",
    role: "Instructor",
    status: "Active",
    verificationStatus: "Verified",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    lastLogin: "2026-08-30T14:20:00.000Z",
    createdAt: "2023-01-12T08:00:00.000Z"
  },
  {
    id: "usr-2",
    name: "Prof. James Wilson",
    email: "j.wilson@nexuspay.edu",
    password: "Password123!",
    role: "Instructor",
    status: "Active",
    verificationStatus: "Verified",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    lastLogin: "2026-08-31T09:15:00.000Z",
    createdAt: "2023-01-10T09:00:00.000Z"
  },
  {
    id: "usr-3",
    name: "Robert Brown",
    email: "robert@codemasters.io",
    password: "Password123!",
    role: "Instructor",
    status: "Active",
    verificationStatus: "Verified",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    lastLogin: "2026-08-28T11:45:00.000Z",
    createdAt: "2023-04-12T08:00:00.000Z"
  },
  {
    id: "usr-4",
    name: "Alex Johnson",
    email: "alex.johnson@stanford.edu",
    password: "Password123!",
    role: "Student",
    status: "Active",
    verificationStatus: "Verified",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    lastLogin: "2026-08-31T18:00:00.000Z",
    createdAt: "2023-03-10T10:00:00.000Z"
  },
  {
    id: "usr-5",
    name: "Sarah Connor",
    email: "sarah.connor@caltech.edu",
    password: "Password123!",
    role: "Student",
    status: "Active",
    verificationStatus: "Verified",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    lastLogin: "2026-08-30T20:30:00.000Z",
    createdAt: "2023-02-01T12:00:00.000Z"
  },
  {
    id: "usr-6",
    name: "Michael Chang",
    email: "m.chang@mit.edu",
    password: "Password123!",
    role: "Student",
    status: "Active",
    verificationStatus: "Verified",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    lastLogin: "2026-08-29T16:20:00.000Z",
    createdAt: "2023-05-15T09:00:00.000Z"
  },
  {
    id: "usr-7",
    name: "NexusPay Organization Admin",
    email: "admin@nexuspay.edu",
    password: "Password123!",
    role: "Organization",
    status: "Active",
    verificationStatus: "Verified",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    lastLogin: "2026-08-31T22:00:00.000Z",
    createdAt: "2022-01-15T08:00:00.000Z"
  },
  {
    id: "usr-8",
    name: "Platform Super Admin",
    email: "superadmin@coursera-platform.io",
    password: "Password123!",
    role: "Admin",
    status: "Active",
    verificationStatus: "Verified",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
    lastLogin: "2026-08-31T22:30:00.000Z",
    createdAt: "2022-01-01T00:00:00.000Z"
  }
];

// ==========================================
// 2. Organization Entity
// ==========================================
export const initialOrganizationData = [
  {
    id: "org-101",
    name: "NexusPay Enterprise Academy",
    tagline: "Empowering Financial Engineering & Distributed Architecture Leaders",
    email: "admin@nexuspay.edu",
    phone: "+1 (415) 890-4200",
    location: "San Francisco, CA, USA",
    address: "450 Mission Street, Suite 1200, San Francisco, CA 94105",
    website: "https://nexuspay.enterprise.io",
    status: "Active",
    establishedYear: 2022,
    totalRevenue: 142580.00,
    monthlyRevenue: 42580.00,
    currency: "USD",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    createdAt: "2022-01-15T08:00:00.000Z",
    updatedAt: "2026-08-30T10:00:00.000Z"
  },
  {
    id: "org-102",
    name: "University of Tech",
    tagline: "Premier Computer Science & Engineering Research Consortium",
    email: "partners@univtech.edu",
    phone: "+1 (617) 495-1000",
    location: "Cambridge, MA, USA",
    address: "77 Massachusetts Ave, Cambridge, MA 02139",
    website: "https://univtech.edu",
    status: "Active",
    establishedYear: 2018,
    totalRevenue: 389400.00,
    monthlyRevenue: 68500.00,
    currency: "USD",
    logo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&auto=format&fit=crop&q=80",
    createdAt: "2018-05-18T08:00:00.000Z",
    updatedAt: "2026-08-29T10:00:00.000Z"
  }
];

// ==========================================
// 3. Universities Entity
// ==========================================
export const initialUniversitiesData = [
  {
    id: "univ-1",
    name: "Stanford University",
    domain: "stanford.edu",
    location: "Stanford, California, USA",
    website: "https://stanford.edu",
    status: "Verified",
    createdAt: "2022-01-01T00:00:00.000Z"
  },
  {
    id: "univ-2",
    name: "Massachusetts Institute of Technology (MIT)",
    domain: "mit.edu",
    location: "Cambridge, Massachusetts, USA",
    website: "https://mit.edu",
    status: "Verified",
    createdAt: "2022-01-01T00:00:00.000Z"
  },
  {
    id: "univ-3",
    name: "California Institute of Technology (Caltech)",
    domain: "caltech.edu",
    location: "Pasadena, California, USA",
    website: "https://caltech.edu",
    status: "Verified",
    createdAt: "2022-01-01T00:00:00.000Z"
  }
];

// ==========================================
// 4. Instructors / Educators Entity
// ==========================================
export const initialInstructorsData = [
  {
    id: "inst-1",
    userId: "usr-2",
    name: "Prof. James Wilson",
    email: "j.wilson@nexuspay.edu",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    educatorType: "Senior Principal Instructor",
    organizationId: "org-101",
    organizationName: "NexusPay Enterprise Academy",
    specialization: "Cloud Architecture & AWS",
    expertise: ["AWS", "Cloud Architecture", "Distributed Systems", "Kubernetes"],
    bio: "Former Principal Cloud Architect at AWS with 14+ years designing high-throughput transaction engines and distributed cloud networks.",
    status: "Active",
    verificationStatus: "Verified",
    coursesCount: 5,
    enrolledStudents: 342,
    avgRating: 4.8,
    revenueGenerated: 28400.00,
    joinedDate: "January 2023",
    createdAt: "2023-01-10T09:00:00.000Z",
    updatedAt: "2026-08-20T12:00:00.000Z"
  },
  {
    id: "inst-2",
    userId: "usr-1",
    name: "Dr. Sarah Mitchell",
    email: "s.mitchell@stanford.edu",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    educatorType: "Lead AI Researcher",
    organizationId: "org-101",
    organizationName: "NexusPay Enterprise Academy",
    specialization: "Machine Learning & FinTech AI",
    expertise: ["Machine Learning", "Python", "Data Science", "Neural Networks"],
    bio: "PhD in Computer Science from MIT. Leads fintech fraud detection AI algorithms and predictive market analytics.",
    status: "Active",
    verificationStatus: "Verified",
    coursesCount: 4,
    enrolledStudents: 289,
    avgRating: 4.9,
    revenueGenerated: 24500.00,
    joinedDate: "March 2023",
    createdAt: "2023-03-15T09:00:00.000Z",
    updatedAt: "2026-08-20T12:00:00.000Z"
  },
  {
    id: "inst-3",
    userId: "usr-3",
    name: "Robert Brown",
    email: "robert@codemasters.io",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    educatorType: "Senior Frontend Lead",
    organizationId: "org-102",
    organizationName: "University of Tech",
    specialization: "Full-Stack React & Next.js",
    expertise: ["React", "TypeScript", "Next.js", "GraphQL"],
    bio: "Principal Frontend Engineer specializing in micro-frontends and high-performance client rendering architectures.",
    status: "Active",
    verificationStatus: "Verified",
    coursesCount: 3,
    enrolledStudents: 215,
    avgRating: 4.7,
    revenueGenerated: 18200.00,
    joinedDate: "May 2023",
    createdAt: "2023-05-20T09:00:00.000Z",
    updatedAt: "2026-08-22T12:00:00.000Z"
  }
];

// ==========================================
// 5. Instructor Requests Entity
// ==========================================
export const initialInstructorRequestsData = [
  {
    id: "req-101",
    instructorName: "Dr. Elena Rostova",
    email: "elena.rostova@oxford.ac.uk",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    specialization: "Quantum Computing & Cryptography",
    requestedTrack: "Post-Quantum Cryptography & Zero-Knowledge Proofs",
    proposedHourlyRate: 150.00,
    status: "Pending Review",
    date: "2026-08-24",
    notes: "Visiting Oxford Fellow with 8 IEEE publications in lattice-based cryptography.",
    createdAt: "2026-08-24T10:00:00.000Z"
  },
  {
    id: "req-102",
    instructorName: "Marcus Vance",
    email: "m.vance@fintechleaders.com",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    specialization: "Algorithmic Trading & High-Frequency Systems",
    requestedTrack: "C++20 Low-Latency Order Matching Engines",
    proposedHourlyRate: 185.00,
    status: "Accepted",
    date: "2026-08-20",
    notes: "Ex-Citadel Quantitative Strategist. Course track greenlit for Q4 release.",
    createdAt: "2026-08-20T08:00:00.000Z"
  }
];

// ==========================================
// 6. Learners / Students Entity
// ==========================================
export const initialLearnersData = [
  {
    id: "lrn-1",
    userId: "usr-4",
    name: "Alex Johnson",
    email: "alex.johnson@stanford.edu",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    learnerType: "Undergraduate",
    university: "Stanford University",
    universityId: "univ-1",
    enrolledCourses: 3,
    overallProgress: 76,
    certificatesEarned: 2,
    status: "Active",
    createdAt: "2023-03-10T10:00:00.000Z",
    updatedAt: "2026-08-25T15:00:00.000Z"
  },
  {
    id: "lrn-2",
    userId: "usr-5",
    name: "Sarah Connor",
    email: "sarah.connor@caltech.edu",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    learnerType: "Postgraduate",
    university: "Caltech",
    universityId: "univ-3",
    enrolledCourses: 4,
    overallProgress: 88,
    certificatesEarned: 3,
    status: "Active",
    createdAt: "2023-02-01T12:00:00.000Z",
    updatedAt: "2026-08-26T11:00:00.000Z"
  },
  {
    id: "lrn-3",
    userId: "usr-6",
    name: "Michael Chang",
    email: "m.chang@mit.edu",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    learnerType: "Corporate",
    university: "MIT Professional",
    universityId: "univ-2",
    enrolledCourses: 2,
    overallProgress: 64,
    certificatesEarned: 1,
    status: "Active",
    createdAt: "2023-05-15T09:00:00.000Z",
    updatedAt: "2026-08-28T14:00:00.000Z"
  }
];

export const initialStudentsData = [
  {
    id: "std-1",
    learnerId: "lrn-1",
    universityId: "univ-1",
    studentStatus: "Enrolled",
    graduationYear: 2025,
    degree: "B.S. Computer Science",
    gpa: 3.92
  },
  {
    id: "std-2",
    learnerId: "lrn-2",
    universityId: "univ-3",
    studentStatus: "Enrolled",
    graduationYear: 2024,
    degree: "M.S. Distributed Computing",
    gpa: 3.98
  }
];

// ==========================================
// 7. Course & Curriculum Entity (with Multi-Instructors)
// ==========================================
export const initialCoursesData = [
  {
    id: "crs-101",
    title: "AWS Cloud Solutions Architect - Masterclass",
    subtitle: "Design highly resilient, fault-tolerant, and secure enterprise infrastructure on AWS.",
    description: "Comprehensive multi-tier cloud architectural mastery covering VPC peering, Transit Gateways, EKS Kubernetes clusters, DynamoDB global tables, and automated disaster recovery failover.",
    category: "Cloud & DevOps",
    level: "Advanced",
    accessType: "Paid Masterclass",
    price: 189.00,
    rating: 4.8,
    status: "Published",
    totalHours: "38.5h",
    lessonsCount: 42,
    enrolledCount: 1420,
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    instructorId: "inst-1",
    instructorName: "Prof. James Wilson",
    instructors: [
      { id: "inst-1", name: "Prof. James Wilson", role: "Lead Instructor", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80", specialization: "Cloud Architecture" },
      { id: "inst-2", name: "Dr. Sarah Mitchell", role: "Co-Instructor", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80", specialization: "FinTech AI" }
    ],
    organizationId: "org-101",
    universityId: "univ-1",
    visibility: true,
    certificate: true,
    objectives: [
      "Architect multi-region high availability deployments",
      "Implement zero-trust security VPC networks",
      "Deploy scalable Kubernetes workloads via AWS EKS"
    ],
    prerequisites: "Fundamental networking knowledge and basic command-line proficiency.",
    modules: [
      {
        id: "mod-1",
        courseId: "crs-101",
        title: "Enterprise VPC Topology & Hybrid Interconnect",
        description: "Master VPC CIDR design, transit gateways, and direct connect failover.",
        sequenceNumber: 1,
        lessons: [
          { id: "les-101", moduleId: "mod-1", title: "VPC Subnetting & CIDR Architectural Strategy", duration: "24m", sequenceNumber: 1, type: "Video", contentUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
          { id: "les-102", moduleId: "mod-1", title: "AWS Transit Gateway Mesh Routing", duration: "32m", sequenceNumber: 2, type: "Video", contentUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
          { id: "les-103", moduleId: "mod-1", title: "Architectural RFC: Zero-Trust Security Models", duration: "15m", sequenceNumber: 3, type: "Reading", contentUrl: "https://docs.aws.amazon.com/whitepapers" }
        ]
      },
      {
        id: "mod-2",
        courseId: "crs-101",
        title: "Elastic Container Service & Kubernetes EKS",
        description: "Deploy production-grade clusters with GitOps and autoscaling.",
        sequenceNumber: 2,
        lessons: [
          { id: "les-201", moduleId: "mod-2", title: "EKS Cluster Control Plane & Managed Node Groups", duration: "28m", sequenceNumber: 1, type: "Video", contentUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
          { id: "les-202", moduleId: "mod-2", title: "Karpenter Dynamic Node Autoscaling", duration: "35m", sequenceNumber: 2, type: "Video", contentUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" }
        ]
      }
    ],
    createdAt: "2024-01-15T08:00:00.000Z",
    updatedAt: "2026-08-28T10:00:00.000Z"
  },
  {
    id: "crs-102",
    title: "FinTech Machine Learning: Fraud Detection",
    subtitle: "Real-time stream processing and neural anomaly classification for payment networks.",
    description: "Learn to build high-throughput fraud classification pipelines using graph neural networks, XGBoost, Kafka event streams, and low-latency feature stores.",
    category: "AI & Data Science",
    level: "Mastery",
    accessType: "Paid Masterclass",
    price: 249.00,
    rating: 4.9,
    status: "Published",
    totalHours: "44.0h",
    lessonsCount: 48,
    enrolledCount: 980,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
    instructorId: "inst-2",
    instructorName: "Dr. Sarah Mitchell",
    instructors: [
      { id: "inst-2", name: "Dr. Sarah Mitchell", role: "Lead Instructor", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80", specialization: "FinTech AI" },
      { id: "inst-3", name: "Robert Brown", role: "Co-Instructor", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80", specialization: "Frontend Engineering" }
    ],
    organizationId: "org-101",
    universityId: "univ-1",
    visibility: true,
    certificate: true,
    objectives: [
      "Train Graph Neural Networks on payment transaction graphs",
      "Implement sub-10ms inference microservices",
      "Deploy production Feast feature stores"
    ],
    prerequisites: "Python proficiency and foundational machine learning concepts.",
    modules: [
      {
        id: "mod-102-1",
        courseId: "crs-102",
        title: "Transaction Anomaly Detection Foundations",
        description: "Feature extraction from high-frequency payment streams.",
        sequenceNumber: 1,
        lessons: [
          { id: "les-301", moduleId: "mod-102-1", title: "Financial Data Processing with Apache Arrow", duration: "30m", sequenceNumber: 1, type: "Video", contentUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
        ]
      }
    ],
    createdAt: "2024-02-10T08:00:00.000Z",
    updatedAt: "2026-08-25T10:00:00.000Z"
  },
  {
    id: "crs-103",
    title: "Full-Stack Enterprise React & Next.js 14",
    subtitle: "Server Components, App Router, and Micro-Frontends for Enterprise Applications.",
    description: "Architect scale-ready web applications using Next.js 14 Server Actions, streaming SSR, PostgreSQL integrations, and micro-frontend isolation.",
    category: "Full-Stack Engineering",
    level: "Intermediate",
    accessType: "Institutional Scholarship",
    price: 99.00,
    rating: 4.7,
    status: "Published",
    totalHours: "32.0h",
    lessonsCount: 36,
    enrolledCount: 1650,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80",
    instructorId: "inst-3",
    instructorName: "Robert Brown",
    instructors: [
      { id: "inst-3", name: "Robert Brown", role: "Lead Instructor", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80", specialization: "Frontend Engineering" }
    ],
    organizationId: "org-102",
    universityId: "univ-2",
    visibility: true,
    certificate: true,
    objectives: [
      "Master Next.js App Router and streaming server rendering",
      "Build modular micro-frontends with Module Federation",
      "Implement robust type-safe API queries"
    ],
    prerequisites: "Intermediate JavaScript and React fundamentals.",
    createdAt: "2024-03-01T08:00:00.000Z",
    updatedAt: "2026-08-20T10:00:00.000Z"
  }
];

// ==========================================
// 8. Enrollments Entity
// ==========================================
export const initialEnrollmentsData = [
  {
    id: "enr-501",
    learnerId: "lrn-1",
    learnerName: "Alex Johnson",
    learnerEmail: "alex.johnson@stanford.edu",
    learnerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    courseId: "crs-101",
    courseTitle: "AWS Cloud Solutions Architect - Masterclass",
    enrolledDate: "2026-08-15",
    enrolledAt: "2026-08-15T10:30:00.000Z",
    progress: 82,
    status: "Active",
    createdAt: "2026-08-15T10:30:00.000Z"
  },
  {
    id: "enr-502",
    learnerId: "lrn-2",
    learnerName: "Sarah Connor",
    learnerEmail: "sarah.connor@caltech.edu",
    learnerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    courseId: "crs-102",
    courseTitle: "FinTech Machine Learning: Fraud Detection",
    enrolledDate: "2026-08-10",
    enrolledAt: "2026-08-10T09:15:00.000Z",
    progress: 100,
    status: "Completed",
    createdAt: "2026-08-10T09:15:00.000Z"
  },
  {
    id: "enr-503",
    learnerId: "lrn-3",
    learnerName: "Michael Chang",
    learnerEmail: "m.chang@mit.edu",
    learnerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    courseId: "crs-103",
    courseTitle: "Full-Stack Enterprise React & Next.js 14",
    enrolledDate: "2026-08-18",
    enrolledAt: "2026-08-18T14:45:00.000Z",
    progress: 45,
    status: "Active",
    createdAt: "2026-08-18T14:45:00.000Z"
  }
];

// ==========================================
// 9. Quizzes & Questions Entity
// ==========================================
export const initialQuizzesData = [
  {
    id: "qiz-1",
    courseId: "crs-101",
    courseTitle: "AWS Cloud Solutions Architect - Masterclass",
    title: "AWS Architecture & Networking Certification Quiz",
    description: "Assessment covering VPC Peering, Transit Gateway, Route Tables, and CIDR subnets.",
    durationMinutes: 20,
    passingScore: 75,
    status: "Published",
    questionsCount: 4,
    createdAt: "2024-01-20T00:00:00.000Z"
  }
];

export const initialQuizQuestionsData = [
  {
    id: "qst-1",
    quizId: "qiz-1",
    sequenceNumber: 1,
    questionText: "Which AWS networking service enables transitive peering between hundreds of VPCs and on-premises networks?",
    optionA: "AWS Direct Connect Gateway",
    optionB: "AWS Transit Gateway",
    optionC: "VPC Peering Connection",
    optionD: "NAT Gateway",
    correctOption: "B",
    explanation: "AWS Transit Gateway acts as a central cloud router connecting multiple VPCs and on-premises networks transitively."
  },
  {
    id: "qst-2",
    quizId: "qiz-1",
    sequenceNumber: 2,
    questionText: "In a Multi-AZ DynamoDB configuration, what is the default consistency model for read requests?",
    optionA: "Strong Consistency",
    optionB: "Eventual Consistency",
    optionC: "Linearizable Consistency",
    optionD: "Serializable Consistency",
    correctOption: "B",
    explanation: "DynamoDB uses Eventually Consistent reads by default; Strongly Consistent reads can be explicitly requested."
  }
];

// ==========================================
// 10. Assignments & Submissions Entity
// ==========================================
export const initialAssignmentsData = [
  {
    id: "asg-1",
    courseId: "crs-101",
    courseTitle: "AWS Cloud Solutions Architect - Masterclass",
    title: "Terraform Infrastructure as Code (IaC) Multi-AZ Cluster",
    description: "Submit your modular Terraform code deploying an autoscaling EKS cluster across 3 availability zones.",
    dueDate: "2026-09-15T23:59:59.000Z",
    maxScore: 100,
    createdAt: "2024-01-25T00:00:00.000Z"
  }
];

export const initialSubmissionsData = [
  {
    id: "sub-1",
    assignmentId: "asg-1",
    learnerId: "lrn-1",
    learnerName: "Alex Johnson",
    submittedAt: "2026-08-26T18:30:00.000Z",
    score: 95,
    feedback: "Exceptional VPC isolation and state locking implementation via S3 & DynamoDB.",
    status: "Graded"
  }
];

// ==========================================
// 11. Certificates Entity
// ==========================================
export const initialCertificatesData = [
  {
    id: "cert-801",
    learnerId: "lrn-2",
    learnerName: "Sarah Connor",
    courseId: "crs-102",
    courseTitle: "FinTech Machine Learning: Fraud Detection",
    credentialId: "NEXUS-2026-ML-9921",
    issuedAt: "2026-08-12T10:00:00.000Z",
    expiryDate: null,
    status: "Verified",
    grade: "Grade: 98.4% (Honors Distinction)",
    instructorSignature: "Dr. Sarah Mitchell, Lead AI Researcher",
    certificateUrl: "https://nexuspay.enterprise.io/verify/NEXUS-2026-ML-9921"
  }
];

// ==========================================
// 12. Payments & Transactions Entity
// ==========================================
export const initialTransactionsData = [
  {
    id: "TXN-2026-0912",
    learnerId: "lrn-1",
    payer: "Alex Johnson",
    payerEmail: "alex.johnson@stanford.edu",
    courseId: "crs-101",
    course: "AWS Cloud Solutions Architect - Masterclass",
    courseTitle: "AWS Cloud Solutions Architect - Masterclass",
    amount: 189.00,
    method: "Credit Card (Stripe)",
    paymentMethod: "Credit Card (Stripe)",
    transactionId: "TXN-2026-0912",
    date: "2026-08-28",
    paymentDate: "2026-08-28",
    status: "Completed",
    type: "Tuition",
    facultyRoyalty: 132.30,
    platformFee: 56.70,
    createdAt: "2026-08-28T09:12:00.000Z"
  },
  {
    id: "TXN-2026-0911",
    learnerId: "lrn-2",
    payer: "Sarah Connor",
    payerEmail: "sarah.connor@caltech.edu",
    courseId: "crs-102",
    course: "FinTech Machine Learning: Fraud Detection",
    courseTitle: "FinTech Machine Learning: Fraud Detection",
    amount: 249.00,
    method: "PayPal",
    paymentMethod: "PayPal",
    transactionId: "TXN-2026-0911",
    date: "2026-08-27",
    paymentDate: "2026-08-27",
    status: "Completed",
    type: "Tuition",
    facultyRoyalty: 174.30,
    platformFee: 74.70,
    createdAt: "2026-08-27T14:30:00.000Z"
  }
];

export const initialRefundsData = [
  {
    id: "ref-1",
    transactionId: "TXN-2026-0800",
    learnerName: "David Wilson",
    courseTitle: "Full-Stack Enterprise React & Next.js 14",
    amount: 99.00,
    reason: "Duplicate accidental purchase",
    status: "Processed",
    date: "2026-08-20"
  }
];

// ==========================================
// 13. Reviews Entity
// ==========================================
export const initialReviewsData = [
  {
    id: "rev-1",
    learnerId: "lrn-1",
    learnerName: "Alex Johnson",
    learnerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    courseId: "crs-101",
    courseTitle: "AWS Cloud Solutions Architect - Masterclass",
    rating: 5,
    comment: "The Transit Gateway and EKS cluster setups are directly applicable to enterprise production. Top notch instruction!",
    createdAt: "2026-08-25T11:00:00.000Z"
  },
  {
    id: "rev-2",
    learnerId: "lrn-2",
    learnerName: "Sarah Connor",
    learnerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    courseId: "crs-102",
    courseTitle: "FinTech Machine Learning: Fraud Detection",
    rating: 5,
    comment: "The Graph Neural Network transaction classification modules are unmatched in clarity and depth.",
    createdAt: "2026-08-22T16:00:00.000Z"
  }
];

// ==========================================
// 14. Disputes Entity
// ==========================================
export const initialDisputesData = [
  {
    id: "DSP-2026-081",
    raisedBy: "Prof. James Wilson",
    raisedById: "inst-1",
    raisedByRole: "Faculty",
    disputeType: "Royalty Payout Discrepancy",
    subject: "Q3 Royalty Split Audit Discrepancy",
    description: "Calculated 70% share for AWS Cloud Masterclass August enrollments is short by $420 compared to student enrollment logs.",
    courseId: "crs-101",
    courseTitle: "AWS Cloud Solutions Architect - Masterclass",
    priority: "Urgent",
    status: "Under Review",
    createdAt: "2026-08-25",
    resolvedAt: null,
    adminNotes: "Finance operations team cross-verifying Stripe gateway settlement batch #904.",
    desiredResolution: "Credit remaining $420 royalty balance to educator payout balance."
  },
  {
    id: "DSP-2026-079",
    raisedBy: "Stanford School of Engineering",
    raisedById: "org-101",
    raisedByRole: "Organization",
    disputeType: "Course Content Quality / SLA",
    subject: "Missing Cloud Sandbox Credentials in Lab 4",
    description: "Enrolled cohort students reported timeout issues accessing the AWS sandbox environment in module 3.",
    courseId: "crs-101",
    courseTitle: "AWS Cloud Solutions Architect - Masterclass",
    priority: "High",
    status: "Open",
    createdAt: "2026-08-22",
    resolvedAt: null,
    adminNotes: "Cloud infrastructure team allocated new IAM session quotas.",
    desiredResolution: "Extend student lab vouchers and fix IAM role automation."
  },
  {
    id: "DSP-2026-068",
    raisedBy: "Dr. Sarah Mitchell",
    raisedById: "inst-2",
    raisedByRole: "Faculty",
    disputeType: "IP & Copyright Infringement",
    subject: "Unauthorized Reposting of Neural Net Lecture Slides",
    description: "Slide deck materials were uploaded to an unauthorized external scraper portal without attribution.",
    courseId: "crs-102",
    courseTitle: "FinTech Machine Learning: Fraud Detection",
    priority: "Medium",
    status: "Resolved",
    createdAt: "2026-08-10",
    resolvedAt: "2026-08-14",
    adminNotes: "DMCA takedown notice served and content removed by external provider.",
    desiredResolution: "Formal DMCA takedown issued and verified."
  }
];

// ==========================================
// 15. Reports Entity
// ==========================================
export const initialReportsData = [
  {
    id: "REP-2026-0801",
    title: "Monthly Financial Settlement Statement",
    type: "Financial",
    date: "2026-08-28",
    size: "2.4 MB",
    downloadUrl: "#"
  },
  {
    id: "REP-2026-0789",
    title: "Learner Course Completion Audit",
    type: "Academic",
    date: "2026-08-20",
    size: "1.8 MB",
    downloadUrl: "#"
  },
  {
    id: "REP-2026-0755",
    title: "Annual Compliance & Accreditation Audit",
    type: "Compliance",
    date: "2026-08-15",
    size: "4.1 MB",
    downloadUrl: "#"
  }
];

// ==========================================
// 16. Notifications Entity
// ==========================================
export const initialNotificationsData = [
  {
    id: "notif-1",
    title: "New Teaching Application Submitted",
    desc: "Dr. Elena Rostova submitted an accreditation application for 'Post-Quantum Cryptography'.",
    time: "10 minutes ago",
    read: false,
    type: "Application",
    createdAt: "2026-08-28T19:30:00.000Z"
  },
  {
    id: "notif-2",
    title: "Enterprise Cohort Enrollment Completed",
    desc: "50 new engineers from Stanford FinTech Lab enrolled in 'AWS Cloud Masterclass'.",
    time: "2 hours ago",
    read: false,
    type: "Enrollment",
    createdAt: "2026-08-28T17:30:00.000Z"
  },
  {
    id: "notif-3",
    title: "Dispute Escalated to Legal Governance",
    desc: "Dispute DSP-2026-081 (Royalty Payout Discrepancy) marked as urgent priority.",
    time: "1 day ago",
    read: true,
    type: "Dispute",
    createdAt: "2026-08-27T10:00:00.000Z"
  }
];

// ==========================================
// 17. Settings Entity
// ==========================================
export const initialSettingsData = [
  {
    id: "settings-global",
    name: "NexusPay Academy Governance Policies",
    requireTwoFactor: true,
    autoApproveEnrollments: true,
    defaultCurrency: "USD",
    defaultAccessType: "Paid Masterclass",
    emailAlerts: true,
    royaltyAlerts: true,
    revenueShareEducatorPct: 70,
    platformFeePct: 30,
    updatedAt: "2026-08-28T08:00:00.000Z"
  }
];
