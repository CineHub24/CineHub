<script lang="ts">
	import type { SeatCategory } from '$lib/server/db/schema';
    import { onMount } from 'svelte';


    export let data: { categories: SeatCategory[] };

    const rotationStep = 15;
    const snappingThreshold = 10;
    const alignmentThreshold = 8;
    const patternThreshold = 15;
    
    // Use the dynamic size from the first category as default, fallback to 40
    $: blockSize = data.categories[0]?.size ?? 40;
    

    interface Block {
        id: number;
        left: number;
        top: number;
        rotation: number;
        categoryId: number; // Changed from type to categoryId
    }
    
    interface DragState {
        initialMouseX: number;
        initialMouseY: number;
        initialBlockPositions: Map<number, { left: number; top: number }>;
    }
    
   // State
    let isDragging = false;
    let isDrawingSelectionBox = false;
    let selectionBox: { x: number; y: number; width: number; height: number } | null = null;
    let blocks: Block[] = [];
    let selectedBlocks = new Set<number>();
    let copiedBlocks: Omit<Block, 'id'>[] = [];
    let history: Block[][] = [];
    let nextId = 1;
    let workspace: HTMLElement;
    let activeSnapLines: { x1: number; y1: number; x2: number; y2: number; type?: string }[] = [];
    let isShiftPressed = false;
    let dragState: DragState | null = null;


    function rotatePoint(x: number, y: number, centerX: number, centerY: number, angle: number) {
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const dx = x - centerX;
    const dy = y - centerY;
    
    return {
        x: centerX + (dx * cos - dy * sin),
        y: centerY + (dx * sin + dy * cos)
    };
}

function getBlockPoints(block: Block) {
    const centerX = block.left + blockSize / 2;
    const centerY = block.top + blockSize / 2;
    
    // Define corners relative to the block's position
    const corners = [
        { x: block.left, y: block.top }, // Top-left
        { x: block.left + blockSize, y: block.top }, // Top-right
        { x: block.left + blockSize, y: block.top + blockSize }, // Bottom-right
        { x: block.left, y: block.top + blockSize }, // Bottom-left
    ];

    // Define edges centers
    const edges = [
        { x: block.left + blockSize / 2, y: block.top }, // Top center
        { x: block.left + blockSize, y: block.top + blockSize / 2 }, // Right center
        { x: block.left + blockSize / 2, y: block.top + blockSize }, // Bottom center
        { x: block.left, y: block.top + blockSize / 2 }, // Left center
    ];
    
    // Rotate all points if block is rotated
    const rotatedCorners = corners.map(point => 
        rotatePoint(point.x, point.y, centerX, centerY, block.rotation)
    );
    
    const rotatedEdges = edges.map(point => 
        rotatePoint(point.x, point.y, centerX, centerY, block.rotation)
    );

    // Add center point
    const points = [
        ...rotatedCorners.map(p => ({ ...p, type: 'corner' as const })),
        ...rotatedEdges.map(p => ({ ...p, type: 'edge' as const })),
        { x: centerX, y: centerY, type: 'center' as const }
    ];

    return points;
}

interface SnapPoint {
    x: number;
    y: number;
    type: 'corner' | 'edge' | 'center';
    source?: {
        block: Block;
        pointType: 'corner' | 'edge' | 'center';
        rotation: number;
    };
}

interface SnapLine {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    type: 'alignment' | 'spacing' | 'grid';
}

function detectPattern(blocks: Block[]): { horizontalPatterns: number[], verticalPatterns: number[] } {
    const horizontalPatterns: number[] = [];
    const verticalPatterns: number[] = [];

    // Sort blocks by position
    const sortedByX = [...blocks].sort((a, b) => a.left - b.left);
    const sortedByY = [...blocks].sort((a, b) => a.top - b.top);

    // Detect horizontal patterns (same y coordinate, multiple x coordinates)
    for (let i = 0; i < sortedByX.length - 1; i++) {
        const current = sortedByX[i];
        const next = sortedByX[i + 1];
        
        // Check if blocks are in same row (approximately)
        if (Math.abs(current.top - next.top) < snappingThreshold) {
            const spacing = next.left - (current.left + blockSize);
            if (spacing > 0 && spacing < blockSize * 2) { // Reasonable spacing threshold
                horizontalPatterns.push(spacing);
            }
        }
    }

    // Detect vertical patterns (same x coordinate, multiple y coordinates)
    for (let i = 0; i < sortedByY.length - 1; i++) {
        const current = sortedByY[i];
        const next = sortedByY[i + 1];
        
        // Check if blocks are in same column (approximately)
        if (Math.abs(current.left - next.left) < snappingThreshold) {
            const spacing = next.top - (current.top + blockSize);
            if (spacing > 0 && spacing < blockSize * 2) { // Reasonable spacing threshold
                verticalPatterns.push(spacing);
            }
        }
    }

    return { horizontalPatterns, verticalPatterns };
}

function getRelevantSnapPoints(movingBlock: Block, referenceBlocks: Block[]): { points: SnapPoint[]; lines: SnapLine[] } {
    const snapPoints: SnapPoint[] = [];
    const snapLines: SnapLine[] = [];
    
    // Detect patterns in existing blocks
    const { horizontalPatterns, verticalPatterns } = detectPattern(referenceBlocks);

    // Sort reference blocks by distance to the moving block
    const sortedRefBlocks = referenceBlocks.sort((a, b) => {
        const distA = Math.hypot(a.left - movingBlock.left, a.top - movingBlock.top);
        const distB = Math.hypot(b.left - movingBlock.left, b.top - movingBlock.top);
        return distA - distB;
    });

    // Take only the closest blocks
    const nearestBlocks = sortedRefBlocks.slice(0, 3);
    
    for (const refBlock of nearestBlocks) {
        const refPoints = getBlockPoints(refBlock);
        const rotationDiff = Math.abs((movingBlock.rotation % 360) - (refBlock.rotation % 360));
        const distance = Math.hypot(refBlock.left - movingBlock.left, refBlock.top - movingBlock.top);
        
        // Calculate distance-based weight
        const proximityWeight = Math.max(0, 1 - distance / (blockSize * 3));

        // If we found a pattern, add pattern-based snap points
        if (horizontalPatterns.length > 0 || verticalPatterns.length > 0) {
            // Find blocks that could be part of a sequence with the reference block
            const potentialSequenceBlocks = referenceBlocks.filter(b => {
                const isHorizontalNeighbor = Math.abs(b.top - refBlock.top) < snappingThreshold;
                const isVerticalNeighbor = Math.abs(b.left - refBlock.left) < snappingThreshold;
                return (isHorizontalNeighbor || isVerticalNeighbor) && b.id !== refBlock.id;
            });

            for (const sequenceBlock of potentialSequenceBlocks) {
                if (Math.abs(sequenceBlock.top - refBlock.top) < snappingThreshold) {
                    // Horizontal sequence
                    const spacing = Math.abs(sequenceBlock.left - refBlock.left) - blockSize;
                    if (spacing > 0) {
                        // Add snap points for continuing the sequence
                        snapPoints.push({
                            x: refBlock.left + (spacing + blockSize),
                            y: refBlock.top,
                            type: 'pattern',
                            weight: proximityWeight * 1.2, // Increase weight for pattern matches
                            source: { block: refBlock, pointType: 'pattern', rotation: refBlock.rotation }
                        });
                        snapPoints.push({
                            x: refBlock.left - (spacing + blockSize),
                            y: refBlock.top,
                            type: 'pattern',
                            weight: proximityWeight * 1.2,
                            source: { block: refBlock, pointType: 'pattern', rotation: refBlock.rotation }
                        });
                    }
                }

                if (Math.abs(sequenceBlock.left - refBlock.left) < snappingThreshold) {
                    // Vertical sequence
                    const spacing = Math.abs(sequenceBlock.top - refBlock.top) - blockSize;
                    if (spacing > 0) {
                        // Add snap points for continuing the sequence
                        snapPoints.push({
                            x: refBlock.left,
                            y: refBlock.top + (spacing + blockSize),
                            type: 'pattern',
                            weight: proximityWeight * 1.2,
                            source: { block: refBlock, pointType: 'pattern', rotation: refBlock.rotation }
                        });
                        snapPoints.push({
                            x: refBlock.left,
                            y: refBlock.top - (spacing + blockSize),
                            type: 'pattern',
                            weight: proximityWeight * 1.2,
                            source: { block: refBlock, pointType: 'pattern', rotation: refBlock.rotation }
                        });
                    }
                }
            }
        }

        // Add regular snap points as before...
        if (rotationDiff === 0 || rotationDiff === 360) {
            snapPoints.push(
                ...refPoints.map(point => ({
                    x: point.x,
                    y: point.y,
                    type: point.type,
                    weight: proximityWeight,
                    source: {
                        block: refBlock,
                        pointType: point.type,
                        rotation: refBlock.rotation
                    }
                }))
            );
        }

        if ((rotationDiff === 90 || rotationDiff === 270) && distance < blockSize * 1.5) {
            const cornerPoints = refPoints.filter(p => p.type === 'corner');
            snapPoints.push(
                ...cornerPoints.map(point => ({
                    x: point.x,
                    y: point.y,
                    type: 'corner',
                    weight: proximityWeight * 0.8,
                    source: {
                        block: refBlock,
                        pointType: 'corner',
                        rotation: refBlock.rotation
                    }
                }))
            );
        }
    }

    return { points: snapPoints, lines: snapLines };
}

function applySnapping(proposedPositions: Map<number, { x: number; y: number }>) {
    const selectedIds = new Set(proposedPositions.keys());
    const finalPositions = new Map(proposedPositions);
    
    const referenceBlocks = blocks.filter(block => !selectedIds.has(block.id));
    if (referenceBlocks.length === 0) {
        activeSnapLines = [];
        return finalPositions;
    }

    const firstBlockId = Array.from(selectedIds)[0];
    const firstBlockPosition = proposedPositions.get(firstBlockId)!;
    const movingBlock: Block = {
        ...blocks.find(b => b.id === firstBlockId)!,
        left: firstBlockPosition.x,
        top: firstBlockPosition.y
    };

    const { points: snapPoints, lines: initialSnapLines } = getRelevantSnapPoints(movingBlock, referenceBlocks);
    const movingPoints = getBlockPoints(movingBlock);

    let bestSnapX = null;
    let bestSnapY = null;
    let minDistanceX = snappingThreshold;
    let minDistanceY = snappingThreshold;
    let activeLines: SnapLine[] = [];
    let bestWeightX = 0;
    let bestWeightY = 0;

    // Find best snap points with weight consideration
    for (const movingPoint of movingPoints) {
        for (const snapPoint of snapPoints) {
            const distanceX = Math.abs(movingPoint.x - snapPoint.x);
            const distanceY = Math.abs(movingPoint.y - snapPoint.y);
            const adjustedThresholdX = snappingThreshold / (snapPoint.weight || 1);
            const adjustedThresholdY = snappingThreshold / (snapPoint.weight || 1);

            if (distanceX < minDistanceX && distanceX < adjustedThresholdX && snapPoint.weight > bestWeightX) {
                minDistanceX = distanceX;
                bestSnapX = snapPoint.x;
                bestWeightX = snapPoint.weight;
                
                // Add vertical alignment line with opacity based on weight
                activeLines = activeLines.filter(l => l.x1 !== snapPoint.x);
                activeLines.push({
                    x1: snapPoint.x,
                    y1: 0,
                    x2: snapPoint.x,
                    y2: workspace.clientHeight,
                    type: 'alignment',
                    weight: snapPoint.weight
                });
            }

            if (distanceY < minDistanceY && distanceY < adjustedThresholdY && snapPoint.weight > bestWeightY) {
                minDistanceY = distanceY;
                bestSnapY = snapPoint.y;
                bestWeightY = snapPoint.weight;
                
                // Add horizontal alignment line with opacity based on weight
                activeLines = activeLines.filter(l => l.y1 !== snapPoint.y);
                activeLines.push({
                    x1: 0,
                    y1: snapPoint.y,
                    x2: workspace.clientWidth,
                    y2: snapPoint.y,
                    type: 'alignment',
                    weight: snapPoint.weight
                });
            }
        }
    }

    // Apply snapping offset to all selected blocks
    if (bestSnapX !== null || bestSnapY !== null) {
        const firstMovingPoint = movingPoints[0];
        const offsetX = bestSnapX !== null ? bestSnapX - firstMovingPoint.x : 0;
        const offsetY = bestSnapY !== null ? bestSnapY - firstMovingPoint.y : 0;

        finalPositions.forEach((pos, id) => {
            finalPositions.set(id, {
                x: pos.x + offsetX,
                y: pos.y + offsetY
            });
        });

        activeSnapLines = activeLines;
    } else {
        activeSnapLines = [];
    }

    return finalPositions;
}
    
  // Update color retrieval to use category data
  function getBlockColor(categoryId: number): string {
        const category = data.categories.find(c => c.id === categoryId);
        return category?.color || '#6B7280'; // Fallback to gray-500
    }

    // Update drag start to use categoryId
    function handleDragStart(event: DragEvent, categoryId: number) {
        event.dataTransfer?.setData('categoryId', categoryId.toString());
    }
    
    function pushToHistory() {
        history = [...history, JSON.parse(JSON.stringify(blocks))];
    }
    
    
    function handleDragOver(event: DragEvent) {
        event.preventDefault();
    }

    function handleDrop(event: DragEvent) {
        event.preventDefault();
        const categoryId = parseInt(event.dataTransfer?.getData('categoryId') || '0');
        if (!categoryId || !data.categories.find(c => c.id === categoryId)) return;

        const workspaceRect = workspace.getBoundingClientRect();
        const x = event.clientX - workspaceRect.left;
        const y = event.clientY - workspaceRect.top;

        pushToHistory();
        blocks = [...blocks, { 
            id: nextId++, 
            left: x - blockSize/2, 
            top: y - blockSize/2, 
            rotation: 0,
            categoryId
        }];
    }


    function handleMouseDownOnBlock(event: MouseEvent, clickedBlock: Block) {
        event.preventDefault();
        event.stopPropagation();
    
        if (!selectedBlocks.has(clickedBlock.id)) {
            if (!event.metaKey && !event.ctrlKey) {
                selectedBlocks = new Set([clickedBlock.id]);
            } else {
                const newSelection = new Set(selectedBlocks);
                newSelection.add(clickedBlock.id);
                selectedBlocks = newSelection;
            }
        } else if (event.metaKey || event.ctrlKey) {
            const newSelection = new Set(selectedBlocks);
            newSelection.delete(clickedBlock.id);
            selectedBlocks = newSelection;
            return;
        }
    
        const workspaceRect = workspace.getBoundingClientRect();
        isDragging = true;
        dragState = {
            initialMouseX: event.clientX - workspaceRect.left,
            initialMouseY: event.clientY - workspaceRect.top,
            initialBlockPositions: new Map(
                Array.from(selectedBlocks).map(id => {
                    const block = blocks.find(b => b.id === id)!;
                    return [id, { left: block.left, top: block.top }];
                })
            )
        };
    
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'grabbing';
    }
    
    function handleMouseMove(event: MouseEvent) {
        if (!isDragging && !isDrawingSelectionBox) return;
    
        const workspaceRect = workspace.getBoundingClientRect();
    
        if (isDragging && dragState) {
            event.preventDefault();
            
            const currentMouseX = event.clientX - workspaceRect.left;
            const currentMouseY = event.clientY - workspaceRect.top;
            const deltaX = currentMouseX - dragState.initialMouseX;
            const deltaY = currentMouseY - dragState.initialMouseY;
    
            const newPositions = new Map<number, { x: number; y: number }>();
            dragState.initialBlockPositions.forEach((initial, id) => {
                newPositions.set(id, {
                    x: initial.left + deltaX,
                    y: initial.top + deltaY
                });
            });
    
            let finalPositions = newPositions;
            if (!isShiftPressed) {
                finalPositions = applySnapping(newPositions);
            } else {
                activeSnapLines = [];
            }
    
            blocks = blocks.map(block => {
                const newPos = finalPositions.get(block.id);
                if (newPos) {
                    return {
                        ...block,
                        left: newPos.x,
                        top: newPos.y
                    };
                }
                return block;
            });
        } else if (isDrawingSelectionBox) {
            const currentX = event.clientX - workspaceRect.left;
            const currentY = event.clientY - workspaceRect.top;
    
            selectionBox = {
                x: Math.min(selectionBox!.x, currentX),
                y: Math.min(selectionBox!.y, currentY),
                width: Math.abs(currentX - selectionBox!.x),
                height: Math.abs(currentY - selectionBox!.y),
            };
        }
    }
    
    function handleMouseUp() {
        if (isDragging) {
            isDragging = false;
            dragState = null;
            pushToHistory();
            activeSnapLines = [];
            document.body.style.cursor = '';
        }
    
        if (isDrawingSelectionBox && selectionBox) {
            const minX = selectionBox.x;
            const minY = selectionBox.y;
            const maxX = selectionBox.x + selectionBox.width;
            const maxY = selectionBox.y + selectionBox.height;
    
            selectedBlocks = new Set(
                blocks
                    .filter(block => {
                        const left = block.left;
                        const right = block.left + blockSize;
                        const top = block.top;
                        const bottom = block.top + blockSize;
                        return (
                            left < maxX &&
                            right > minX &&
                            top < maxY &&
                            bottom > minY
                        );
                    })
                    .map(block => block.id)
            );
    
            isDrawingSelectionBox = false;
            selectionBox = null;
        }
    
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }
    
    function handleMouseDownOnWorkspace(event: MouseEvent) {
        if (event.target === workspace) {
            const workspaceRect = workspace.getBoundingClientRect();
            const x = event.clientX - workspaceRect.left;
            const y = event.clientY - workspaceRect.top;
    
            if (!event.metaKey && !event.ctrlKey) {
                selectedBlocks = new Set();
            }
    
            selectionBox = { x, y, width: 0, height: 0 };
            isDrawingSelectionBox = true;
    
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    }
    
    
    function copyBlocks() {
        copiedBlocks = Array.from(selectedBlocks)
            .map(id => blocks.find(block => block.id === id))
            .filter(Boolean)
            .map(block => ({
                left: block!.left,
                top: block!.top,
                rotation: block!.rotation,
                categoryId: block!.categoryId
            }));
    }
    
    function pasteBlocks() {
        if (copiedBlocks.length > 0) {
            pushToHistory();
            const newBlocks = copiedBlocks.map(block => ({
                id: nextId++,
                left: block.left + 20,
                top: block.top + 20,
                rotation: block.rotation,
                categoryId: block.categoryId
            }));
    
            blocks = [...blocks, ...newBlocks];
            selectedBlocks = new Set(newBlocks.map(block => block.id));
        }
    }
    
    function duplicateBlocks() {
        if (selectedBlocks.size > 0) {
            pushToHistory();
            const newBlocks = Array.from(selectedBlocks).map(id => {
                const block = blocks.find(b => b.id === id)!;
                return {
                    id: nextId++,
                    left: block.left + 20,
                    top: block.top + 20,
                    rotation: block.rotation,
                    categoryId: block.categoryId
                };
            });
    
            blocks = [...blocks, ...newBlocks];
            selectedBlocks = new Set(newBlocks.map(block => block.id));
        }
    }
    
    function deleteBlocks() {
        if (selectedBlocks.size > 0) {
            pushToHistory();
            blocks = blocks.filter(block => !selectedBlocks.has(block.id));
            selectedBlocks.clear();
        }
    }
    
    function rotateSelectedBlocks() {
        if (selectedBlocks.size > 0) {
            pushToHistory();
            blocks = blocks.map(block => {
                if (selectedBlocks.has(block.id)) {
                    return {
                        ...block,
                        rotation: (block.rotation + rotationStep) % 360
                    };
                }
                return block;
            });
        }
    }
    
    function undo() {
        if (history.length > 0) {
            blocks = history.pop()!;
            selectedBlocks.clear();
        }
    }
    
    
    onMount(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Shift') {
                isShiftPressed = true;
            }
    
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                undo();
            }
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
                event.preventDefault();
                copyBlocks();
            }
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
                event.preventDefault();
                pasteBlocks();
            }
            if (event.key.toLowerCase() === 'r') {
                event.preventDefault();
                rotateSelectedBlocks();
            }
            if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault();
                deleteBlocks();
            }
        };
    
        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === 'Shift') {
                isShiftPressed = false;
            }
        };
    
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    });
    </script>

<div class="flex items-center bg-gray-800 text-white h-16 px-4 shadow-md">
    <div class="flex space-x-4">
        {#each data.categories.filter(cat => cat.isActive) as category (category.id)}
            <div 
                class="rounded cursor-move flex items-center justify-center text-sm font-medium"
                style="
                    background-color: {category.color};
                    width: {category.size}px;
                    height: {category.size}px;
                "
                draggable="true"
                on:dragstart={(e) => handleDragStart(e, category.id)}
                title={category.description || category.name}
            >
                {category.name[0].toUpperCase()}
            </div>
        {/each}
    </div>
    <div class="ml-8 flex space-x-2">
        <button class="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded" on:click={duplicateBlocks}>
            Duplicate
        </button>
        <button class="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded" on:click={deleteBlocks}>
            Delete
        </button>
        <button class="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded" on:click={undo}>
            Undo
        </button>
    </div>
</div>

<div 
    bind:this={workspace} 
    class="relative w-full h-[calc(100vh-64px)] bg-gray-200 overflow-hidden"
    on:mousedown={handleMouseDownOnWorkspace}
    on:dragover={handleDragOver}
    on:drop={handleDrop}
>
    {#each activeSnapLines as line}
        <div 
            class="absolute pointer-events-none {line.type === 'spacing' ? 'bg-green-500' : 'bg-blue-500'}"
            style="left: {Math.min(line.x1, line.x2)}px; 
                top: {Math.min(line.y1, line.y2)}px;
                width: {Math.abs(line.x2 - line.x1) || 1}px;
                height: {Math.abs(line.y2 - line.y1) || 1}px;
                transform: translate(-50%, -50%);
                opacity: {line.type === 'spacing' ? '0.3' : '0.5'};"
        ></div>
    {/each}

    {#if selectionBox}
        <div
            class="absolute border-2 border-dashed border-blue-500 bg-blue-100 opacity-50"
            style="left: {selectionBox.x}px; 
                   top: {selectionBox.y}px; 
                   width: {selectionBox.width}px; 
                   height: {selectionBox.height}px;"
        ></div>
    {/if}

    {#each blocks as block (block.id)}
        {@const category = data.categories.find(c => c.id === block.categoryId)}
        <div
            class="absolute flex items-center justify-center text-white text-sm rounded border-2 cursor-grab {selectedBlocks.has(block.id) ? 'border-blue-500' : 'border-transparent'}"
            style="
                left: {block.left}px; 
                top: {block.top}px; 
                width: {category?.size || 40}px;
                height: {category?.size || 40}px;
                background-color: {category?.color};
                transform: rotate({block.rotation}deg);
            "
            on:mousedown={(e) => handleMouseDownOnBlock(e, block)}
            title={category?.description || category?.name || ''}
        >
            {category?.name[0].toUpperCase() || '?'}
        </div>
    {/each}
</div>