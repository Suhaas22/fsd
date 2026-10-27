export function assignedInstructorIds(course:any):string[]{
 return [...new Set([course?.instructorId,...(Array.isArray(course?.instructors)?course.instructors.map(i=>typeof i==='string'?i:i?.id):[]),...(Array.isArray(course?.coInstructorIds)?course.coInstructorIds:[])].filter(id=>typeof id==='string'&&id.length>0))];
}
export function isAssignedInstructor(course:any,actor:any){return actor?.canonicalRole==='instructor'&&Boolean(actor.organizationId)&&actor.organizationId===course?.organizationId&&assignedInstructorIds(course).some(id=>(actor.aliases||[]).includes(id));}
