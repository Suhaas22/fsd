import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { mkdtemp, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import request = require('supertest');
import { AppModule } from '../../app.module';
import { JsonDatabaseService } from '../../database/json-db.service';
import { CourseWorkflowService } from './course-workflow.service';
import { WorkspaceService } from '../platform/workspace.service';

describe('Uploaded lesson video delivery', () => {
  let app: INestApplication, db: JsonDatabaseService, directory: string;
  let previousDir: string | undefined, previousMode: string | undefined, previousUpload: string | undefined;
  beforeAll(async () => {
    previousDir = process.env.DATA_DIR; previousMode = process.env.DATA_STORAGE_MODE; previousUpload = process.env.COURSE_UPLOAD_DIR;
    directory = await mkdtemp(join(tmpdir(), 'acadex-video-'));
    process.env.DATA_DIR = join(directory, 'data');
    process.env.DATA_STORAGE_MODE = 'memory';
    process.env.COURSE_UPLOAD_DIR = directory;
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    (app as any).useStaticAssets(directory, { prefix: '/uploads/' });
    app.setGlobalPrefix('api');
    await app.listen(0, '127.0.0.1');
    db = app.get(JsonDatabaseService);
    for (const [collection, rows] of Object.entries({
      users: [{id:'teacher',role:'Instructor',status:'Active',email:'teacher@test.in'}, {id:'owner',role:'Organization',status:'Active',email:'owner@test.in'}, {id:'student',role:'Student',status:'Active',email:'student@test.in'}],
      instructors: [{id:'i',userId:'teacher',organizationId:'org',status:'Active',email:'teacher@test.in'}],
      organizations: [{id:'org',userId:'owner',status:'Active',email:'owner@test.in'}],
      learners: [{id:'learner',userId:'student',status:'Active',email:'student@test.in'}],
      courses: [{id:'course',title:'Video course',instructorId:'i',organizationId:'org',status:'Published',price:0,modules:[]}],
      enrollments: [{id:'enrollment',learnerId:'learner',courseId:'course',status:'Active',progress:0}],
      module_requests: [], curriculum_drafts: [], quizzes: [], notifications: [],
    })) await db.setCollection(collection, rows);
  });
  afterAll(async () => {
    await app?.close();
    for (const [key, value] of Object.entries({DATA_DIR:previousDir,DATA_STORAGE_MODE:previousMode,COURSE_UPLOAD_DIR:previousUpload})) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    await rm(directory, {recursive:true, force:true});
  });
  it('uploads actual MP4 bytes, serves seekable video, and exposes only approved content to learners', async () => {
    const sample = resolve(__dirname, '../../..', 'uploads/course-demo.mp4');
    const bytes = await readFile(sample);
    const uploaded = await request(app.getHttpServer()).post('/api/courses/course/upload')
      .set('x-user-id','teacher').attach('file', sample).expect(201);
    const media = uploaded.body.data;
    expect(media.path).toMatch(/^\/uploads\/.+\.mp4$/);
    expect(await readFile(join(directory, media.filename))).toEqual(bytes);
    const video = await request(app.getHttpServer()).get(media.path).expect(200);
    expect(video.headers['content-type']).toMatch(/video\/mp4/);
    expect(video.body).toEqual(bytes);
    const partial = await request(app.getHttpServer()).get(media.path).set('Range','bytes=0-1023').expect(206);
    expect(partial.headers['content-range']).toBe(`bytes 0-1023/${bytes.length}`);
    expect(partial.body).toEqual(bytes.subarray(0,1024));
    const workflow = app.get(CourseWorkflowService), workspace = app.get(WorkspaceService);
    const modules = [{id:'module',title:'Introduction',items:[{id:'video',title:'Uploaded lesson',type:'Video',videoUrl:media.path,url:media.path,duration:0.2}]}];
    const pending = await workflow.request('course',{modules},await workspace.identity({'x-user-id':'teacher'}));
    const before = await request(app.getHttpServer()).get('/api/student/courses/course/content').set('x-user-id','student').expect(200);
    expect(JSON.stringify(before.body)).not.toContain(media.path);
    await workflow.decide(pending.id,{decision:'approve'},await workspace.identity({'x-user-id':'owner'}));
    const content = await request(app.getHttpServer()).get('/api/student/courses/course/content').set('x-user-id','student').expect(200);
    expect(JSON.stringify(content.body)).toContain(media.path);
  });
  it('rejects a learner upload before writing a file', async () => {
    await request(app.getHttpServer()).post('/api/courses/course/upload').set('x-user-id','student')
      .attach('file', Buffer.from('not a video'), 'video.mp4').expect(403);
  });
});
