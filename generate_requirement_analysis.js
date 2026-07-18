const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure pdfkit is installed
try {
  require.resolve('pdfkit');
} catch (e) {
  console.log('Installing pdfkit to generate Requirement Analysis PDF...');
  execSync('npm install pdfkit --no-save', { stdio: 'inherit' });
}

const PDFDocument = require('pdfkit');

const buildRequirementAnalysisPDF = () => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 55, bottom: 55, left: 55, right: 55 },
    bufferPages: true
  });

  // Create "2. Requirement analysis" directory in workspace root
  const outputDir = path.join(__dirname, '2. Requirement analysis');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, 'Data Flow Diagram & User Stories.pdf');
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
  const imgDfd = path.join(brainDir, 'media__1784374050116.png'); // DFD page image
  const imgUs = path.join(brainDir, 'media__1784374050115.png');  // User stories image

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
    doc.rect(col1X, tableTop, tableWidth, rowHeight * 4).stroke();

    // Draw horizontal dividers
    doc.moveTo(col1X, tableTop + rowHeight).lineTo(col1X + tableWidth, tableTop + rowHeight).stroke();
    doc.moveTo(col1X, tableTop + rowHeight * 2).lineTo(col1X + tableWidth, tableTop + rowHeight * 2).stroke();
    doc.moveTo(col1X, tableTop + rowHeight * 3).lineTo(col1X + tableWidth, tableTop + rowHeight * 3).stroke();

    // Draw vertical divider
    doc.moveTo(col2X, tableTop).lineTo(col2X, tableTop + rowHeight * 4).stroke();

    // Fill table cell contents
    doc.font(fontHeader).fontSize(9.5).fillColor(colorPrimary);

    // Row 1
    doc.text('Date', col1X + 8, tableTop + 5);
    doc.font(fontBody).text('31 January 2025', col2X + 8, tableTop + 5);

    // Row 2
    doc.font(fontHeader).text('Team ID', col1X + 8, tableTop + rowHeight + 5);
    doc.font(fontBody).text('-', col2X + 8, tableTop + rowHeight + 5);

    // Row 3
    doc.font(fontHeader).text('Project Name', col1X + 8, tableTop + rowHeight * 2 + 5);
    doc.font(fontBody).text('Book-Store', col2X + 8, tableTop + rowHeight * 2 + 5);

    // Row 4
    doc.font(fontHeader).text('Maximum Marks', col1X + 8, tableTop + rowHeight * 3 + 5);
    doc.font(fontBody).text('4 Marks', col2X + 8, tableTop + rowHeight * 3 + 5);

    // Position Y-cursor below table
    doc.y = tableTop + rowHeight * 4 + 25;
    doc.x = 55; // Reset X-cursor back to the left margin!
  };

  const addCenteredParagraph = (text) => {
    doc.fillColor(colorText).fontSize(11).font(fontBody).text(text, { align: 'center', lineGap: 4 });
    doc.moveDown(0.5);
  };

  const addCenteredHeading = (text) => {
    doc.moveDown(1);
    doc.fillColor(colorPrimary).fontSize(13).font(fontTitle).text(text, { align: 'center' });
    doc.moveDown(0.5);
  };

  // --- Page 1: Metadata Table, Title, and DFD ---
  addHeaderTable();

  // Document Title
  doc.fontSize(15).font(fontTitle).text('PROJECT DESIGN PHASE-II: REQUIREMENT ANALYSIS', { align: 'center' });
  doc.moveDown(1.2);

  addCenteredHeading('Data Flow Diagrams');
  addCenteredParagraph('A Data Flow Diagram (DFD) is a traditional visual representation of the information flows within a system. A neat and clear DFD can depict the right amount of the system requirement graphically. It shows how data enters and leaves the system, what changes the information, and where data is stored.');

  if (fs.existsSync(imgDfd)) {
    doc.moveDown(0.5);
    doc.image(imgDfd, {
      fit: [460, 260],
      align: 'center'
    });
    doc.moveDown(0.8);
    doc.fillColor(colorSub).fontSize(9.5).font(fontBody).text('Figure 1: Simplified system flow and Level 0 Industry Standard DFD for BookStore application.', { align: 'center' });
  }

  // --- Page 2: User Stories ---
  doc.addPage();
  addCenteredHeading('User Stories');
  addCenteredParagraph('Use the below template to list all the user stories for the product. This details how various user roles (Customers, Sellers, and Admins) interact with the functional epics of the system.');

  if (fs.existsSync(imgUs)) {
    doc.moveDown(0.5);
    doc.image(imgUs, {
      fit: [460, 220],
      align: 'center'
    });
    doc.moveDown(0.8);
    doc.fillColor(colorSub).fontSize(9.5).font(fontBody).text('Figure 2: MERN Bookstore customer and administrator User Story catalog template.', { align: 'center' });
  }

  doc.moveDown(1.5);
  doc.font(fontHeader).fontSize(11).fillColor(colorPrimary).text('Functional User Stories Summary:', { align: 'center' });
  doc.moveDown(0.5);
  addCenteredParagraph('1. As a Customer, I can register and login securely to access my catalog dashboard (Priority: High / Sprint 1).');
  addCenteredParagraph('2. As a Customer, I can search books by title/genre and checkout instantly by providing my shipping address (Priority: High / Sprint 1).');
  addCenteredParagraph('3. As a Seller, I can list books with cover image uploads and update order shipping logs (Priority: High / Sprint 1).');
  addCenteredParagraph('4. As an Admin, I can approve pending seller registrations and delete outdated user order records (Priority: High / Sprint 2).');

  // Footer and Page Numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.strokeColor('#000000').lineWidth(0.5).moveTo(55, 790).lineTo(540, 790).stroke();
    doc.fillColor(colorSub).fontSize(9).font(fontBody)
       .text(`Page ${i + 1} of ${pages.count}`, 55, 800, { align: 'right' });
  }

  doc.end();
  console.log('Requirement Analysis PDF generated successfully: Data Flow Diagram & User Stories.pdf');
};

buildRequirementAnalysisPDF();
