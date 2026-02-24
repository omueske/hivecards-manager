// tests for helper functions extracted from Queens.vue
import { describe, it, expect } from 'vitest'

describe('Queens helpers', () => {
  // replicate logic from component without mounting
  const statusColor = (s?: string) =>
    ({ active: 'positive', spare: 'info', dead: 'grey', sold: 'orange-7' }[s ?? 'spare'] ?? 'grey');

  const pastHives = (queen: any) => (queen.hiveHistory ?? []).filter((e: any) => !!e.to);

  const formatDate = (d?: string) => {
    if (!d) return '?';
    try {
      return new Date(d).toLocaleDateString('de-DE', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return d;
    }
  };

  function filteredList(queens: any[], activeFilter: string | null) {
    if (activeFilter) return queens.filter((q) => q.status === activeFilter);
    return queens;
  }

  it('statusColor returns correct color for known statuses', () => {
    expect(statusColor('active')).toBe('positive')
    expect(statusColor('dead')).toBe('grey')
    expect(statusColor('sold')).toBe('orange-7')
    expect(statusColor()).toBe('info')
  })

  it('pastHives filters entries with to field', () => {
    const arr = pastHives({ hiveHistory: [{ to: 'x' }, { from: 'y' }] })
    expect(arr.length).toBe(1)
  })

  it('formatDate handles empty and valid dates', () => {
    expect(formatDate()).toBe('?')
    const out = formatDate('2020-01-02')
    expect(out).toContain('02.')
  })

  it('filtering controlled by activeFilter', () => {
    const list = [
      { id: 1, status: 'active' },
      { id: 2, status: 'dead' },
    ]
    expect(filteredList(list, 'active')).toEqual([{ id: 1, status: 'active' }])
    expect(filteredList(list, null).length).toBe(2)
  })
})