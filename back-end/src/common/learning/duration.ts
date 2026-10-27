// Numeric lesson durations are minutes; colon strings are mm:ss or hh:mm:ss.
export function durationMinutes(value:any):number{
 if(typeof value==='number')return Number.isFinite(value)&&value>0?value:0;
 const text=String(value??'').trim().toLowerCase();if(!text)return 0;
 if(/^\d+(?::\d{1,2}){1,2}$/.test(text)){const parts=text.split(':').map(Number);return parts.length===3?parts[0]*60+parts[1]+parts[2]/60:parts[0]+parts[1]/60;}
 if(/^\d+(\.\d+)?$/.test(text))return Number(text);
 let total=0;for(const match of text.matchAll(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)/g)){const unit=match[2][0];total+=Number(match[1])*(unit==='h'?60:unit==='s'?1/60:1);}return total;
}
export function formatDuration(value:any):string{const seconds=Math.round(durationMinutes(value)*60);if(!seconds)return '0 min';const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=seconds%60;return [h?`${h}h`:'',m?`${m} min`:'',s?`${s} sec`:''].filter(Boolean).join(' ');}
export function courseDuration(course:any){const minutes=(course.modules||[]).reduce((sum:number,module:any)=>sum+(Array.isArray(module.items)?module.items:Array.isArray(module.lessons)?module.lessons:[]).reduce((n:number,item:any)=>n+durationMinutes(item?.duration),0),0);return {durationMinutes:minutes,duration:formatDuration(minutes)};}
