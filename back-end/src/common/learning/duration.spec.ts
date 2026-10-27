import {durationMinutes,formatDuration,courseDuration} from './duration';
describe('Shared course duration',()=>{
 it.each([[12,12],['00:12',0.2],['01:30',1.5],['01:02:30',62.5],['1h 30m',90],['12 sec',0.2]])('normalizes %s', (input,expected)=>expect(durationMinutes(input)).toBeCloseTo(Number(expected)));
 it('sums numeric and clock values without concatenating strings',()=>{
  const c=courseDuration({modules:[{items:[{duration:'00:12'},{duration:2}]},{lessons:[{duration:'01:30'}]}]});
  expect(c.durationMinutes).toBeCloseTo(3.7);expect(c.duration).toBe('3 min 42 sec');expect(formatDuration('00:12')).toBe('12 sec');
 });
});
