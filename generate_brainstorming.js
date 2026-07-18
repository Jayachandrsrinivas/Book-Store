const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure pdfkit is installed
try {
  require.resolve('pdfkit');
} catch (e) {
  console.log('Installing pdfkit to generate BrainStorming PDF...');
  execSync('npm install pdfkit --no-save', { stdio: 'inherit' });
}

const PDFDocument = require('pdfkit');

const buildBrainstormingPDF = () => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 55, bottom: 55, left: 55, right: 55 },
    bufferPages: true
  });

  // Create "1. Ideation phase" directory in workspace root
  const outputDir = path.join(__dirname, '1. Ideation phase');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, 'BrainStorming.pdf');
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  // Formatting variables
  const fontTitle = 'Times-Bold';
  const fontBody = 'Times-Roman';
  const fontHeader = 'Times-Bold';
  const colorPrimary = '#000000';
  const colorText = '#1A1A1A';
  const colorSub = '#555555';

  // Paths of uploaded whiteboard images
  const brainDir = 'C:\\Users\\raman\\.gemini\\antigravity\\brain\\6bd19433-e93c-41ee-8bdc-1c3bcff342c6';
  const img1 = path.join(brainDir, 'media__1784367670883.png'); // Step 1 (Landscape)
  const img2 = path.join(brainDir, 'media__1784367670860.png'); // Step 2 (Landscape)
  const img3 = path.join(brainDir, 'media__1784367670859.png'); // Step 3 (Portrait)

  // Helpers
  const addHeaderTable = () => {
    // Draw table on the right side of the page (X: 340 to 540)
    const tableTop = 55;
    const col1X = 340;
    const col2X = 440;
    const rowHeight = 20;
    const tableWidth = 200;

    doc.strokeColor('#000000').lineWidth(0.5);

    // Draw Outer Box
    doc.rect(col1X, tableTop, tableWidth, rowHeight * 3).stroke();

    // Draw horizontal dividers
    doc.moveTo(col1X, tableTop + rowHeight).lineTo(col1X + tableWidth, tableTop + rowHeight).stroke();
    doc.moveTo(col1X, tableTop + rowHeight * 2).lineTo(col1X + tableWidth, tableTop + rowHeight * 2).stroke();

    // Draw vertical divider
    doc.moveTo(col2X, tableTop).lineTo(col2X, tableTop + rowHeight * 3).stroke();

    // Fill table cell contents
    doc.font(fontHeader).fontSize(9.5).fillColor(colorPrimary);

    // Row 1
    doc.text('Date', col1X + 8, tableTop + 5);
    doc.font(fontBody).text('30 June 2026', col2X + 8, tableTop + 5);

    // Row 2
    doc.font(fontHeader).text('Project Name', col1X + 8, tableTop + rowHeight + 5);
    doc.font(fontBody).text('Book-Store', col2X + 8, tableTop + rowHeight + 5);

    // Row 3
    doc.font(fontHeader).text('Maximum Marks', col1X + 8, tableTop + rowHeight * 2 + 5);
    doc.font(fontBody).text('4 Marks', col2X + 8, tableTop + rowHeight * 2 + 5);

    // Position Y-cursor below table
    doc.y = tableTop + rowHeight * 3 + 25;
  };

  const addCenteredParagraph = (text) => {
    doc.fillColor(colorText).fontSize(11).font(fontBody).text(text, { align: 'center', lineGap: 4 });
    doc.moveDown(0.5);
  };

  const addCenteredStepHeading = (title) => {
    doc.fillColor(colorPrimary).fontSize(13).font(fontTitle).text(title, { align: 'center' });
    doc.moveDown(0.5);
  };

  const addCenteredStepImage = (filePath, caption, isPortrait = false) => {
    if (fs.existsSync(filePath)) {
      doc.moveDown(0.5);
      // Center the image box
      const fitWidth = 440;
      const fitHeight = isPortrait ? 330 : 250;
      doc.image(filePath, {
        fit: [fitWidth, fitHeight],
        align: 'center',
        valign: 'center'
      });
      doc.moveDown(0.8);
      doc.fillColor(colorSub).fontSize(9.5).font(fontBody).text(caption, { align: 'center' });
    } else {
      console.warn(`Warning: Image file not found: ${filePath}`);
    }
  };

  // --- Page 1: Metadata Table, Title, and Introduction ---
  addHeaderTable();

  // Document Title
  doc.fontSize(16).font(fontTitle).text('IDEATION PHASE: BRAINSTORM & IDEA PRIORITIZATION', { align: 'center' });
  doc.moveDown(1.2);

  // Brainstorming Intro Paragraphs
  addCenteredParagraph('Brainstorming provides a free and open environment that encourages everyone within a team to participate in the creative thinking process that leads to problem solving. Prioritizing volume over value, out-of-the-box ideas are welcome and built upon, and all participants are encouraged to collaborate, helping each other develop a rich amount of creative solutions.');
  addCenteredParagraph('Use this template in your own brainstorming sessions so your team can unleash their imagination and start shaping concepts even if you\'re not sitting in the same room.');

  // --- Page 2: Step 1 (On its own clean page) ---
  doc.addPage();
  addCenteredStepHeading('Step-1: Team Gathering, Collaboration and Select the Problem Statement');
  addCenteredParagraph('The development team initiated the ideation phase by gathering to analyze the core challenges within the digital bookstore industry. By discussing target demographics, seller limitations, and cart abandonment concerns, the team formulated and finalized the problem statement for the BookStore (BookVerse) application.');
  addCenteredStepImage(img1, 'Figure 1: Miro team collaboration workspace map used to define the BookStore problem statement.');

  // --- Page 3: Step 2 (On its own clean page) ---
  doc.addPage();
  addCenteredStepHeading('Step-2: Brainstorm, Idea Listing and Grouping');
  addCenteredParagraph('During the idea listing phase, team members generated diverse ideas for site capabilities. These concepts were grouped into distinct architectural models: User shopping experience, Seller book inventory control, and Administrative approval and logging monitors.');
  addCenteredStepImage(img2, 'Figure 2: Idea brainstorming and grouping whiteboard with virtual sticky notes.');

  // --- Page 4: Step 3 (On its own clean page) ---
  doc.addPage();
  addCenteredStepHeading('Step-3: Idea Prioritization');
  addCenteredParagraph('Using a 2x2 Action Priority Matrix (comparing System Impact vs Implementation Effort), the team mapped listed ideas to identify quick wins. Features such as direct checkout, visual dashboard charts, and search filters were prioritized as core MVP components, while payment gateway integrations were scheduled for future releases.');
  addCenteredStepImage(img3, 'Figure 3: 2x2 Importance vs Feasibility matrix for priority task selection.', true);

  // Footer and Page Numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.strokeColor('#000000').lineWidth(0.5).moveTo(55, 790).lineTo(540, 790).stroke();
    doc.fillColor(colorSub).fontSize(9).font(fontBody)
       .text(`Page ${i + 1} of ${pages.count}`, 55, 800, { align: 'right' });
  }

  doc.end();
  console.log('BrainStorming PDF updated successfully: BrainStorming.pdf');
};

buildBrainstormingPDF();
