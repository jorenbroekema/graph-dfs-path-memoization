import { DirectedGraph } from 'graphology';
import { random } from 'graphology-layout';
import forceAtlas2 from 'graphology-layout-forceatlas2';

import Sigma from 'sigma';

const graph = new DirectedGraph();
['A', 'B', 'C', 'D', 'D1', 'D2', 'D3', 'E', 'F', 'G'].map((node) =>
	graph.addNode(node, { label: node, size: 20, color: node === 'A' ? 'teal' : 'salmon' }),
);
random.assign(graph);

graph.addDirectedEdgeWithKey('B->A', 'B', 'A', { size: 8 });
graph.addDirectedEdgeWithKey('C->B', 'C', 'B', { size: 8 });
graph.addDirectedEdgeWithKey('E->B', 'E', 'B', { size: 8 });
graph.addDirectedEdgeWithKey('F->B', 'F', 'B', { size: 8 });
graph.addDirectedEdgeWithKey('C->G', 'C', 'G', { size: 8 });
graph.addDirectedEdgeWithKey('D->C', 'D', 'C', { size: 8 });
graph.addDirectedEdgeWithKey('D1->D', 'D1', 'D', { size: 8 });
graph.addDirectedEdgeWithKey('D2->D1', 'D2', 'D1', { size: 8 });
graph.addDirectedEdgeWithKey('D3->D2', 'D3', 'D2', { size: 8 });
graph.addDirectedEdgeWithKey('D->F', 'D', 'F', { size: 8 });
graph.addDirectedEdgeWithKey('G->A', 'G', 'A', { size: 8 });

// @ts-expect-error types are messed up..
forceAtlas2.assign(graph, { iterations: 1000 });

new Sigma(graph, document.getElementById('graphEl')!, {
	renderEdgeLabels: false,
	defaultEdgeType: 'arrow', // ← draws arrowheads
});
