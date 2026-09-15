import type { DirectedGraph } from 'graphology';

const pathStrSep = '->';

export function findDependents(graph: DirectedGraph, source: string, memo = true) {
	// flow-through paths to source, e.g. for B -> [C-B-A (C), F-B-A (F), D1-D-F-B-A (D1-D-F)]
	// we make use of this memo store so we don't have to traverse down paths
	// that we've been to before already, but still allow us to add to the different paths
	// that X is dependent on source.
	const memos: Map<string, Map<string, string>> = new Map();
	const results: Map<string, Set<string>> = new Map();
	let recurseCycles = 0;

	const addToResults = (key: string, p: string) => {
		const existing = results.get(key);
		if (existing) {
			if (!existing.has(p)) existing.add(p);
		} else {
			results.set(key, new Set([p]));
		}
		return existing !== undefined;
	};

	// Keeping track of where we came from.
	// Why both a Set and an Array?
	// Set -> O(1) just for cycle checks, much better than Array.includes => O(n).
	// Array -> current path, ordered pushing and popping, much easier than backtracking on a Set/
	// which is ordered only by insertion order, not "explicitly" ordered, which means
	// it does not allow "pop last added item" without first converting it to an Array.
	// We never clone, always backtrack, because cloning is very expensive with large datasets.
	const visitedSet: Set<string> = new Set();
	const visitedStack: string[] = [];

	// Also keep a stack of the paths at this level
	// [source, source->parent, source->parent->..., source->parent->...->end]
	// this helps us not repeat spread/clone the path array for every in-edge later
	const pathStack: string[] = [];

	const recurse = (node: string, depth = 0) => {
		if (visitedSet.has(node)) {
			console.log('cycle!', node);
			return; // cycle guard
		}
		recurseCycles++;

		visitedSet.add(node);
		visitedStack.push(node);

		// push new path by prepending the last item with current node+sep
		// e.g. ['A', 'B->A']   becomes   ['A', 'B->A', 'C->B->A']
		const nodePathStr =
			pathStack.length > 0 ? `${node}${pathStrSep}${pathStack[pathStack.length - 1]}` : node;
		pathStack.push(nodePathStr);

		// additional debug traversal logs, commented out because somewhat expensive
		// const logInEdges: string[] = [];
		// graph.filterInEdges(node, (edge: string) => {
		// 	logInEdges.push(graph.source(edge));
		// });
		// console.log(
		// 	`[${depth}] recursing for ${node}, in: {${logInEdges.join(',')}} | [${[...visitedStack].reverse()}]`,
		// );

		graph.filterInEdges(node, (edge: string) => {
			let shouldRecurse = true;
			const source = graph.source(edge);

			// O(1): just prepend source onto the already-built parent path string.
			// No need for spreading current path array and adding source, keeps it fast.
			const pathStr = `${source}${pathStrSep}${nodePathStr}`;
			const exists = addToResults(source, pathStr);

			if (memo && exists) {
				shouldRecurse = false;
				if (memos.has(source)) {
					const memo = memos.get(source)!;
					memo.forEach((nPathStr, n) => {
						const nPath = nPathStr.split(pathStrSep);
						const subPathIndex = nPath.indexOf(source);
						if (subPathIndex > -1) {
							// path is only materialized here, lazily, if this branch runs => O(n)
							const path = pathStr.split(pathStrSep);
							const newPath = [...nPath.slice(0, subPathIndex), ...path];
							addToResults(n, newPath.join(pathStrSep));
						}
					});
				}
			}

			if (visitedStack.length > 1) {
				const path = pathStr.split(pathStrSep);
				path.slice(1, path.length - 1).forEach((p) => {
					const memo = memos.get(p);
					if (!memo) {
						memos.set(p, new Map([[source, pathStr]]));
					} else if (!memo.has(pathStr)) {
						memo.set(source, pathStr);
					}
				});
			}

			if (shouldRecurse) recurse(source, depth + 1);
		});

		// backtrack — undo exactly what we did on entry, so sibling
		// branches processed by our caller see a clean ancestor chain
		visitedSet.delete(node);
		visitedStack.pop();
		pathStack.pop();
	};

	recurse(source);

	console.log(`dependents of ${source}:`, results);
	console.log(memos);
	console.log('cycles:', recurseCycles);
}
