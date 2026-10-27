// One certificate projection for learner, administrator, verification and PDF views.
export function certificateRecord(cert:any,records:{learners:any[];courses:any[];organizations:any[];instructors:any[]}){
 const learner=records.learners.find(l=>l.id===cert.learnerId||l.userId===cert.learnerId);
 const course=records.courses.find(c=>c.id===cert.courseId);
 const organization=records.organizations.find(o=>o.id===(course?.organizationId||cert.organizationId));
 const instructor=records.instructors.find(i=>i.id===course?.instructorId&&i.organizationId===course?.organizationId);
 const learnerName=learner?.name||cert.learnerName||cert.learner||'';
 const courseTitle=course?.title||cert.courseTitle||cert.course||'';
 return {...cert,learnerName,learner:learnerName,learnerEmail:learner?.email||cert.learnerEmail||'',courseTitle,course:courseTitle,institution:organization?.name||cert.institution||null,organizationName:organization?.name||null,instructorName:instructor?.name||cert.instructorName||null};
}
