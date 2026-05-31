import type { DirectedGraph } from 'graphology';

const pathStrSep = '->';

export function findDependents(graph: DirectedGraph, source: string) {
	// flow-through paths to source, e.g. B -> [C-B-A (C), F-B-A (F)]
	// we make use of this memo store so we don't have to traverse down paths
	// that we've been to before already, but still allow us to add to the different paths
	// that X is dependent on source.
	const memos: Map<string, Map<string, string>> = new Map();
	const results: Map<string, Set<string>> = new Map();
	let recurseCycles = 0;

	const addToResults = (key: string, p: string) => {
		const existing = results.get(key);
		if (existing) {
			if (!existing.has(p)) {
				existing.add(p);
			}
		} else {
			results.set(key, new Set([p]));
		}
		return existing !== undefined;
	};

	const recurse = (node: string, visited = new Set(), depth = 0) => {
		if (visited.has(node)) {
			console.log('cycle!', node);
			return; // cycle guard
		}
		recurseCycles++;
		visited = new Set([node, ...visited]);

		const logInEdges: string[] = [];
		graph.filterInEdges(node, (edge: string) => {
			logInEdges.push(graph.getEdgeAttributes(edge)['from']);
		});

		console.log(
			`[${depth}] recursing for ${node}, in: {${logInEdges.join(',')}} | [${[...visited]}]`,
		);

		graph.filterInEdges(node, (edge: string) => {
			let shouldRecurse = true;
			const { from } = graph.getEdgeAttributes(edge);
			const path = [from, ...Array.from(visited)];
			const pathStr = path.join(pathStrSep);
			const exists = addToResults(from, pathStr);

			// we've already been to this node..
			// so we take the memo route instead
			if (exists) {
				// console.log(`    from: ${from} - path: ${path}`);
				shouldRecurse = false;
				// check if there are any paths to source flowing through node
				if (memos.has(from)) {
					const memo = memos.get(from)!;
					memo.forEach((nPathStr, n) => {
						const nPath = nPathStr.split(pathStrSep);

						// extract subPath from the memo path
						const subPathIndex = nPath.indexOf(from);
						if (subPathIndex > -1) {
							// memo'd path up until our "from" node
							// from there we insert our current path
							const newPath = [...nPath.slice(0, subPathIndex), ...path];
							const newPathStr = newPath.join(pathStrSep);
							// console.log(`    add to results via memo ${n}    ${newPathStr}`);
							addToResults(n, newPathStr);
						}
					});
				}
			}

			// Add to our memo store about flow-through paths
			// we dont care about direct connections, just transitive..
			if (path.length > 2) {
				path.slice(1, path.length - 1).forEach((p) => {
					// store the fact that we have a path to source, going through this node
					const memo = memos.get(p);
					if (!memo) {
						memos.set(p, new Map([[from, pathStr]]));
					} else if (!memo.has(pathStr)) {
						memo.set(from, pathStr);
					}
				});
			}

			if (shouldRecurse) {
				recurse(from, visited, depth + 1);
			} else {
				// console.log(`    dont recurse further for ${from}`);
			}
		});
	};
	recurse(source);

	console.log(`dependents of ${source}:`, results);
	// console.log(memos);
	console.log('cycles:', recurseCycles);
}
