/**
 * Database Entities modeled strictly from ER_diagram.drawio.svg
 * 
 * 19 relational entities with Primary Keys (PK), Foreign Keys (FK),
 * and relational integrity constraints across Student, Instructor, Organization, and Admin actors.
 */

// 1. User Entity (Parent of Learner, Educator, Admin)
export interface UserEntity {
  id: string; // user_id PK
  name: string;
  email: string; // UNIQUE
  password?: string;
  role: 'Student' | 'Learner' | 'Instructor' | 'Educator' | 'Organization' | 'Admin';
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending';
  avatar?: string;
  verificationStatus?: 'Verified' | 'Pending' | 'Rejected';
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

// 2. Learner Entity (ISA User)
export interface LearnerEntity {
  id: string; // learner_id PK, FK => User.id
  userId?: string;
  name: string;
  email: string;
  avatar?: string;
  learnerType: 'Undergraduate' | 'Postgraduate' | 'Corporate' | 'Professional' | 'Lifelong';
  university?: string;
  universityId?: string;
  enrolledCourses?: number;
  overallProgress?: number;
  certificatesEarned?: number;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt?: string;
  updatedAt?: string;
}

// 3. Student Entity (is a Learner)
export interface StudentEntity {
  id: string; // learner_id PK, FK => Learner.id
  learnerId: string;
  universityId: string; // FK => University.id
  studentStatus: 'Enrolled' | 'Graduated' | 'On Leave';
  graduationYear: number;
  degree?: string;
  gpa?: number;
  createdAt?: string;
}

// 4. University Entity
export interface UniversityEntity {
  id: string; // university_id PK
  name: string;
  domain: string;
  location: string;
  website: string;
  status?: 'Active' | 'Verified';
  createdAt?: string;
}

// 5. Educator Entity / Instructor (ISA User)
export interface EducatorEntity {
  id: string; // educator_id PK, FK => User.id
  userId?: string;
  name: string;
  email: string;
  avatar?: string;
  organizationId: string; // FK => Organization.id
  organizationName?: string;
  educatorType: string;
  bio: string;
  expertise: string[] | string;
  specialization?: string;
  profileUrl?: string;
  status: 'Active' | 'Pending' | 'Suspended';
  verificationStatus?: 'Verified' | 'Pending' | 'Rejected';
  coursesCount?: number;
  enrolledStudents?: number;
  avgRating?: number;
  revenueGenerated?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 6. Organization Entity
export interface OrganizationEntity {
  id: string; // organization_id PK
  name: string;
  email: string;
  location: string;
  website: string;
  status: 'Active' | 'Verified' | 'Pending';
  tagline?: string;
  phone?: string;
  address?: string;
  totalRevenue?: number;
  monthlyRevenue?: number;
  currency?: string;
  logo?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 7. Course Entity
export interface CourseEntity {
  id: string; // course_id PK
  educatorId?: string; // FK => Educator.id
  instructorId?: string;
  instructorName?: string;
  instructors?: Array<{
    id: string;
    name: string;
    role: 'Lead Instructor' | 'Co-Instructor' | 'Guest Lecturer';
    avatar?: string;
    specialization?: string;
  }>;
  organizationId?: string; // FK => Organization.id
  universityId?: string; // FK => University.id
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mastery';
  accessType: 'Paid Masterclass' | 'Institutional Scholarship' | 'Open Enterprise Cohort' | 'Free';
  status: 'Published' | 'Draft' | 'Archived' | 'Pending Approval';
  price: number;
  rating?: number;
  totalHours?: string | number;
  lessonsCount?: number;
  enrolledCount?: number;
  thumbnail?: string;
  image?: string;
  visibility?: boolean;
  certificate?: boolean;
  objectives?: string[];
  prerequisites?: string;
  modules?: ModuleEntity[];
  createdAt?: string;
  updatedAt?: string;
}

// 8. Module Entity (Course has M Modules)
export interface ModuleEntity {
  id: string; // module_id PK
  courseId: string; // FK => Course.id
  title: string;
  description?: string;
  sequenceNumber: number;
  items?: any[];
  lessons?: LessonEntity[];
  createdAt?: string;
}

// 9. Lesson Entity (Module has M Lessons)
export interface LessonEntity {
  id: string; // lesson_id PK
  moduleId: string; // FK => Module.id
  courseId?: string;
  title: string;
  contentUrl?: string;
  url?: string;
  duration?: string | number;
  sequenceNumber: number;
  type?: 'Video' | 'Reading' | 'Quiz' | 'Lab';
  fileName?: string;
  fileSize?: string;
  createdAt?: string;
}

// 10. Enrollment Entity (Learner enrolled in Course)
export interface EnrollmentEntity {
  id: string; // enrollment_id PK
  learnerId: string; // FK => Learner.id
  learnerName?: string;
  learnerEmail?: string;
  learnerAvatar?: string;
  courseId: string; // FK => Course.id
  courseTitle?: string;
  enrolledDate?: string;
  enrolledAt?: string;
  progress: number; // 0 - 100 percentage
  completedLessons?: string[];
  status: 'Active' | 'Completed' | 'Dropped' | 'Paused';
  createdAt?: string;
  updatedAt?: string;
}

// 11. Assignment Entity
export interface AssignmentEntity {
  id: string; // assignment_id PK
  courseId: string; // FK => Course.id
  courseTitle?: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  createdAt?: string;
}

// 12. Submission Entity (Learner submits Assignment)
export interface SubmissionEntity {
  id: string; // submission_id PK
  assignmentId: string; // FK => Assignment.id
  learnerId: string; // FK => Learner.id
  learnerName?: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  content?: string;
  status: 'Submitted' | 'Graded' | 'Pending Review';
}

// 13. Certificate Entity (Course has Certificate, belongs to Learner)
export interface CertificateEntity {
  id: string; // certificate_id PK
  learnerId: string; // FK => Learner.id
  learnerName?: string;
  courseId: string; // FK => Course.id
  courseTitle?: string;
  credentialId: string; // UNIQUE
  issuedAt: string;
  expiryDate?: string | null;
  status: 'Issued' | 'Revoked' | 'Verified';
  certificateUrl?: string;
  grade?: string;
  instructorSignature?: string;
}

// 14. Payment / Transaction Entity (Learner pays for Course)
export interface PaymentEntity {
  id: string; // payment_id PK / transaction_id
  learnerId?: string; // FK => Learner.id
  payer?: string;
  payerEmail?: string;
  courseId?: string; // FK => Course.id
  course?: string;
  courseTitle?: string;
  amount: number;
  paymentMethod: string;
  method?: string;
  transactionId?: string; // UNIQUE
  paymentDate?: string;
  date?: string;
  status: 'Completed' | 'Pending' | 'Refunded' | 'Failed';
  type?: 'Tuition' | 'Disbursement' | 'Platform Fee' | 'Royalty Payout';
  facultyRoyalty?: number;
  platformFee?: number;
  createdAt?: string;
}

// 15. Review Entity (Learner reviews Course)
export interface ReviewEntity {
  id: string; // review_id PK
  learnerId: string; // FK => Learner.id
  learnerName: string;
  learnerAvatar?: string;
  courseId: string; // FK => Course.id
  courseTitle?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// 16. Quiz Entity (Course has Quiz)
export interface QuizEntity {
  id: string; // quiz_id PK
  courseId: string; // FK => Course.id
  courseTitle?: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  passingScore?: number;
  status: 'Published' | 'Draft';
  questionsCount?: number;
  questions?: QuizQuestionEntity[];
  createdAt?: string;
}

// 17. Quiz_Question Entity (Quiz contains M Questions)
export interface QuizQuestionEntity {
  id: string; // question_id PK
  quizId: string; // FK => Quiz.id
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  sequenceNumber: number;
}

// 18. Admin Entity (ISA User)
export interface AdminEntity {
  id: string; // admin_id PK, FK => User.id
  userId?: string;
  name: string;
  email: string;
  adminLevel: 'SuperAdmin' | 'FacultyLead' | 'ComplianceOfficer';
  status: 'Active' | 'Inactive';
  permissions?: string[];
  createdAt?: string;
}

// 19. Dispute Entity (Raised by User, managed by Admin)
export interface DisputeEntity {
  id: string; // dispute_id PK
  raisedBy: string; // FK => User.name / User.id
  raisedById?: string;
  raisedByRole?: 'Organization' | 'Faculty' | 'Learner' | 'Student';
  disputeType: string;
  subject?: string;
  description: string;
  courseId?: string;
  courseTitle?: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Under Review' | 'Escalated' | 'Resolved' | 'Closed';
  createdAt: string;
  resolvedAt?: string | null;
  adminNotes?: string;
  desiredResolution?: string;
  assignedAdmin?: string;
}
