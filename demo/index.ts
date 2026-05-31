import { DirectedGraph } from 'graphology';
import { random } from 'graphology-layout';
import forceAtlas2 from 'graphology-layout-forceatlas2';

import Sigma from 'sigma';

const graph = new DirectedGraph();
['A', 'B', 'C', 'D', 'D1', 'D2', 'D3', 'E', 'F', 'G'].map((node) =>
	graph.addNode(node, { label: node, size: 20, color: node === 'A' ? 'teal' : 'salmon' }),
);
random.assign(graph);

graph.addDirectedEdgeWithKey('B->A', 'B', 'A', { from: 'B', to: 'A', size: 8 });
graph.addDirectedEdgeWithKey('C->B', 'C', 'B', { from: 'C', to: 'B', size: 8 });
graph.addDirectedEdgeWithKey('E->B', 'E', 'B', { from: 'E', to: 'B', size: 8 });
graph.addDirectedEdgeWithKey('F->B', 'F', 'B', { from: 'F', to: 'B', size: 8 });
graph.addDirectedEdgeWithKey('C->G', 'C', 'G', { from: 'C', to: 'G', size: 8 });
graph.addDirectedEdgeWithKey('D->C', 'D', 'C', { from: 'D', to: 'C', size: 8 });
graph.addDirectedEdgeWithKey('D1->D', 'D1', 'D', { from: 'D1', to: 'D', size: 8 });
graph.addDirectedEdgeWithKey('D2->D1', 'D2', 'D1', { from: 'D2', to: 'D1', size: 8 });
graph.addDirectedEdgeWithKey('D3->D2', 'D3', 'D2', { from: 'D3', to: 'D2', size: 8 });
graph.addDirectedEdgeWithKey('D->F', 'D', 'F', { from: 'D', to: 'F', size: 8 });
graph.addDirectedEdgeWithKey('G->A', 'G', 'A', { from: 'G', to: 'A', size: 8 });

// @ts-expect-error types are messed up..
forceAtlas2.assign(graph, { iterations: 1000 });

new Sigma(graph, document.getElementById('graphEl')!, {
	renderEdgeLabels: false,
	defaultEdgeType: 'arrow', // ← draws arrowheads
});
