import { it, describe } from 'node:test';
import assert from 'node:assert';
import { DirectedGraph } from 'graphology';
import { findDependents } from '../src/index.ts';

const graph = new DirectedGraph();
['A', 'B', 'C', 'D', 'D1', 'D2', 'D3', 'E', 'F', 'G'].map((node) => graph.addNode(node));
graph.addDirectedEdgeWithKey('B->A', 'B', 'A', { from: 'B', to: 'A' });
graph.addDirectedEdgeWithKey('C->B', 'C', 'B', { from: 'C', to: 'B' });
graph.addDirectedEdgeWithKey('E->B', 'E', 'B', { from: 'E', to: 'B' });
graph.addDirectedEdgeWithKey('F->B', 'F', 'B', { from: 'F', to: 'B' });
graph.addDirectedEdgeWithKey('C->G', 'C', 'G', { from: 'C', to: 'G' });
graph.addDirectedEdgeWithKey('D->C', 'D', 'C', { from: 'D', to: 'C' });
graph.addDirectedEdgeWithKey('D1->D', 'D1', 'D', { from: 'D1', to: 'D' });
graph.addDirectedEdgeWithKey('D2->D1', 'D2', 'D1', { from: 'D2', to: 'D1' });
graph.addDirectedEdgeWithKey('D3->D2', 'D3', 'D2', { from: 'D3', to: 'D2' });
graph.addDirectedEdgeWithKey('D->F', 'D', 'F', { from: 'D', to: 'F' });
graph.addDirectedEdgeWithKey('G->A', 'G', 'A', { from: 'G', to: 'A' });

describe('graph', () => {
	it('should do whatever', () => {
		findDependents(graph, 'A');

		/**
		 * Logs as follows
		 *
		 * [0] recursing for A, in: {B,G} | [A]
		 * [1] recursing for B, in: {C,E,F} | [B,A]
		 * [2] recursing for C, in: {D} | [C,B,A]
		 * [3] recursing for D, in: {} | [D,C,B,A]
		 * [2] recursing for E, in: {} | [E,B,A]
		 * [2] recursing for F, in: {D} | [F,B,A]
		 * [3] recursing for D, in: {} | [D,F,B,A]  // <- second hit D, we should use memo
		 * [1] recursing for G, in: {C} | [G,A]
		 * [2] recursing for C, in: {D} | [C,G,A]   // <- second hit C, we should use memo
		 * [3] recursing for D, in: {} | [D,C,G,A]  // <- third hit D, we should use memo second C hit and therefore never get here
		 *
		 * Map(6) {
		 *   'B' => Set(1) { 'B-A' },
		 *   'C' => Set(2) { 'C-B-A', 'C-G-A' },                // <-- we use memo, but should still track the paths
		 *   'D' => Set(3) { 'D-C-B-A', 'D-F-B-A', 'D-C-G-A' }, // <-- we use memo, but should still track the paths
		 *   'E' => Set(1) { 'E-B-A' },
		 *   'F' => Set(1) { 'F-B-A' },
		 *   'G' => Set(1) { 'G-A' }
		 * }
		 */

		assert.strictEqual(true, true);
	});
});
