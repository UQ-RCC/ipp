// src/utils/terastitcherThreshold.js

/**
 * Computes reliable/stitchable stack statistics from a TeraStitcher
 * project step result, at a given reliability threshold.
 *
 * @param {Object} result - the project step result JSON
 *   (must contain `adjacencies`, `stack_directions`, `n_stacks`)
 * @param {number} threshold - reliability threshold (0-1)
 * @returns {{ reliable: number, total: number, stitchables: number, n_stacks: number }}
 */
export function updateThresholdContents(result, threshold) {
    let total = 0
    let reliable = 0
    for (const adj of result.adjacencies) {
        total += 3
        reliable += adj.rels.filter(r => r >= threshold).length
    }

    let stitchables = 0
    for (const stack of result.stack_directions) {
        const stitchable = stack.dirs.some(rels => rels.some(r => r >= threshold))
        if (stitchable) {
            stitchables++
        }
    }

    return { reliable, total, stitchables, n_stacks: result.n_stacks }
}