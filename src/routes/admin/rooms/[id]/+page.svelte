<script lang="ts">
    import { languageAwareGoto } from '$lib/utils/languageAware';
	import { redirect } from '@sveltejs/kit';
    import type { PageData } from './$types';
    import { onMount } from 'svelte';
	import HelpPopup from '$lib/components/HelpPopup.svelte';

    export let data: PageData;

    const rotationStep = 15;
    const snappingThreshold = 10;

    interface Block {
        id: number;
        left: number;
        top: number;
        rotation: number;
        categoryId: number;
        row?: string;
        number?: number;
    }

    interface DragState {
        initialMouseX: number;
        initialMouseY: number;
        initialBlockPositions: Map<number, { left: number; top: number }>;
    }

    interface SnapPoint {
        x: number;
        y: number;
        type: 'corner' | 'edge' | 'center' | 'pattern';
        weight: number;
        source: {
            block: Block;
            pointType: 'corner' | 'edge' | 'center' | 'pattern';
            rotation: number;
        };
    }

    interface SnapLine {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        type: 'alignment' | 'spacing';
        weight: number;
    }

    let name = data.room?.name ?? '';
    let selectedCinemaId: number | null = data.room?.cinemaId ?? null;

    let isSubmitting = false;

    let blocks: Block[] =
        data.seats?.map((seat) => ({
            ...seat,
            left: Number(seat.left),
            top: Number(seat.top),
            rotation: Number(seat.rotation),
            row: seat.row,
            number: seat.seatNumber,
            id: Number(seat.id),
            categoryId: Number(seat.categoryId)
        })) ?? [];

    onMount(() => {
        if (data.seats) {
            // Initialize blocks from data.seats without additional centering
            blocks = data.seats.map((seat) => ({
                ...seat,
                left: Number(seat.left),
                top: Number(seat.top),
                rotation: Number(seat.rotation),
                row: seat.row,
                number: seat.seatNumber,
                id: Number(seat.id),
                categoryId: Number(seat.categoryId)
            }));
        }
    });

    let nameError = '';
    let cinemaError = '';
    let rowError = '';

    let isDragging = false;
    let isDrawingSelectionBox = false;
    let selectionBox: { x: number; y: number; width: number; height: number } | null = null;
    let selectedBlocks = new Set<number>();
    let copiedBlocks: Omit<Block, 'id'>[] = [];
    let history: Block[][] = [];
    let nextId = blocks.length > 0 ? Math.max(...blocks.map((b) => b.id)) + 1 : 1;
    let workspace: HTMLElement;
    let activeSnapLines: SnapLine[] = [];
    let isShiftPressed = false;
    let dragState: DragState | null = null;

    let saveStatus: 'idle' | 'success' | 'error' = 'idle';

    function calculateLayoutBounds(
        blocks: Block[],
        getBlockDimensions: (categoryId: number) => { width: number; height: number }
    ) {
        if (blocks.length === 0) {
            return { minX: 0, maxX: 0, minY: 0, maxY: 0, centerX: 0, centerY: 0 };
        }

        // Calculate bounds including block dimensions
        const bounds = blocks.reduce(
            (bounds, block) => {
                const { width, height } = getBlockDimensions(block.categoryId);
                const right = block.left + width;
                const bottom = block.top + height;

                return {
                    minX: Math.min(bounds.minX, block.left),
                    maxX: Math.max(bounds.maxX, right),
                    minY: Math.min(bounds.minY, block.top),
                    maxY: Math.max(bounds.maxY, bottom)
                };
            },
            {
                minX: Infinity,
                maxX: -Infinity,
                minY: Infinity,
                maxY: -Infinity
            }
        );

        // Calculate center point
        const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2;
        const centerY = bounds.minY + (bounds.maxY - bounds.minY) / 2;

        return { ...bounds, centerX, centerY };
    }

    function normalizePositions(
        blocks: Block[],
        getBlockDimensions: (categoryId: number) => { width: number; height: number }
    ): Block[] {
        const bounds = calculateLayoutBounds(blocks, getBlockDimensions);

        return blocks.map((block) => {
            const { width, height } = getBlockDimensions(block.categoryId);

            // Calculate block center position
            const blockCenterX = block.left + width / 2;
            const blockCenterY = block.top + height / 2;

            // Return new block with positions relative to layout center
            return {
                ...block,
                left: blockCenterX - bounds.centerX,
                top: blockCenterY - bounds.centerY
            };
        });
    }

    function denormalizePositions(
        blocks: Block[],
        getBlockDimensions: (categoryId: number) => { width: number; height: number },
        targetCenterX: number,
        targetCenterY: number
    ): Block[] {
        return blocks.map((block) => {
            const { width, height } = getBlockDimensions(block.categoryId);

            // Convert back to absolute positions
            const absoluteCenterX = targetCenterX + block.left;
            const absoluteCenterY = targetCenterY + block.top;

            return {
                ...block,
                left: absoluteCenterX - width / 2,
                top: absoluteCenterY - height / 2
            };
        });
    }

    function getBlockDimensions(categoryId: number): { width: number; height: number } {
        const category = data.categories.find((c) => c.id === categoryId);
        return {
            width: category?.width || 40,
            height: category?.height || 40
        };
    }

    function getBlockPoints(block: Block) {
        const { width, height } = getBlockDimensions(block.categoryId);
        const centerX = block.left + width / 2;
        const centerY = block.top + height / 2;

        const corners = [
            { x: block.left, y: block.top },
            { x: block.left + width, y: block.top },
            { x: block.left + width, y: block.top + height },
            { x: block.left, y: block.top + height }
        ];

        const edges = [
            { x: block.left + width / 2, y: block.top },
            { x: block.left + width, y: block.top + height / 2 },
            { x: block.left + width / 2, y: block.top + height },
            { x: block.left, y: block.top + height / 2 }
        ];

        const rotatedPoints = [...corners, ...edges].map((point) =>
            rotatePoint(point.x, point.y, centerX, centerY, block.rotation)
        );

        return [
            ...rotatedPoints.slice(0, 4).map((p) => ({ ...p, type: 'corner' as const })),
            ...rotatedPoints.slice(4).map((p) => ({ ...p, type: 'edge' as const })),
            { x: centerX, y: centerY, type: 'center' as const }
        ];
    }

    function rotatePoint(x: number, y: number, centerX: number, centerY: number, angle: number) {
        const radians = (angle * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const dx = x - centerX;
        const dy = y - centerY;

        return {
            x: centerX + dx * cos - dy * sin,
            y: centerY + dx * sin + dy * cos
        };
    }

    function detectPattern(blocks: Block[]): {
        horizontalPatterns: number[];
        verticalPatterns: number[];
    } {
        const horizontalPatterns: number[] = [];
        const verticalPatterns: number[] = [];

        // Sort blocks by position
        const sortedByX = [...blocks].sort((a, b) => a.left - b.left);
        const sortedByY = [...blocks].sort((a, b) => a.top - b.top);

        // Detect horizontal patterns (same y coordinate, multiple x coordinates)
        for (let i = 0; i < sortedByX.length - 1; i++) {
            const current = sortedByX[i];
            const next = sortedByX[i + 1];
            const currentBlock = getBlockDimensions(current.categoryId);
            const nextBlock = getBlockDimensions(next.categoryId);

            // Check if blocks are in the same row (approximately)
            if (Math.abs(current.top - next.top) < snappingThreshold) {
                const spacing = next.left - (current.left + currentBlock.width);
                if (spacing > 0 && spacing < currentBlock.width * 2) {
                    // Reasonable spacing threshold
                    horizontalPatterns.push(spacing);
                }
            }
        }

        // Detect vertical patterns (same x coordinate, multiple y coordinates)
        for (let i = 0; i < sortedByY.length - 1; i++) {
            const current = sortedByY[i];
            const next = sortedByY[i + 1];
            const currentBlock = getBlockDimensions(current.categoryId);
            const nextBlock = getBlockDimensions(next.categoryId);

            // Check if blocks are in the same column (approximately)
            if (Math.abs(current.left - next.left) < snappingThreshold) {
                const spacing = next.top - (current.top + currentBlock.height);
                if (spacing > 0 && spacing < currentBlock.height * 2) {
                    // Reasonable spacing threshold
                    verticalPatterns.push(spacing);
                }
            }
        }

        return { horizontalPatterns, verticalPatterns };
    }

    function getRelevantSnapPoints(
        movingBlock: Block,
        referenceBlocks: Block[]
    ): { points: SnapPoint[]; lines: SnapLine[] } {
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
            const refBlockSize = getBlockDimensions(refBlock.categoryId);
            const proximityWeight = Math.max(
                0,
                1 - distance / (Math.max(refBlockSize.width, refBlockSize.height) * 3)
            );

            // If we found a pattern, add pattern-based snap points
            if (horizontalPatterns.length > 0 || verticalPatterns.length > 0) {
                // Find blocks that could be part of a sequence with the reference block
                const potentialSequenceBlocks = referenceBlocks.filter((b) => {
                    const isHorizontalNeighbor = Math.abs(b.top - refBlock.top) < snappingThreshold;
                    const isVerticalNeighbor = Math.abs(b.left - refBlock.left) < snappingThreshold;
                    return (isHorizontalNeighbor || isVerticalNeighbor) && b.id !== refBlock.id;
                });

                for (const sequenceBlock of potentialSequenceBlocks) {
                    if (Math.abs(sequenceBlock.top - refBlock.top) < snappingThreshold) {
                        // Horizontal sequence
                        const spacing =
                            Math.abs(sequenceBlock.left - refBlock.left) -
                            getBlockDimensions(refBlock.categoryId).width;
                        if (spacing > 0) {
                            // Add snap points for continuing the sequence
                            snapPoints.push({
                                x: refBlock.left + (spacing + getBlockDimensions(refBlock.categoryId).width),
                                y: refBlock.top,
                                type: 'pattern',
                                weight: proximityWeight * 1.2, // Increase weight for pattern matches
                                source: { block: refBlock, pointType: 'pattern', rotation: refBlock.rotation }
                            });
                            snapPoints.push({
                                x: refBlock.left - (spacing + getBlockDimensions(refBlock.categoryId).width),
                                y: refBlock.top,
                                type: 'pattern',
                                weight: proximityWeight * 1.2,
                                source: { block: refBlock, pointType: 'pattern', rotation: refBlock.rotation }
                            });
                        }
                    }

                    if (Math.abs(sequenceBlock.left - refBlock.left) < snappingThreshold) {
                        // Vertical sequence
                        const spacing =
                            Math.abs(sequenceBlock.top - refBlock.top) -
                            getBlockDimensions(refBlock.categoryId).height;
                        if (spacing > 0) {
                            // Add snap points for continuing the sequence
                            snapPoints.push({
                                x: refBlock.left,
                                y: refBlock.top + (spacing + getBlockDimensions(refBlock.categoryId).height),
                                type: 'pattern',
                                weight: proximityWeight * 1.2,
                                source: { block: refBlock, pointType: 'pattern', rotation: refBlock.rotation }
                            });
                            snapPoints.push({
                                x: refBlock.left,
                                y: refBlock.top - (spacing + getBlockDimensions(refBlock.categoryId).height),
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
                    ...refPoints.map((point) => ({
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

            if (
                (rotationDiff === 90 || rotationDiff === 270) &&
                distance <
                    Math.max(
                        getBlockDimensions(refBlock.categoryId).width,
                        getBlockDimensions(refBlock.categoryId).height
                    ) *
                        1.5
            ) {
                const cornerPoints = refPoints.filter((p) => p.type === 'corner');
                snapPoints.push(
                    ...cornerPoints.map((point) => ({
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

        const referenceBlocks = blocks.filter((block) => !selectedIds.has(block.id));
        if (referenceBlocks.length === 0) {
            activeSnapLines = [];
            return finalPositions;
        }

        const firstBlockId = Array.from(selectedIds)[0];
        const firstBlockPosition = proposedPositions.get(firstBlockId)!;
        const movingBlock: Block = {
            ...blocks.find((b) => b.id === firstBlockId)!,
            left: firstBlockPosition.x,
            top: firstBlockPosition.y
        };

        const { points: snapPoints, lines: initialSnapLines } = getRelevantSnapPoints(
            movingBlock,
            referenceBlocks
        );
        const movingPoints = getBlockPoints(movingBlock);

        let bestSnapX: number | null = null;
        let bestSnapY: number | null = null;
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

                if (
                    distanceX < minDistanceX &&
                    distanceX < adjustedThresholdX &&
                    snapPoint.weight > bestWeightX
                ) {
                    minDistanceX = distanceX;
                    bestSnapX = snapPoint.x;
                    bestWeightX = snapPoint.weight;

                    // Add vertical alignment line with opacity based on weight
                    activeLines = activeLines.filter((l) => l.x1 !== snapPoint.x);
                    activeLines.push({
                        x1: snapPoint.x,
                        y1: 0,
                        x2: snapPoint.x,
                        y2: workspace.clientHeight,
                        type: 'alignment',
                        weight: snapPoint.weight
                    });
                }

                if (
                    distanceY < minDistanceY &&
                    distanceY < adjustedThresholdY &&
                    snapPoint.weight > bestWeightY
                ) {
                    minDistanceY = distanceY;
                    bestSnapY = snapPoint.y;
                    bestWeightY = snapPoint.weight;

                    // Add horizontal alignment line with opacity based on weight
                    activeLines = activeLines.filter((l) => l.y1 !== snapPoint.y);
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

    function handleDragStart(event: DragEvent, categoryId: number) {
        event.dataTransfer?.setData('categoryId', categoryId.toString());
    }

    function pushToHistory() {
        // Limit history size to prevent excessive memory usage (optional)
        const maxHistory = 100;
        if (history.length >= maxHistory) {
            history.shift(); // Remove the oldest state
        }
        history.push(JSON.parse(JSON.stringify(blocks)));
    }

    function duplicateBlocks() {
        if (selectedBlocks.size === 0) return;

        pushToHistory(); // Save current state for undo functionality

        const duplicated = Array.from(selectedBlocks)
            .map((id) => {
                const original = blocks.find((block) => block.id === id);
                if (!original) return null;

                // Create a new block with a unique ID and slightly offset position
                return {
                    ...original,
                    id: nextId++,
                    left: original.left + 20, // Offset by 20px to the right
                    top: original.top + 20 // Offset by 20px downward
                };
            })
            .filter((block) => block !== null) as Block[];

        blocks = [...blocks, ...duplicated];
        selectedBlocks = new Set(duplicated.map((block) => block.id)); // Select the newly duplicated blocks
    }

    function deleteBlocks() {
        if (selectedBlocks.size === 0) return;

        pushToHistory(); // Save current state for undo functionality

        blocks = blocks.filter((block) => !selectedBlocks.has(block.id));
        selectedBlocks.clear();
    }

    function undo() {
        if (history.length === 0) return;

        const previousState = history.pop();
        if (previousState) {
            blocks = previousState;
            selectedBlocks.clear();
        }
    }

    function copyBlocks() {
        copiedBlocks = Array.from(selectedBlocks)
            .map((id) => {
                const block = blocks.find((b) => b.id === id);
                if (!block) return null;
                const { id: _, ...rest } = block; // Exclude the ID
                return rest;
            })
            .filter((block) => block !== null) as Omit<Block, 'id'>[];
    }

    function pasteBlocks() {
        if (copiedBlocks.length === 0) return;

        pushToHistory(); // Save current state for undo functionality

        const pasted = copiedBlocks.map((block) => ({
            ...block,
            id: nextId++,
            left: block.left + 20, // Offset to differentiate from original
            top: block.top + 20
        }));

        blocks = [...blocks, ...pasted];
        selectedBlocks = new Set(pasted.map((block) => block.id)); // Select the newly pasted blocks
    }

    function rotateSelectedBlocks() {
        if (selectedBlocks.size === 0) return;

        pushToHistory(); // Save current state for undo functionality

        blocks = blocks.map((block) => {
            if (selectedBlocks.has(block.id)) {
                return {
                    ...block,
                    rotation: (block.rotation + rotationStep) % 360
                };
            }
            return block;
        });
    }

    let dragThreshold = 5; // Minimum movement in pixels to qualify as a drag
    let isDraggingBlock = false; // Tracks if a block is being dragged

    function handleMouseDownOnBlock(event: MouseEvent, clickedBlock: Block) {
        event.preventDefault();
        event.stopPropagation();

        // Handle selection
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

        // Get workspace rect once at the start of drag
        const workspaceRect = workspace.getBoundingClientRect();

        // Initialize drag state with absolute mouse coordinates
        const initialMouseX = event.clientX;
        const initialMouseY = event.clientY;

        isDragging = true;
        dragState = {
            initialMouseX: initialMouseX,
            initialMouseY: initialMouseY,
            initialBlockPositions: new Map(
                Array.from(selectedBlocks).map((id) => {
                    const block = blocks.find((b) => b.id === id)!;
                    return [
                        id,
                        {
                            left: block.left,
                            top: block.top
                        }
                    ];
                })
            )
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (!isDragging || !dragState) return;

            // Calculate the total movement from the initial mouse position
            const deltaX = event.clientX - dragState.initialMouseX;
            const deltaY = event.clientY - dragState.initialMouseY;

            // Create the new positions map
            const newPositions = new Map<number, { x: number; y: number }>();
            dragState.initialBlockPositions.forEach((initial, id) => {
                newPositions.set(id, {
                    x: initial.left + deltaX,
                    y: initial.top + deltaY
                });
            });

            // Apply snapping if shift isn't pressed
            const finalPositions = !isShiftPressed ? applySnapping(newPositions) : newPositions;

            // Update blocks with their new positions
            blocks = blocks.map((block) => {
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
        };

        const handleMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                dragState = null;
                pushToHistory();
                activeSnapLines = [];
            }

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseDownOnWorkspace(event: MouseEvent) {
        // Only start selection box if clicking directly on the workspace
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

    function handleDragOver(event: DragEvent) {
        event.preventDefault();
    }

    function handleDrop(event: DragEvent) {
        event.preventDefault();
        const categoryId = parseInt(event.dataTransfer?.getData('categoryId') || '0');
        if (isNaN(categoryId) || !data.categories.find((c) => c.id === categoryId)) return;

        const workspaceRect = workspace.getBoundingClientRect();
        const { width, height } = getBlockDimensions(categoryId);
        const x = event.clientX - workspaceRect.left;
        const y = event.clientY - workspaceRect.top;

        pushToHistory();
        blocks = [
            ...blocks,
            {
                id: nextId++,
                left: x - width / 2,
                top: y - height / 2,
                rotation: 0,
                categoryId
            }
        ];

        // Clear any active selection box
        isDrawingSelectionBox = false;
        selectionBox = null;
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

            blocks = blocks.map((block) => {
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
        } else if (isDrawingSelectionBox && selectionBox) {
            const currentX = event.clientX - workspaceRect.left;
            const currentY = event.clientY - workspaceRect.top;

            selectionBox = {
                x: Math.min(selectionBox.x, currentX),
                y: Math.min(selectionBox.y, currentY),
                width: Math.abs(currentX - selectionBox.x),
                height: Math.abs(currentY - selectionBox.y)
            };
        }
    }

    function handleMouseUp(event: MouseEvent) {
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
                    .filter((block) => {
                        const { width, height } = getBlockDimensions(block.categoryId);
                        const left = block.left;
                        const right = block.left + width;
                        const top = block.top;
                        const bottom = block.top + height;
                        return left < maxX && right > minX && top < maxY && bottom > minY;
                    })
                    .map((block) => block.id)
            );
        }

        isDrawingSelectionBox = false;
        selectionBox = null;

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    function reassignSeatNumbers(rowLetter: string) {
        // Filter blocks that belong to the specified row
        const blocksInRow = blocks
            .filter((block) => block.row === rowLetter)
            .sort((a, b) => a.left - b.left); // Sort by left position (horizontal)

        // Assign sequential numbers starting from 1
        blocksInRow.forEach((block, index) => {
            blocks = blocks.map((b) => {
                if (b.id === block.id) {
                    return { ...b, number: index + 1 };
                }
                return b;
            });
        });
    }

    /**
     * Assigns a row letter to all selected blocks and reassigns their numbers.
     * @param rowLetter - The letter representing the row (e.g., 'A').
     */
    function assignRowLetter(rowLetter: string) {
        // Ensure rowLetter is uppercase and valid
        rowLetter = rowLetter.toUpperCase();
        if (!/^[A-Z]$/.test(rowLetter)) {
            alert('Please enter a valid row letter (A-Z).');
            return;
        }

        if (selectedBlocks.size === 0) {
            alert('Please select blocks to assign to a row.');
            return;
        }

        // Assign the row letter to all selected blocks
        blocks = blocks.map((block) => {
            if (selectedBlocks.has(block.id)) {
                return { ...block, row: rowLetter };
            }
            return block;
        });

        // Reassign numbers for the entire row to ensure uniqueness and order
        reassignSeatNumbers(rowLetter);

        // Clear the selection after assigning rows
        selectedBlocks.clear();
    }

    async function handleSave() {
        console.log('Saving room layout...');
        if (isSubmitting) return;

        // **Reset Errors**
        nameError = '';
        cinemaError = '';
        rowError = '';

        // **Validation: Ensure Name is Not Empty**
        if (!name.trim()) {
            nameError = 'Room name is required.';
        }

        // **Validation: Ensure a Cinema is Selected**
        if (!selectedCinemaId) {
            cinemaError = 'Please select a cinema.';
        }

        // **Validation: Ensure All Seats Are Assigned to a Row and Number**
        const unassignedBlocks = blocks.filter((block) => !block.row || !block.number);
        if (unassignedBlocks.length > 0) {
            rowError = `${unassignedBlocks.length} seat(s) are not assigned to any row or number. Please assign them before saving.`;
        }

        // **Halt Save If There Are Any Errors**
        if (nameError || cinemaError || rowError) {
            return;
        }

        isSubmitting = true;
        saveStatus = 'idle';
        // Use absolute positions without normalization
        const absoluteBlocks = blocks.map((block) => ({
            id: block.id,
            left: block.left,
            top: block.top,
            rotation: block.rotation,
            categoryId: block.categoryId,
            row: block.row,
            number: block.number
        }));

        const form = new FormData();
        form.append('isCreate', data.isCreate.toString());
        form.append('name', name);
        form.append('layout', JSON.stringify(absoluteBlocks));
        form.append('cinemaId', selectedCinemaId.toString());

        if (!data.isCreate && data.room) {
            form.append('id', data.room.id.toString());
        }

        try {
            const response = await fetch('?/save', {
                method: 'POST',
                body: form
            });

            const result = await response.json();

            console.log(result);

            if (result.sucess === true) {
                console.log('Layout saved successfully');
                saveStatus = 'success';
                // Update blocks with the saved layout from the server
                blocks = result.savedLayout.map((seat: any) => ({
                    ...seat,
                    left: Number(seat.left),
                    top: Number(seat.top),
                    rotation: Number(seat.rotation),
                    row: seat.row,
                    number: seat.seatNumber,
                    id: Number(seat.id),
                    categoryId: Number(seat.categoryId)
                }));
            } else if (result.success === false) {
                throw new Error(result.message || 'Unknown error');
            } else if (result.type === "redirect") {
                languageAwareGoto(result.location);
            }
            console.log('Layout saved successfully');
            saveStatus = 'success';
        } catch (error) {
            console.error('Error saving:', error);
            saveStatus = 'error';
        } finally {
            isSubmitting = false;
            setTimeout(() => {
                saveStatus = 'idle';
            }, 3000);
        }
    }

    onMount(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;

            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }
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
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                handleSave();
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
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    });


// Variable, die bestimmt, ob der Hilfepopup angezeigt wird
let showHelp = false;

// Funktion zum Öffnen des Hilfepopups
function openHelp() {
  showHelp = true;
}

// Funktion zum Schließen, wird vom HelpPopup per Event ausgelöst
function handleCloseHelp() {
  showHelp = false;
}
</script>

<!-- Top Bar -->
<div class="flex h-16 items-center bg-gray-800 px-4 text-white shadow-md">
    <!-- Room Name Input -->
    <div
        class="flex flex-col items-start space-y-1 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0"
    >
        <div class="flex items-center space-x-2">
            <label for="room-name" class="font-medium text-white">Room Name:</label>
            <input
                id="room-name"
                type="text"
                bind:value={name}
                placeholder="Enter room name"
                class="rounded bg-gray-700 px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <!-- Cinema Dropdown -->
        <div class="flex items-center space-x-2">
            <label for="cinema-select" class="font-medium text-white">Cinema:</label>
            <select
                id="cinema-select"
                bind:value={selectedCinemaId}
                class="rounded bg-gray-700 px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="" disabled>Select a cinema</option>
                {#each data.cinemas as cinema (cinema.id)}
                    <option value={cinema.id}>{cinema.name}</option>
                {/each}
            </select>
        </div>
    </div>

    <!-- Spacer to separate the inputs from the category list -->
    <div class="flex-grow"></div>

    <!-- Category List and Action Buttons -->
    <div class="flex space-x-4">
        {#each data.categories.filter((cat) => cat.isActive) as category (category.id)}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="relative flex cursor-move items-center justify-center rounded text-sm font-medium"
                style="
                    width: {category.width}px;
                    height: {category.height}px;
                "
                draggable="true"
                ondragstart={(e) => handleDragStart(e, category.id)}
                title={category.description || category.name}
            >
                <svg
                    width={category.width}
                    height={category.height}
                    viewBox={`0 0 ${category.width} ${category.height}`}
                >
                    <path d={category.customPath} fill={category.color} stroke="white" stroke-width="1" />
                </svg>
                <span class="absolute inset-0 flex items-center justify-center text-white">
                    {category.name[0].toUpperCase()}
                </span>
            </div>
        {/each}
    </div>

    <div class="ml-8 flex space-x-2">
        <button
            class="rounded bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-600"
            onclick={duplicateBlocks}
            title="Duplicate selected blocks"
            aria-label="Duplicate selected blocks"
        >
            Duplicate
        </button>
        <button
            class="rounded bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
            onclick={deleteBlocks}
            title="Delete selected blocks"
            aria-label="Delete selected blocks"
        >
            Delete
        </button>
        <button
            class="rounded bg-yellow-500 px-4 py-2 font-medium text-white hover:bg-yellow-600"
            onclick={undo}
            title="Undo last action"
            aria-label="Undo last action"
        >
            Undo
        </button>

        <button
            onclick={() => {
                const rowLetter = prompt('Enter row letter (A-Z):');
                if (rowLetter) assignRowLetter(rowLetter);
            }}
            class="rounded bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
            title="Assign row letter to selected blocks"
            aria-label="Assign row letter to selected blocks"
        >
            Assign Row
        </button>

        <button
            onclick={() => handleSave()}
            class="rounded bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-600"
            title="Save room layout"
            aria-label="Save room layout"
        >
            Save Room
        </button>
    </div>
</div>

{#if rowError}
    <div class="mx-4 mt-2 rounded bg-red-500 p-2 text-white">
        {rowError}
    </div>
{/if}

<!-- Workspace Area -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    bind:this={workspace}
    class="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-200"
    onmousedown={handleMouseDownOnWorkspace}
    ondragover={handleDragOver}
    ondrop={handleDrop}
>
    <!-- Snap Lines -->
    {#each activeSnapLines as line}
        <div
            class="pointer-events-none absolute {line.type === 'spacing'
                ? 'bg-green-500'
                : 'bg-blue-500'}"
            style="left: {Math.min(line.x1, line.x2)}px; 
                top: {Math.min(line.y1, line.y2)}px;
                width: {Math.abs(line.x2 - line.x1) || 1}px;
                height: {Math.abs(line.y2 - line.y1) || 1}px;
                transform: translate(-50%, -50%);
                opacity: {line.type === 'spacing' ? '0.3' : '0.5'};"
        ></div>
    {/each}

    <!-- Selection Box -->
    {#if selectionBox}
        <div
            class="absolute border-2 border-dashed border-blue-500 bg-blue-100 opacity-50"
            style="left: {selectionBox.x}px; 
                   top: {selectionBox.y}px; 
                   width: {selectionBox.width}px; 
                   height: {selectionBox.height}px;"
        ></div>
    {/if}

    <!-- Blocks Rendering Section -->
    {#each blocks as block (block.id)}
        {@const category = data.categories.find((c) => c.id === block.categoryId)}
        <div
            class="absolute flex cursor-grab items-center justify-center border-2 text-sm text-white"
            class:border-blue-500={selectedBlocks.has(block.id)}
            class:border-red-500={!selectedBlocks.has(block.id) && (!block.row || !block.number)}
            style="
                left: {block.left}px; 
                top: {block.top}px; 
                width: {category?.width}px;
                height: {category?.height}px;
                transform: rotate({block.rotation}deg);
            "
            onmousedown={(e) => handleMouseDownOnBlock(e, block)}
            title={category?.description || category?.name || ''}
        >
            <svg
                width={category?.width}
                height={category?.height}
                viewBox={`0 0 ${category?.width} ${category?.height}`}
            >
                <path d={category?.customPath} fill={category?.color} stroke="white" stroke-width="1" />
            </svg>
            <span class="absolute inset-0 flex items-center justify-center">
                {category?.name[0].toUpperCase() || '?'}
            </span>

            {#if block.row}
                <div
                    class="absolute bottom-0 right-0 rounded-tl bg-black bg-opacity-50 px-1 py-0.5 text-xs text-white"
                >
                    {block.row}{block.number}
                </div>
            {/if}

            <!-- Indicator for Unassigned Seats -->
            {#if !block.row || !block.number}
                <div class="absolute left-0 top-0 rounded-br bg-red-600 px-1 py-0.5 text-xs text-white">
                    Unassigned
                </div>
            {/if}
        </div>
    {/each}

    <!-- <button
  class="fixed bottom-4 right-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 z-50"
  onclick={openHelp}
>
  Hilfe
</button>

<HelpPopup visible={showHelp} on:close={handleCloseHelp} /> -->



    <!-- Optional: Save Status Notifications -->
    {#if saveStatus === 'success'}
        <div class="fixed bottom-4 right-4 rounded bg-green-500 p-2 text-white shadow">
            Layout saved successfully!
        </div>
    {/if}
    {#if saveStatus === 'error'}
        <div class="fixed bottom-4 right-4 rounded bg-red-500 p-2 text-white shadow">
            Error saving layout. Please try again.
        </div>
    {/if}
</div>

<style>
    .border-red-500 {
        border-color: #f87171; /* Tailwind's red-500 */
    }

    .bg-red-600 {
        background-color: #dc2626; /* Tailwind's red-600 */
    }
</style>
