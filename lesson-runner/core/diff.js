// core/diff.js
//
// Lists the lines a solution changes from a starter, so the learner can see what to look at. The starter and the solution
// have the same lines, except where a solution adds a line. Pure functions only.

'use strict';

// The lines that differ, as { line, before, after }, numbered from 1. A line the starter does not have has an empty before,
// and a line the solution does not have has an empty after.
function changedLines(starter, solution) {
  const before = String(starter ?? '').replace(/\r\n/g, '\n').split('\n');
  const after = String(solution ?? '').replace(/\r\n/g, '\n').split('\n');
  const changes = [];
  const count = Math.max(before.length, after.length);
  for (let index = 0; index < count; index += 1) {
    const was = index < before.length ? before[index] : '';
    const now = index < after.length ? after[index] : '';
    if (was !== now) changes.push({ line: index + 1, before: was.trim(), after: now.trim() });
  }
  return changes;
}

module.exports = { changedLines };
