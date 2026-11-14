import {describe,it,expect} from 'vitest';
import {ticketSchema,supportTopics,safeAttribution,safeSearchTerm,overdue} from './operations-rules';
describe('Phase 5 operational rules',()=>{
 it('supports all seven requested ticket categories',()=>expect(supportTopics).toEqual(['incorrect listing','ownership','lead quality','reviews','account access','billing','general help']));
 it('rejects incomplete support requests',()=>expect(ticketSchema.safeParse({name:'A',email:'invalid',topic:'billing',description:'short'}).success).toBe(false));
 it('keeps customer contact information out of search analytics',()=>{expect(safeSearchTerm('contact me 9876543210')).toBe('');expect(safeSearchTerm('me@example.com')).toBe('');expect(safeSearchTerm('gypsum ceiling')).toBe('gypsum ceiling');});
 it('drops personal or URL-like attribution',()=>{expect(safeAttribution('email@customer.com')).toBe('');expect(safeAttribution('https://example.com/private')).toBe('');expect(safeAttribution('winter-search')).toBe('winter-search');});
 it('marks only unresolved tickets overdue',()=>{expect(overdue('2026-11-01T00:00:00Z','open',Date.parse('2026-11-14T00:00:00Z'))).toBe(true);expect(overdue('2026-11-01T00:00:00Z','resolved',Date.parse('2026-11-14T00:00:00Z'))).toBe(false);expect(overdue(null,'open')).toBe(false);});
});
