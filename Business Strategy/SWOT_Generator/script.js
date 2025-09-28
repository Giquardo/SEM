// SWOT Colors matching the reference image
const SWOT_COLORS = {
    strengths: '#2196F3',    // Blue
    weaknesses: '#FF9800',   // Orange
    opportunities: '#4CAF50', // Green
    threats: '#673AB7'       // Purple
};

// Text colors for better contrast
const TEXT_COLORS = {
    strengths: '#FFFFFF',
    weaknesses: '#FFFFFF', 
    opportunities: '#FFFFFF',
    threats: '#FFFFFF'
};

// Load default SWOT data from JSON file
async function loadDefaultData() {
    try {
        const response = await fetch('default-swot.json');
        if (!response.ok) {
            throw new Error('Failed to load default data');
        }
        const defaultData = await response.json();
        
        // Fill the textareas with default data
        document.getElementById('strengths').value = defaultData.strengths.join('\n');
        document.getElementById('weaknesses').value = defaultData.weaknesses.join('\n');
        document.getElementById('opportunities').value = defaultData.opportunities.join('\n');
        document.getElementById('threats').value = defaultData.threats.join('\n');
        
        // Generate the SWOT first to populate currentSWOTData
        generateSWOT();
        
        // Load matrix strategies if they exist
        if (defaultData.matrixStrategies) {
            // Clear existing matrix data
            matrixData = {};
            
            // Load the default strategies
            Object.keys(defaultData.matrixStrategies).forEach(key => {
                matrixData[key] = defaultData.matrixStrategies[key];
            });
            
            // Regenerate the matrix grid to show the pre-filled data
            createMatrixGrid();
        }
        
        // Show success message
        alert('Default SWOT data and strategies loaded successfully! The confrontation matrix is now pre-filled with example strategies.');
        
    } catch (error) {
        console.error('Error loading default data:', error);
        alert('Could not load default data. Please check that the default-swot.json file exists.');
    }
}

function generateSWOT() {
    // Get input values with proper labels
    const strengths = getTextareaItems('strengths', 'S');
    const weaknesses = getTextareaItems('weaknesses', 'W');
    const opportunities = getTextareaItems('opportunities', 'O');
    const threats = getTextareaItems('threats', 'T');
    
    // Validate input
    if (strengths.length === 0 && weaknesses.length === 0 && 
        opportunities.length === 0 && threats.length === 0) {
        alert('Please enter at least one item in any category');
        return;
    }
    
    // Draw the SWOT matrix
    drawSWOTMatrix(strengths, weaknesses, opportunities, threats);
    
    // Show download button
    document.getElementById('downloadBtn').style.display = 'inline-block';
    
    // Show matrix section
    document.getElementById('matrixSection').style.display = 'block';
    
    // Auto-generate matrix structure
    generateMatrixStructure();
}

function getTextareaItems(id, prefix) {
    const textarea = document.getElementById(id);
    const text = textarea.value.trim();
    if (!text) return [];
    
    return text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map((line, index) => {
            // Remove existing bullets or prefixes
            const cleanLine = line.replace(/^[•\-\*]\s*/, '').replace(/^[SWOT]\d+\s*[:\-\.]?\s*/, '');
            return `${prefix}${index + 1}: ${cleanLine}`;
        });
}

function drawSWOTMatrix(strengths, weaknesses, opportunities, threats) {
    const canvas = document.getElementById('swotCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const width = 800;
    const height = 600;
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate quadrant dimensions
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    // Draw quadrants
    drawQuadrant(ctx, 0, 0, halfWidth, halfHeight, 'STRENGTHS', strengths, SWOT_COLORS.strengths, TEXT_COLORS.strengths);
    drawQuadrant(ctx, halfWidth, 0, halfWidth, halfHeight, 'WEAKNESSES', weaknesses, SWOT_COLORS.weaknesses, TEXT_COLORS.weaknesses);
    drawQuadrant(ctx, 0, halfHeight, halfWidth, halfHeight, 'OPPORTUNITIES', opportunities, SWOT_COLORS.opportunities, TEXT_COLORS.opportunities);
    drawQuadrant(ctx, halfWidth, halfHeight, halfWidth, halfHeight, 'THREATS', threats, SWOT_COLORS.threats, TEXT_COLORS.threats);
    
    // Draw border lines
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    // Vertical line
    ctx.moveTo(halfWidth, 0);
    ctx.lineTo(halfWidth, height);
    // Horizontal line
    ctx.moveTo(0, halfHeight);
    ctx.lineTo(width, halfHeight);
    ctx.stroke();
}

function drawQuadrant(ctx, x, y, width, height, title, items, bgColor, textColor) {
    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, width, height);
    
    // Set text properties
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    
    // Draw title
    ctx.font = 'bold 36px Arial';
    ctx.fillText(title, x + width/2, y + 50);
    
    // Draw large letter
    ctx.font = 'bold 80px Arial';
    ctx.fillText(title[0], x + width/2, y + 130);
    
    // Draw items
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    
    const startY = y + 160;
    const lineHeight = 25;
    const maxWidth = width - 40;
    const itemsToShow = Math.min(items.length, Math.floor((height - 170) / lineHeight));
    
    for (let i = 0; i < itemsToShow; i++) {
        const item = items[i];
        const wrappedLines = wrapText(ctx, item, maxWidth);
        
        for (let j = 0; j < wrappedLines.length; j++) {
            const currentY = startY + (i * lineHeight) + (j * 20);
            if (currentY < y + height - 20) {
                ctx.fillText(wrappedLines[j], x + 20, currentY);
            }
        }
    }
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine !== '') {
            lines.push(currentLine);
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
}

function downloadImage() {
    const canvas = document.getElementById('swotCanvas');
    
    // Create a link element
    const link = document.createElement('a');
    link.download = 'swot-analysis.png';
    link.href = canvas.toDataURL('image/png');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Add some sample data when page loads
window.onload = function() {
    document.getElementById('strengths').value = '• Breed productaanbod\n• Internationaal netwerk';
    document.getElementById('weaknesses').value = '• Hoge kostenbasis\n• Complexe structuur';
    document.getElementById('opportunities').value = '• Groeiende vraag naar duurzame materialen\n• Technologische innovaties';
    document.getElementById('threats').value = '• Sterke internationale concurrentie\n• Strengere Europese regelgeving';
};


// Confrontation Matrix Variables
let matrixData = {};
let currentSWOTData = {};

function generateMatrixStructure() {
    // Get current SWOT data
    currentSWOTData = {
        strengths: getTextareaItems('strengths'),
        weaknesses: getTextareaItems('weaknesses'),
        opportunities: getTextareaItems('opportunities'),
        threats: getTextareaItems('threats')
    };
    
    // Create matrix structure
    createMatrixGrid();
}

function createMatrixGrid() {
    const matrix = document.getElementById('confrontationMatrix');
    matrix.innerHTML = '';
    
    const strengthsCount = currentSWOTData.strengths.length || 3;
    const weaknessesCount = currentSWOTData.weaknesses.length || 3;
    const opportunitiesCount = currentSWOTData.opportunities.length || 3;
    const threatsCount = currentSWOTData.threats.length || 3;
    
    const totalRows = 2 + strengthsCount + weaknessesCount; // 2 header rows + strength rows + weakness rows
    const totalCols = 2 + opportunitiesCount + threatsCount; // 2 header cols + opportunity cols + threat cols
    
    // Update grid template - proper structure
    matrix.style.gridTemplateColumns = `120px 80px repeat(${opportunitiesCount}, 1fr) repeat(${threatsCount}, 1fr)`;
    matrix.style.gridTemplateRows = `50px 40px repeat(${strengthsCount + weaknessesCount}, 60px)`;
    
    // Create the matrix structure step by step
    createMatrixHeadersAndCells(matrix, strengthsCount, weaknessesCount, opportunitiesCount, threatsCount);
}

function createMatrixHeadersAndCells(matrix, strengthsCount, weaknessesCount, opportunitiesCount, threatsCount) {
    // Row 1: Main headers
    matrix.appendChild(createCell('', 'header empty'));
    matrix.appendChild(createCell('', 'header empty'));
    matrix.appendChild(createCell('Opportunities', 'header main-header', opportunitiesCount));
    matrix.appendChild(createCell('Threats', 'header main-header', threatsCount));
    
    // Row 2: Sub headers
    matrix.appendChild(createCell('', 'header empty'));
    matrix.appendChild(createCell('', 'header empty'));
    
    // Add O1, O2, O3... headers
    for (let i = 1; i <= opportunitiesCount; i++) {
        const cell = createCell(`O${i}`, 'header sub-header opportunities');
        cell.title = currentSWOTData.opportunities[i-1] || `Opportunity ${i}`;
        matrix.appendChild(cell);
    }
    
    // Add T1, T2, T3... headers
    for (let i = 1; i <= threatsCount; i++) {
        const cell = createCell(`T${i}`, 'header sub-header threats');
        cell.title = currentSWOTData.threats[i-1] || `Threat ${i}`;
        matrix.appendChild(cell);
    }
    
    // Now add the data rows
    // First, add Strengths rows
    for (let s = 1; s <= strengthsCount; s++) {
        // First column: "Strengths" (only for first row)
        if (s === 1) {
            const strengthsLabel = createCell('Strengths', 'header main-header first-strength-row');
            strengthsLabel.style.gridRow = `3 / ${3 + strengthsCount}`;
            matrix.appendChild(strengthsLabel);
        }
        
        // Second column: S1, S2, S3...
        const sCell = createCell(`S${s}`, `header sub-header strengths ${s === 1 ? 'first-strength-row' : ''}`);
        sCell.title = currentSWOTData.strengths[s-1] || `Strength ${s}`;
        matrix.appendChild(sCell);
        
        // Strategy cells for opportunities (SO - Yellow)
        for (let o = 1; o <= opportunitiesCount; o++) {
            const cell = createEditableCell(`S${s}-O${o}`, `strategy-so ${s === 1 ? 'first-strength-row' : ''}`);
            cell.title = `SO Strategy: S${s} + O${o} (Growth)`;
            matrix.appendChild(cell);
        }
        
        // Strategy cells for threats (ST - Blue)
        for (let t = 1; t <= threatsCount; t++) {
            const cell = createEditableCell(`S${s}-T${t}`, `strategy-st ${s === 1 ? 'first-strength-row' : ''}`);
            cell.title = `ST Strategy: S${s} + T${t} (Defensive)`;
            matrix.appendChild(cell);
        }
    }
    
    // Then add Weaknesses rows
    for (let z = 1; z <= weaknessesCount; z++) {
        // First column: "Weaknesses" (only for first row)
        if (z === 1) {
            const weaknessesLabel = createCell('Weaknesses', 'header main-header');
            weaknessesLabel.style.gridRow = `${3 + strengthsCount} / ${3 + strengthsCount + weaknessesCount}`;
            matrix.appendChild(weaknessesLabel);
        }
        
        // Second column: W1, W2, W3...
        const zCell = createCell(`W${z}`, 'header sub-header weaknesses');
        zCell.title = currentSWOTData.weaknesses[z-1] || `Weakness ${z}`;
        matrix.appendChild(zCell);
        
        // Strategy cells for opportunities (WO - Light Green)
        for (let o = 1; o <= opportunitiesCount; o++) {
            const cell = createEditableCell(`W${z}-O${o}`, 'strategy-wo');
            cell.title = `WO Strategy: W${z} + O${o} (Turnaround)`;
            matrix.appendChild(cell);
        }
        
        // Strategy cells for threats (WT - Red)
        for (let t = 1; t <= threatsCount; t++) {
            const cell = createEditableCell(`W${z}-T${t}`, 'strategy-wt');
            cell.title = `WT Strategy: W${z} + T${t} (Survival)`;
            matrix.appendChild(cell);
        }
    }
}

function createCell(text, className, colspan = 1) {
    const cell = document.createElement('div');
    cell.className = `matrix-cell ${className}`;
    cell.textContent = text;
    if (colspan > 1) {
        cell.style.gridColumn = `span ${colspan}`;
    }
    return cell;
}

function createEditableCell(key, strategyType) {
    const cell = document.createElement('div');
    cell.className = `matrix-cell editable ${strategyType}`;
    
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Add strategy...';
    
    // Pre-fill with existing data if available
    if (matrixData[key]) {
        textarea.value = matrixData[key];
    }
    
    textarea.addEventListener('input', function() {
        matrixData[key] = this.value;
    });
    
    cell.appendChild(textarea);
    return cell;
}

function generateMatrix() {
    // Show success message
    alert('Confrontation Matrix structure generated! You can now fill in strategic combinations by typing in the cells.');
    document.getElementById('downloadMatrixBtn').style.display = 'inline-block';
}

function clearMatrix() {
    if (confirm('Are you sure you want to clear all matrix data?')) {
        matrixData = {};
        const textareas = document.querySelectorAll('#confrontationMatrix textarea');
        textareas.forEach(textarea => textarea.value = '');
    }
}

function downloadMatrixImage() {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const width = 1000;
    const height = 800;
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    // Draw matrix
    drawMatrixToCanvas(ctx, width, height);
    
    // Show canvas temporarily for download
    canvas.style.display = 'block';
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'confrontation-matrix.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Hide canvas again
    canvas.style.display = 'none';
}

function drawMatrixToCanvas(ctx, width, height) {
    const strengthsCount = currentSWOTData.strengths.length || 3;
    const weaknessesCount = currentSWOTData.weaknesses.length || 3;
    const opportunitiesCount = currentSWOTData.opportunities.length || 3;
    const threatsCount = currentSWOTData.threats.length || 3;
    
    const cellWidth = (width - 250) / (opportunitiesCount + threatsCount);
    const cellHeight = Math.max(80, (height - 180) / (strengthsCount + weaknessesCount + 2));
    
    // Draw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Confrontation Matrix (TOWS)', width/2, 30);
    
    // Draw main headers
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#4a90e2';
    
    // "Opportunities" header
    const oppsX = 200;
    const oppsWidth = opportunitiesCount * cellWidth;
    ctx.fillRect(oppsX, 60, oppsWidth, 40);
    ctx.fillStyle = 'white';
    ctx.fillText('Opportunities', oppsX + oppsWidth/2, 85);
    
    // "Threats" header
    const threatsX = oppsX + oppsWidth;
    const threatsWidth = threatsCount * cellWidth;
    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(threatsX, 60, threatsWidth, 40);
    ctx.fillStyle = 'white';
    ctx.fillText('Threats', threatsX + threatsWidth/2, 85);
    
    // Draw sub-headers
    ctx.font = 'bold 14px Arial';
    let currentY = 100;
    
    // Opportunities sub-headers (K1, K2, K3...)
    for (let i = 1; i <= opportunitiesCount; i++) {
        const x = oppsX + (i-1) * cellWidth;
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(x, currentY, cellWidth, cellHeight);
        ctx.fillStyle = 'white';
        ctx.fillText(`O${i}`, x + cellWidth/2, currentY + cellHeight/2 + 5);
        
        // Add border to K cells
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, currentY, cellWidth, cellHeight);
    }
    
    // Threats sub-headers (B1, B2, B3...)
    for (let i = 1; i <= threatsCount; i++) {
        const x = threatsX + (i-1) * cellWidth;
        ctx.fillStyle = '#f44336';
        ctx.fillRect(x, currentY, cellWidth, cellHeight);
        ctx.fillStyle = 'white';
        ctx.fillText(`T${i}`, x + cellWidth/2, currentY + cellHeight/2 + 5);
        
        // Add border to B cells
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, currentY, cellWidth, cellHeight);
    }
    
    currentY += cellHeight;
    
    // Draw "Strengths" section
    ctx.fillStyle = '#4a90e2';
    const strengthsHeight = strengthsCount * cellHeight;
    ctx.fillRect(20, currentY, 80, strengthsHeight);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Strengths', 60, currentY + strengthsHeight/2 + 5);
    
    // Draw Strengths rows and strategy cells
    for (let s = 1; s <= strengthsCount; s++) {
        const rowY = currentY + (s-1) * cellHeight;
        
        // S1, S2, S3 labels
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(100, rowY, 100, cellHeight);
        ctx.fillStyle = 'white';
        ctx.fillText(`S${s}`, 150, rowY + cellHeight/2 + 5);
        
        // Add border to S cells
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(100, rowY, 100, cellHeight);
        
        // SO strategies (Yellow)
        for (let k = 1; k <= opportunitiesCount; k++) {
            const x = oppsX + (k-1) * cellWidth;
            ctx.fillStyle = '#ffeb3b';
            ctx.fillRect(x, rowY, cellWidth, cellHeight);
            
            // Add border to SO strategy cells
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, rowY, cellWidth, cellHeight);
            
            // Draw strategy text if any
            const cellKey = `S${s}-O${k}`;
            if (matrixData[cellKey]) {
                ctx.fillStyle = '#333';
                ctx.font = '9px Arial';
                ctx.textAlign = 'left';
                drawWrappedText(ctx, matrixData[cellKey], x + 8, rowY + 20, cellWidth - 16, 11);
            }
        }
        
        // ST strategies (Blue)
        for (let b = 1; b <= threatsCount; b++) {
            const x = threatsX + (b-1) * cellWidth;
            ctx.fillStyle = '#2196f3';
            ctx.fillRect(x, rowY, cellWidth, cellHeight);
            
            // Add border to ST strategy cells
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, rowY, cellWidth, cellHeight);
            
            // Draw strategy text if any
            const cellKey = `S${s}-T${b}`;
            if (matrixData[cellKey]) {
                ctx.fillStyle = 'white';
                ctx.font = '9px Arial';
                ctx.textAlign = 'left';
                drawWrappedText(ctx, matrixData[cellKey], x + 8, rowY + 20, cellWidth - 16, 11);
            }
        }
    }
    
    currentY += strengthsHeight;
    
    // Draw horizontal border between Strengths and Weaknesses sections
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, currentY);
    ctx.lineTo(oppsX + oppsWidth + threatsWidth, currentY);
    ctx.stroke();
    
    // Draw "Weaknesses" section
    ctx.fillStyle = '#4a90e2';
    const weaknessesHeight = weaknessesCount * cellHeight;
    ctx.fillRect(20, currentY, 80, weaknessesHeight);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Weaknesses', 60, currentY + weaknessesHeight/2 + 5);
    
    // Draw Weaknesses rows and strategy cells
    for (let z = 1; z <= weaknessesCount; z++) {
        const rowY = currentY + (z-1) * cellHeight;
        
        // W1, W2, W3 labels
        ctx.fillStyle = '#FF9800';
        ctx.fillRect(100, rowY, 100, cellHeight);
        ctx.fillStyle = 'white';
        ctx.fillText(`W${z}`, 150, rowY + cellHeight/2 + 5);
        
        // Add border to Z cells
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(100, rowY, 100, cellHeight);
        
        // WO strategies (Light Green)
        for (let k = 1; k <= opportunitiesCount; k++) {
            const x = oppsX + (k-1) * cellWidth;
            ctx.fillStyle = '#8bc34a';
            ctx.fillRect(x, rowY, cellWidth, cellHeight);
            
            // Add border to WO strategy cells
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, rowY, cellWidth, cellHeight);
            
            // Draw strategy text if any
            const cellKey = `W${z}-O${k}`;
            if (matrixData[cellKey]) {
                ctx.fillStyle = 'white';
                ctx.font = '9px Arial';
                ctx.textAlign = 'left';
                drawWrappedText(ctx, matrixData[cellKey], x + 8, rowY + 20, cellWidth - 16, 11);
            }
        }
        
        // WT strategies (Red)
        for (let b = 1; b <= threatsCount; b++) {
            const x = threatsX + (b-1) * cellWidth;
            ctx.fillStyle = '#f44336';
            ctx.fillRect(x, rowY, cellWidth, cellHeight);
            
            // Add border to WT strategy cells
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, rowY, cellWidth, cellHeight);
            
            // Draw strategy text if any
            const cellKey = `W${z}-T${b}`;
            if (matrixData[cellKey]) {
                ctx.fillStyle = 'white';
                ctx.font = '9px Arial';
                ctx.textAlign = 'left';
                drawWrappedText(ctx, matrixData[cellKey], x + 8, rowY + 20, cellWidth - 16, 11);
            }
        }
    }
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    
    for (let word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine !== '') {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    // Limit to maximum 5 lines to prevent overflow
    if (lines.length > 5) {
        lines = lines.slice(0, 4);
        lines.push(lines[4] + '...');
    }
    
    // Draw each line
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y + (i * lineHeight));
    }
}