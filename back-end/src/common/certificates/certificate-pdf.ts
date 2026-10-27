// A single-page PDF built from the authorized certificate record, with no browser print dialog.
export function certificatePdf(certificate:any):Buffer {
 const width=842,height=595;
 const text=(value:any)=>String(value??'').replace(/[\r\n\t]/g,' ').replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
 const commands:string[]=['0.985 0.989 0.976 rg',`0 0 ${width} ${height} re f`,'0.79 0.85 0.73 RG','1.2 w','28 28 786 539 re S','0.18 0.34 0.23 rg','28 487 786 80 re f'];
 function line(value:any,y:number,size:number,bold=false,color='0.18 0.29 0.19'){
  const label=String(value??'');
  const units=[...label].reduce((sum,char)=>sum+(/[ilI.,' :]/.test(char)?0.25:/[MW@]/.test(char)?0.85:/[A-Z]/.test(char)?0.65:0.5),0);
  const x=Math.max(48,(width-units*size)/2);
  commands.push(`${color} rg`,`BT /${bold?'F2':'F1'} ${size} Tf ${x.toFixed(2)} ${y} Td (${text(label)}) Tj ET`);
 }
 function wrap(value:any,limit:number){const words=String(value??'').split(/\s+/);const lines:string[]=[];let current='';for(const word of words){if(current&&current.length+word.length+1>limit){lines.push(current);current=word;}else current+=(current?' ':'')+word;}if(current)lines.push(current);return lines;}
 line('ACADEX',523,24,true,'1 1 1');
 line('CERTIFICATE OF COMPLETION',427,29,true);
 line(certificate.institution||certificate.organizationName||'Acadex',395,13);
 line('Awarded to',353,12,false,'0.40 0.47 0.36');
 let y=319;
 for(const part of wrap(certificate.learnerName||'Learner',48)){line(part,y,27,true);y-=32;}
 if(certificate.learnerEmail){line(certificate.learnerEmail,y+8,11);y-=17;}
 line('for completing',y-17,12,false,'0.40 0.47 0.36');y-=50;
 for(const part of wrap(certificate.courseTitle||certificate.title||'Course',58)){line(part,y,22,true);y-=27;}
 if(certificate.instructorName)line(`Instructor: ${certificate.instructorName}`,Math.min(y-14,137),11);
 const issued=certificate.issuedAt||certificate.issueDate;
 const parsed=issued?new Date(issued):null;
 const date=parsed&&!Number.isNaN(parsed.getTime())?parsed.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}):issued;
 if(date)line(`Issued: ${date}`,93,11);
 line(`Credential: ${certificate.credentialId||certificate.id}`,68,10);
 const content=Buffer.from(commands.join('\n'),'latin1');
 const objects=[
  Buffer.from('<< /Type /Catalog /Pages 2 0 R >>'),
  Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
  Buffer.from(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`),
  Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),
  Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'),
  Buffer.concat([Buffer.from(`<< /Length ${content.length} >>\nstream\n`),content,Buffer.from('\nendstream')]),
 ];
 const chunks=[Buffer.from('%PDF-1.4\n')];const offsets=[0];let position=chunks[0].length;
 objects.forEach((object,index)=>{offsets.push(position);const chunk=Buffer.concat([Buffer.from(`${index+1} 0 obj\n`),object,Buffer.from('\nendobj\n')]);chunks.push(chunk);position+=chunk.length;});
 const xref=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(offset=>String(offset).padStart(10,'0')+' 00000 n \n').join('')}trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${position}\n%%EOF\n`;
 return Buffer.concat([...chunks,Buffer.from(xref)]);
}
