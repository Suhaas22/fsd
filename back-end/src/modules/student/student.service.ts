import {certificatePdf} from '../../common/certificates/certificate-pdf';
import { paymentRecords,completedPaymentStatus } from '../../common/payments/payment-records';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { publishedLessons,enrollmentLearning } from '../../common/learning/learning-records';
import { JsonDatabaseService } from '../../database/json-db.service';
import { DisputesService } from '../disputes/disputes.service';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { UpdateStudentProfileDto, StudentCheckoutDto } from './dto/student.dto';
import { OrganizationService } from '../organization/organization.service';

const PAYMENT_METHODS = ['card', 'upi'];

@Injectable()
export class StudentService {
  constructor(
    private readonly db:JsonDatabaseService,
    private readonly disputes:DisputesService,
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS)
    private readonly enrollmentsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.CERTIFICATES)
    private readonly certificatesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONS)
    private readonly transactionsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ORGANIZATION)
    private readonly orgsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notifsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.SETTINGS) private readonly settingsRepo: JsonRepository<any>,
    private readonly organizationService: OrganizationService,
  ) {}

  private async resolveLearner(userId: string) {
    if (userId) {
      let learner = await this.learnersRepo.findById(userId);
      if (!learner) {
        const all = await this.learnersRepo.find();
        learner = all.find((l) => l.userId === userId || l.email === userId || l.id === userId) || null;
      }
      if (learner?.status === 'Suspended') throw new ForbiddenException('This account is suspended.');
      if (learner) return learner;
    }
    throw new NotFoundException(`Learner '${userId || 'default'}' not found`);
  }

  private hasInstructor(course: any) {
    return Boolean(course?.instructorId || course?.instructors?.length);
  }

  private isAvailable(course: any) {
    return course && course.status === 'Published' && this.hasInstructor(course);
  }

  private lessonsFor(course:any){return publishedLessons(course);}
  private lessonIdsFor(course:any):string[]{return this.lessonsFor(course).map(l=>l.id);}
  private async enrichedCourses(){
    const [courses,orgs,instructors,reviews,enrollments]=await Promise.all(['courses','organizations','instructors','reviews','enrollments'].map(name=>this.db.getCollection<any>(name)));
    return courses.map(c=>{const teacherIds=[c.instructorId,...(Array.isArray(c.instructors)?c.instructors:[]).map(i=>typeof i==='string'?i:i?.id)].filter(Boolean);const teachers=instructors.filter(i=>teacherIds.includes(i.id));const ratings=reviews.filter(r=>r.courseId===c.id&&Number(r.rating)>=1&&Number(r.rating)<=5);const lessons=this.lessonsFor(c);
      return {...c,organizationName:orgs.find(o=>o.id===c.organizationId)?.name||null,instructorName:teachers.map(i=>i.name).join(', '),leadInstructorName:teachers.find(i=>i.id===c.instructorId)?.name||null,instructors:teachers.map(i=>({id:i.id,name:i.name,specialization:i.specialization||null})),rating:ratings.length?ratings.reduce((sum,r)=>sum+Number(r.rating),0)/ratings.length:null,reviewsCount:ratings.length,enrolledCount:enrollments.filter(e=>e.courseId===c.id).length,lessonsCount:lessons.length,modules:(Array.isArray(c.modules)?c.modules:[]).filter(Boolean).map((m,i)=>({id:m.id||`mod-${i+1}`,title:m.title||null,description:m.description||'',lessonsCount:lessons.filter(l=>l.moduleIndex===i).length,lessons:lessons.filter(l=>l.moduleIndex===i).map(l=>({id:l.id,title:l.title,type:l.type,duration:l.duration}))}))};
    });
  }

  async getProfile(userId: string) {
    const learner = await this.resolveLearner(userId);
    const [enrollments, certificates] = await Promise.all([
      this.getEnrollments(userId),
      this.getCertificates(userId),
    ]);
    const completed = enrollments.filter((e) => e.status === 'Completed').length;

    return {
      ...learner,
      enrolledCourses: enrollments.length,
      inProgressCourses: enrollments.filter(e=>e.status!=='Completed'&&e.courseStatus!=='Archived').length,
      completedCourses: completed,
      certificatesEarned: certificates.length,
    };
  }

  async updateProfile(userId: string, dto: UpdateStudentProfileDto) {
    const learner = await this.resolveLearner(userId);
    const allowed: any = {};
    for (const key of ['name', 'title', 'location', 'bio', 'phone']) {
      if (dto[key] !== undefined) allowed[key] = String(dto[key]).trim();
    }
    if (allowed.name !== undefined && allowed.name.length < 2) {
      throw new BadRequestException('Name must be at least 2 characters');
    }
    await this.db.runTransaction(async()=>{
      await this.learnersRepo.update(learner.id, { ...allowed, updatedAt: new Date().toISOString() });
      const users=new JsonRepository<any>('users',this.db);const account=(await users.find()).find(u=>u.id===learner.userId||u.id===userId);if(account&&allowed.name!==undefined)await users.update(account.id,{name:allowed.name});
    });
    return this.getProfile(userId);
  }

  async requestJoinOrganization(userId: string, orgId: string, orgName: string) {
    const learner = await this.resolveLearner(userId);
    const org = await this.orgsRepo.findById(orgId);
    if (!org) throw new NotFoundException(`Organization '${orgId}' not found`);
    await this.learnersRepo.update(learner.id, {
      orgMembershipStatus: 'Pending Organization Approval',
      requestedOrgId: org.id,
      requestedOrgName: org.name || orgName,
      requestedAt: new Date().toISOString(),
    });
    return this.getProfile(userId);
  }

  async getOrganizationsList() {
    return this.orgsRepo.find();
  }

  async getCatalog() {
    const courses = await this.enrichedCourses();
    return courses.filter((c) => this.isAvailable(c)&&c.instructors.length>0);
  }

  async browse(userId:string,query:any={}){
    const courses=await this.getCatalog();const enrollments=await this.getEnrollments(userId);
    const term=String(query.search||'').trim().toLowerCase();
    const all=courses.map(c=>({...c,isEnrolled:enrollments.some(e=>e.courseId===c.id&&!['Dropped','Cancelled'].includes(e.status))}));
    let rows=all.filter(c=>(!term||[c.title,c.category,c.description,c.instructorName,c.organizationName].some(v=>String(v||'').toLowerCase().includes(term)))&&(!query.category||c.category===query.category)&&(!query.level||c.level===query.level)&&(!query.organizationId||c.organizationId===query.organizationId)&&(!query.price||query.price==='free'&&c.price===0||query.price==='paid'&&Number(c.price)>0)&&(!query.enrollment||query.enrollment==='enrolled'&&c.isEnrolled||query.enrollment==='available'&&!c.isEnrolled));
    const sorts={newest:(a:any,b:any)=>(Date.parse(b.createdAt)||0)-(Date.parse(a.createdAt)||0),'price-low':(a:any,b:any)=>(a.price??Infinity)-(b.price??Infinity),'price-high':(a:any,b:any)=>(b.price??-Infinity)-(a.price??-Infinity),rating:(a:any,b:any)=>(b.rating??-1)-(a.rating??-1),popular:(a:any,b:any)=>b.enrolledCount-a.enrolledCount};
    rows.sort(sorts[query.sort]||sorts.newest);const limit=Math.min(48,Math.max(1,Number(query.limit)||9));const totalPages=Math.max(1,Math.ceil(rows.length/limit));const page=Math.min(totalPages,Math.max(1,Number(query.page)||1));
    return {items:rows.slice((page-1)*limit,page*limit),total:rows.length,availableCourses:all.length,page,totalPages,facets:{categories:[...new Set(all.map(c=>c.category).filter(Boolean))].sort(),levels:[...new Set(all.map(c=>c.level).filter(Boolean))].sort(),organizations:[...new Map(all.filter(c=>c.organizationId&&c.organizationName).map(c=>[c.organizationId,{id:c.organizationId,name:c.organizationName}])).values()]}};
  }

  async getCatalogCourse(courseId: string) {
    const course = (await this.enrichedCourses()).find(c=>c.id===courseId);
    if (!this.isAvailable(course)||!course?.instructors?.length) throw new NotFoundException(`Course '${courseId}' is not available`);
    return course;
  }

  async getEnrollments(userId: string) {
    const learner = await this.resolveLearner(userId);
    const aliases=[learner.id,learner.userId,userId].filter(Boolean);
    const [enrollments,courses,payments]=await Promise.all([
      this.enrollmentsRepo.find(),this.enrichedCourses(),this.getPayments(userId),
    ]);
    const result=[];
    const seen=new Set<string>();
    for(const enr of enrollments){
      if(!aliases.includes(enr.learnerId)&&!aliases.includes(enr.userId))continue;
      const course=courses.find(c=>c.id===enr.courseId);
      if(!this.isAvailable(course)||!['Active','Completed'].includes(enr.status))continue;
      if(seen.has(course.id))continue;
      seen.add(course.id);
      const normalized=enrollmentLearning(course,enr);
      const payment=payments.find(p=>p.courseId===course.id&&completedPaymentStatus(p.status));
      if(Number(course.price)>0&&!payment)continue;
      result.push({...normalized,contentAvailable:true,courseStatus:course.status,courseTitle:course.title,
        category:course.category,description:course.description,thumbnail:course.thumbnail,
        institution:course.organizationName||'',instructorName:course.leadInstructorName||course.instructorName||'',
        paymentId:payment?.id||null,paymentStatus:payment?.status||null});
    }
    return result;
  }

  async getEnrollmentForCourse(userId: string, courseId: string) {
    const all = await this.getEnrollments(userId);
    const enrollment = all.find((e) => e.courseId === courseId);
    if (!enrollment) throw new NotFoundException('You are not enrolled in this course');
    return enrollment;
  }

  private async createEnrollment(learner: any, course: any) {
    const now = new Date();
    const enrollment = await this.enrollmentsRepo.create({
      id: `enr-${Date.now()}`,
      learnerId: learner.id,
      learnerName: learner.name,
      learnerEmail: learner.email,
      courseId: course.id,
      courseTitle: course.title,
      organizationId: course.organizationId || null,
      instructorId: course.instructorId || course.instructors?.[0]?.id || null,
      enrolledDate: now.toISOString().split('T')[0],
      enrolledAt: now.toISOString(),
      progress: 0,
      status: 'Active',
      completedLessons: [],
      lastAccessedAt: null,
    });

    await this.coursesRepo.update(course.id, {enrolledCount:await this.enrollmentsRepo.count({courseId:course.id})});
    if((await this.orgsRepo.find()).length)await this.organizationService.syncCounts();
    return enrollment;
  }

  private async assertNotEnrolled(learnerId: string, courseId: string) {
    const existing = await this.enrollmentsRepo.findOne({ learnerId, courseId });
    if (existing) throw new ConflictException('You are already enrolled in this course');
  }

  async enrollCourse(userId: string, courseId: string) {
    return this.db.runTransaction(async()=>{
    const learner = await this.resolveLearner(userId);
    const course = await this.getCatalogCourse(courseId);
    if (Number(course.price) > 0) {
      throw new BadRequestException('This is a paid course. Complete checkout to enroll.');
    }
    await this.assertNotEnrolled(learner.id, course.id);
    return this.createEnrollment(learner, course);
    });
  }

  async updateProgress(userId: string, enrollmentId: string, lessonId: string, completed: boolean) {
    return this.db.runTransaction(async()=>{
    const learner = await this.resolveLearner(userId);
    const enrollment = await this.enrollmentsRepo.findById(enrollmentId);
    if (!enrollment) throw new NotFoundException(`Enrollment '${enrollmentId}' not found`);
    if (enrollment.learnerId !== learner.id) throw new ForbiddenException('Not your enrollment');

    const course = await this.coursesRepo.findById(enrollment.courseId);
    if (!course) throw new NotFoundException(`Course '${enrollment.courseId}' not found`);

    const lessonIds = this.lessonIdsFor(course);
    const targetLessonId = String(lessonId);
    if (!lessonIds.includes(targetLessonId)) {
      throw new BadRequestException(`Lesson '${lessonId}' does not belong to course '${course.title}'`);
    }

    const done = new Set<string>(
      (enrollment.completedLessons || []).map(String).filter((id: string) => lessonIds.includes(id))
    );
    if (completed) {
      done.add(targetLessonId);
    } else {
      done.delete(targetLessonId);
    }

    const completedLessons = Array.from(done);
    const totalLessons = lessonIds.length;
    const progress = totalLessons > 0 ? Math.min(100, Math.max(0, Math.round((completedLessons.length / totalLessons) * 100))) : 0;
    const nowCompleted = progress >= 100;
    const now = new Date().toISOString();

    await this.enrollmentsRepo.update(enrollmentId, {
      completedLessons,
      progress,
      status: nowCompleted ? 'Completed' : 'Active',
      lastAccessedAt: now,
      ...(nowCompleted && enrollment.status !== 'Completed' ? { completedAt: now } : {}),
    });

    if (nowCompleted) {
      await this.issueCertificate(learner, enrollment, course);
    }

    return this.getEnrollmentForCourse(userId, enrollment.courseId);
    });
  }

  private async issueCertificate(learner: any, enrollment: any, course: any) {
    const existing = await this.certificatesRepo.findOne({ learnerId: learner.id, courseId: course.id });
    if (existing) return existing;

    const tag = course.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const credentialId = `NX-${tag}-${Math.floor(100000 + Math.random() * 900000)}`;
    const issuedAt = new Date();

    const cert = await this.certificatesRepo.create({
      id: `cert-${Date.now()}`,
      learnerId: learner.id,
      learnerName: learner.name,
      courseId: course.id,
      courseTitle: course.title,
      institution: course.organizationName || '',
      organizationId: course.organizationId || null,
      instructorName: course.leadInstructorName || course.instructorName || '',
      category: course.category || '',
      skills: (course.modules || []).map((m: any) => m.title).slice(0, 4),
      issueDate: issuedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      issuedAt: issuedAt.toISOString(),
      credentialId,
      status: 'Verified',
      grade: 'Completed',
    });

    await this.enrollmentsRepo.update(enrollment.id, { certificateId: cert.credentialId });
    await this.notifsRepo.create({
      title: 'Course Completed',
      desc: `${learner.name} completed "${course.title}" and received a certificate.`,
      time: 'Just now',
      category: 'Certificate',
      read: false,
      color: 'green',
      learnerId: learner.id,
    });
    return cert;
  }

  async getCertificates(userId:string){const learner=await this.resolveLearner(userId);const [certs,courses,orgs,teachers]=await Promise.all(['certificates','courses','organizations','instructors'].map(n=>this.db.getCollection<any>(n)));const aliases=[learner.id,learner.userId,userId].filter(Boolean);const completed=await this.getEnrollments(userId);return certs.filter(c=>aliases.includes(c.learnerId)&&completed.some(e=>e.courseId===c.courseId&&e.status==='Completed'&&Number(e.progress)===100)).map(c=>{const course=courses.find(course=>course.id===c.courseId);return {...c,learnerName:learner.name,learnerEmail:learner.email,courseTitle:course?.title||c.courseTitle,institution:orgs.find(o=>o.id===(course?.organizationId||c.organizationId))?.name||c.institution||null,instructorName:teachers.find(i=>i.id===course?.instructorId)?.name||c.instructorName||null};});}

  async downloadCertificate(userId:string,id:string){
    const certificate=(await this.getCertificates(userId)).find(c=>c.id===id||c.credentialId===id);
    if(!certificate)throw new NotFoundException('Certificate not found in your completed courses.');
    const filename=`Acadex-${String(certificate.credentialId||certificate.id).replace(/[^a-zA-Z0-9_-]/g,'-')}.pdf`;
    return {filename,mimeType:'application/pdf',content:certificatePdf(certificate).toString('base64')};
  }

  async getPayments(userId:string){const learner=await this.resolveLearner(userId);const aliases=[learner.id,learner.userId,userId].filter(Boolean);return (await paymentRecords(this.db)).filter(t=>t.type==='Payment'&&(aliases.includes(t.payerId)||aliases.includes(t.learnerId)||aliases.includes(t.userId)||t.payerEmail&&t.payerEmail.toLowerCase()===learner.email?.toLowerCase()));}
  async billing(userId:string,query:any={}){
    const all=await this.getPayments(userId);const completed=all.filter(p=>completedPaymentStatus(p.status));const term=String(query.search||'').trim().toLowerCase();
    const rows=all.filter(p=>(!term||[p.id,p.reference,p.course,p.organizationName,p.method].some(v=>String(v||'').toLowerCase().includes(term)))&&(!query.status||p.status===query.status)&&(!query.organizationId||p.organizationId===query.organizationId)&&(!query.year||String(new Date(p.createdAt||p.date).getFullYear())===String(query.year)));
    const totals=[...new Set(completed.map(p=>p.currency))].map(currency=>({currency,amount:Math.round(completed.filter(p=>p.currency===currency).reduce((sum,p)=>sum+(p.amount||0),0)*100)/100}));
    const limit=Math.min(48,Math.max(1,Number(query.limit)||12));const totalPages=Math.max(1,Math.ceil(rows.length/limit));const page=Math.min(totalPages,Math.max(1,Number(query.page)||1));
    return {items:rows.slice((page-1)*limit,page*limit),total:rows.length,page,totalPages,facets:{statuses:[...new Set(all.map(p=>p.status).filter(Boolean))].sort(),organizations:[...new Map(all.filter(p=>p.organizationId&&p.organizationName).map(p=>[p.organizationId,{id:p.organizationId,name:p.organizationName}])).values()],years:[...new Set(all.map(p=>new Date(p.createdAt||p.date).getFullYear()).filter(Number.isFinite))].sort((a,b)=>b-a)},summary:{totalPaid:totals.length<=1?totals[0]?.amount||0:null,totals,completedPayments:completed.length,pendingPayments:all.filter(p=>String(p.status).toLowerCase()==='pending').length,transactions:all.length,currency:totals.length===1?totals[0].currency:'INR'}};
  }
  async receipt(userId:string,id:string){const rows=await this.getPayments(userId);const payment=rows.find(p=>p.id===id);if(!payment)throw new NotFoundException('Payment record not found in your account.');return payment;}
  async content(userId:string,courseId:string){const enrollment=await this.getEnrollmentForCourse(userId,courseId);const course=await this.coursesRepo.findById(courseId);if(!course)throw new NotFoundException('This course is no longer available. Your enrollment and payment history are retained.');const quizzes=await this.db.getCollection<any>('quizzes');const assessment=quizzes.filter(q=>q.courseId===courseId&&q.status==='Published').sort((a,b)=>(Date.parse(b.updatedAt||b.createdAt)||0)-(Date.parse(a.updatedAt||a.createdAt)||0))[0];return {course:{...course,...(await this.enrichedCourses()).find(c=>c.id===courseId)},enrollment,lessons:this.lessonsFor(course),assessment:assessment?{id:assessment.id,title:assessment.title}:null};}
  async myDisputes(userId:string){await this.resolveLearner(userId);return this.disputes.findMy(userId);}
  async dispute(userId:string,id:string){const found=(await this.myDisputes(userId)).find(d=>d.id===id);if(!found)throw new NotFoundException('Support request not found in your account.');return found;}
  disputeCategories(){return ['Course content','Course access','Payment','Certificate','Technical issue','Account','Other'];}
  async createDispute(userId:string,body:any){const learner=await this.resolveLearner(userId);if(!String(body.subject||'').trim()||!String(body.description||'').trim())throw new BadRequestException('Subject and description are required.');const category=body.category||'Other';if(!this.disputeCategories().includes(category))throw new BadRequestException('Choose a valid issue category.');if(body.courseId)await this.getEnrollmentForCourse(userId,body.courseId);return this.disputes.create({category,disputeType:category,subject:String(body.subject).trim(),description:String(body.description).trim(),courseId:body.courseId||undefined,raisedBy:learner.name,raisedById:learner.id,learnerId:learner.id,raisedByRole:'Student'} as any);}
  async comment(userId:string,id:string,body:any){const learner=await this.resolveLearner(userId);await this.dispute(userId,id);const message=String(body.message||'').trim();if(!message)throw new BadRequestException('Enter a message.');return this.disputes.addComment(id,{author:learner.name,message,isAdmin:false});}
  async recordEngagement(userId:string,courseId:string,body:any){const learner=await this.resolveLearner(userId);const enrollment=await this.getEnrollmentForCourse(userId,courseId);const course=await this.coursesRepo.findById(courseId);if(!course||!this.lessonIdsFor(course).includes(String(body.lessonId)))throw new BadRequestException('Choose a published course lesson.');const seconds=Number(body.seconds);if(!Number.isInteger(seconds)||seconds<1||seconds>30)throw new BadRequestException('Activity duration must be between 1 and 30 seconds.');await new JsonRepository<any>('learning_activity',this.db).create({learnerId:learner.id,enrollmentId:enrollment.id,courseId,lessonId:body.lessonId,seconds,createdAt:new Date().toISOString()});return {recorded:true};}
  private async quizRecord(userId:string,courseId:string){
    await this.getEnrollmentForCourse(userId,courseId);
    const [quizzes,questions]=await Promise.all(['quizzes','quiz_questions'].map(n=>this.db.getCollection<any>(n)));
    const quiz=quizzes.filter(q=>q.courseId===courseId&&q.status==='Published').sort((a,b)=>(Date.parse(b.updatedAt||b.createdAt)||0)-(Date.parse(a.updatedAt||a.createdAt)||0))[0];
    if(!quiz)throw new NotFoundException('No published assessment is available for this course.');
    const rows=questions.filter(q=>q.quizId===quiz.id).sort((a,b)=>(a.sequenceNumber||0)-(b.sequenceNumber||0));
    if(!rows.length)throw new NotFoundException('This assessment does not have any published questions yet.');
    if(!Number.isFinite(Number(quiz.passingScore)))throw new BadRequestException('The assessment passing score has not been configured.');
    return {quiz,questions:rows};
  }
  async assessment(userId:string,courseId:string){const {quiz,questions}=await this.quizRecord(userId,courseId);const course=await this.coursesRepo.findById(courseId);return {id:quiz.id,courseId,title:quiz.title,description:quiz.description||null,courseTitle:course?.title||null,durationMinutes:quiz.durationMinutes??null,passingScore:quiz.passingScore,questions:questions.map(q=>({id:q.id,text:q.questionText||q.text||q.question,options:Array.isArray(q.options)?q.options.map(o=>typeof o==='string'?o:o.text||o.title):[q.optionA,q.optionB,q.optionC,q.optionD].filter(v=>v!==undefined&&v!==null&&v!=='')}))};}
  async submitAssessment(userId:string,courseId:string,body:any){const learner=await this.resolveLearner(userId);const {quiz,questions}=await this.quizRecord(userId,courseId);if(body.quizId!==quiz.id)throw new ConflictException('The assessment has changed. Reload it before submitting.');if(!body.answers||typeof body.answers!=='object'||Array.isArray(body.answers))throw new BadRequestException('Assessment answers are required.');let correct=0;const feedback=questions.map(q=>{const options=Array.isArray(q.options)?q.options:[];const correctIndex=Number.isInteger(q.correctAnswer)?q.correctAnswer:options.some(o=>o&&o.isCorrect)?options.findIndex(o=>o.isCorrect):'ABCD'.indexOf(String(q.correctOption||'').toUpperCase());if(correctIndex<0)throw new BadRequestException('The assessment answer key is incomplete.');const selected=body.answers[q.id];const isCorrect=Number.isInteger(selected)&&selected===correctIndex;if(isCorrect)correct++;return {questionId:q.id,selected:selected??null,correctIndex,isCorrect,...(quiz.showExplanations?{explanation:q.explanation||null}:{})};});const score=Math.round(correct/questions.length*100);const attempt=await new JsonRepository<any>('quiz_attempts',this.db).create({quizId:quiz.id,courseId,learnerId:learner.id,answers:body.answers,score,passed:score>=Number(quiz.passingScore),correctCount:correct,totalQuestions:questions.length,submittedAt:new Date().toISOString()});return {id:attempt.id,score:attempt.score,passed:attempt.passed,correctCount:correct,totalQuestions:questions.length,passingScore:quiz.passingScore,submittedAt:attempt.submittedAt,feedback};}

  async checkout(userId: string, dto: StudentCheckoutDto) {
    return this.db.runTransaction(async()=>{
    const learner = await this.resolveLearner(userId);
    const course = await this.getCatalogCourse(dto.courseId);

    const existing=await this.enrollmentsRepo.findOne({learnerId:learner.id,courseId:course.id});
    const priorPayment=(await this.getPayments(userId)).find(p=>p.courseId===course.id&&completedPaymentStatus(p.status));
    if(priorPayment||(existing&&Number(course.price)===0)){
      const enrollment=existing||await this.createEnrollment(learner,course);
      return {success:true,alreadyEnrolled:!!existing,restoredAccess:!existing,transactionId:priorPayment?.id||null,enrollmentId:enrollment.id,courseId:course.id,courseTitle:course.title,amount:priorPayment?.amount??null,method:priorPayment?.method||null,date:priorPayment?.createdAt||priorPayment?.date||null};
    }

    const method = String(dto.paymentMethod || '').toLowerCase();
    if (!PAYMENT_METHODS.includes(method)) {
      throw new BadRequestException('Payment method must be card or upi');
    }
    if (method === 'upi' && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(dto.upiId || '')) {
      throw new BadRequestException('A valid UPI ID is required (e.g. name@bank)');
    }

    const sanitizedLast4 = String(dto.cardLast4 || '').replace(/\D/g, '').slice(-4);
    if (method === 'card' && !/^\d{4}$/.test(sanitizedLast4)) {
      throw new BadRequestException('Card details are incomplete or invalid');
    }

    const now = new Date().toISOString();
    const methodLabel = method === 'upi' ? `UPI (${dto.upiId})` : `Card •••• ${sanitizedLast4}`;
    const transaction = await this.transactionsRepo.create({
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'Payment',
      payerId: learner.id,
      payer: learner.name,
      courseId: course.id,
      course: course.title,
      organizationId: course.organizationId || null,
      organizationName: course.organizationName || null,
      amount: Number(course.price) || 0,
      currency: course.currency || (await this.settingsRepo.find())[0]?.defaultCurrency || null,
      method: methodLabel,
      date: now,
      status: 'Completed',
      createdAt: now,
      updatedAt: now,
    });

    const enrollment = existing || await this.createEnrollment(learner, course);
    await this.coursesRepo.update(course.id, {
      revenue: (course.revenue || 0) + (Number(course.price) || 0),
    });

    return {
      success: true,
      transactionId: transaction.id,
      enrollmentId: enrollment.id,
      courseId: course.id,
      courseTitle: course.title,
      amount: transaction.amount,
      method: methodLabel,
      date: now,
    };
    });
  }
}
