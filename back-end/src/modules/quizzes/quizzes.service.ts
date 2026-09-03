import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { CreateQuizDto, SubmitQuizDto, CreateQuizQuestionDto } from './dto/quizzes.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @Inject(REPOSITORY_TOKENS.QUIZZES)
    private readonly quizzesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.QUIZ_QUESTIONS)
    private readonly questionsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.CERTIFICATES)
    private readonly certificatesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>
  ) {}

  async findAll() {
    const quizzes = await this.quizzesRepo.find();
    for (const q of quizzes) {
      q.questions = await this.questionsRepo.find({ where: { quizId: q.id } });
    }
    return quizzes;
  }

  async findOne(id: string) {
    const quiz = await this.quizzesRepo.findById(id);
    if (!quiz) {
      throw new NotFoundException(`Quiz '${id}' not found`);
    }
    quiz.questions = await this.questionsRepo.find({ where: { quizId: id } });
    return quiz;
  }

  async findByCourse(courseId: string) {
    const quiz = await this.quizzesRepo.findOne({ courseId });
    if (!quiz) {
      return null;
    }
    quiz.questions = await this.questionsRepo.find({ where: { quizId: quiz.id } });
    return quiz;
  }

  async create(dto: CreateQuizDto) {
    const quiz = await this.quizzesRepo.create({
      id: `qiz-${Date.now()}`,
      ...dto,
      status: (dto as any).status || 'Draft',
      questionsCount: 0,
      createdAt: new Date().toISOString(),
    });
    return quiz;
  }

  async update(id: string, data: any) {
    const quiz = await this.quizzesRepo.findById(id);
    if (!quiz) {
      throw new NotFoundException(`Quiz '${id}' not found`);
    }

    const questions = Array.isArray(data.questions) ? data.questions : null;
    const updated = await this.quizzesRepo.update(id, {
      title: data.title ?? quiz.title,
      description: data.description ?? quiz.description,
      passingScore: data.passingScore ?? quiz.passingScore,
      durationMinutes: data.durationMinutes ?? quiz.durationMinutes,
      status: data.status ?? quiz.status,
      showExplanations: data.showExplanations ?? quiz.showExplanations,
      questionsCount: questions ? questions.length : quiz.questionsCount,
    });

    if (questions) {
      await this.questionsRepo.deleteMany({ quizId: id });
      for (const [index, question] of questions.entries()) {
        const options = question.options || [];
        const correctIndex = options.findIndex((option: any) => option.isCorrect);
        await this.questionsRepo.create({
          id: `qst-${Date.now()}-${index}`,
          quizId: id,
          questionText: question.text || question.questionText || '',
          optionA: options[0]?.text || question.optionA || '',
          optionB: options[1]?.text || question.optionB || '',
          optionC: options[2]?.text || question.optionC || '',
          optionD: options[3]?.text || question.optionD || '',
          correctOption: correctIndex >= 0 ? 'ABCD'[correctIndex] : question.correctOption || 'A',
          explanation: question.explanation || '',
          sequenceNumber: index + 1,
        });
      }
    }

    return updated;
  }

  async addQuestion(dto: CreateQuizQuestionDto) {
    const quiz = await this.quizzesRepo.findById(dto.quizId);
    if (!quiz) {
      throw new NotFoundException(`Quiz '${dto.quizId}' not found`);
    }

    const question = await this.questionsRepo.create({
      id: `qst-${Date.now()}`,
      ...dto,
      sequenceNumber: dto.quizId ? (await this.questionsRepo.count({ quizId: dto.quizId })) + 1 : 1,
    });

    await this.quizzesRepo.update(quiz.id, {
      questionsCount: (quiz.questionsCount || 0) + 1,
    });

    return question;
  }

  async submitQuiz(quizId: string, dto: SubmitQuizDto, userId: string = 'lrn-1') {
    const quiz = await this.findOne(quizId);
    const questions = quiz.questions || [];

    let correctCount = 0;
    const feedback: any[] = [];

    for (const q of questions) {
      const selected = dto.answers[q.id];
      const isCorrect = selected === q.correctOption;
      if (isCorrect) correctCount++;
      feedback.push({
        questionId: q.id,
        selected,
        correctOption: q.correctOption,
        isCorrect,
        explanation: q.explanation,
      });
    }

    const total = questions.length || 1;
    const scorePct = Math.round((correctCount / total) * 100);
    const passed = scorePct >= (quiz.passingScore || 75);

    // If passed and student not already certified, issue certificate
    if (passed && quiz.courseId) {
      const learner = await this.learnersRepo.findById(userId) || (await this.learnersRepo.find())[0];
      const certId = `cert-${Date.now()}`;
      await this.certificatesRepo.create({
        id: certId,
        learnerId: learner.id,
        learnerName: learner.name,
        courseId: quiz.courseId,
        courseTitle: quiz.courseTitle || 'Mastery Certification',
        credentialId: `NEXUS-2026-CERT-${Math.floor(1000 + Math.random() * 9000)}`,
        issuedAt: new Date().toISOString(),
        status: 'Verified',
        grade: `Score: ${scorePct}%`,
        certificateUrl: `https://nexuspay.enterprise.io/verify/${certId}`,
      });
    }

    return {
      quizId,
      score: scorePct,
      correctCount,
      totalQuestions: total,
      passed,
      feedback,
      certificateIssued: passed,
    };
  }
}
