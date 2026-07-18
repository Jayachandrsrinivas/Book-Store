const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure pdfkit is installed
try {
  require.resolve('pdfkit');
} catch (e) {
  console.log('Installing pdfkit to generate Problem Statement PDF...');
  execSync('npm install pdfkit --no-save', { stdio: 'inherit' });
}

const PDFDocument = require('pdfkit');

const buildProblemStatementPDF = () => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 55, bottom: 55, left: 55, right: 55 },
    bufferPages: true
  });

  // Target directory "1. Ideation phase" in workspace root
  const outputDir = path.join(__dirname, '1. Ideation phase');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, 'Problem Statement.pdf');
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  // Formatting variables
  const fontTitle = 'Times-Bold';
  const fontBody = 'Times-Roman';
  const fontHeader = 'Times-Bold';
  const colorPrimary = '#000000';
  const colorText = '#1A1A1A';
  const colorSub = '#555555';

  // Path of the generated illustration
  const brainDir = 'C:\\Users\\raman\\.gemini\\antigravity\\brain\\6bd19433-e93c-41ee-8bdc-1c3bcff342c6';
  const imgPath = path.join(brainDir, 'problem_illustration_1784369423197.png');

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

  // --- Compile Pages ---
  addHeaderTable();

  // Document Title (Centered)
  doc.fontSize(16).font(fontTitle).text('IDEATION PHASE: PROBLEM STATEMENT ANALYSIS', { align: 'center' });
  doc.moveDown(1.5);

  addCenteredHeading('The Challenge of Digital Accessibility for Local Booksellers');
  addCenteredParagraph('Traditional, independent booksellers often operate with thin margins and struggle to establish an online presence. Creating a customized e-commerce web platform requires software engineering skills, host configuration knowledge, and high development costs. Consequently, small local retailers remain locked out of the digital economy.');

  addCenteredHeading('User Friction & Cart Abandonment for Readers');
  addCenteredParagraph('For readers, purchasing books online often involves navigating cluttered interfaces filled with irrelevant items and dealing with multi-step checkout processes. This leads to high cart abandonment rates. Additionally, customers lack direct ways to buy books from verified independent sellers securely.');

  if (fs.existsSync(imgPath)) {
    doc.moveDown(1);
    doc.image(imgPath, {
      fit: [440, 240],
      align: 'center'
    });
    doc.moveDown(0.8);
    doc.fillColor(colorSub).fontSize(9.5).font(fontBody).text('Figure 1: Illustration of technical and economic barriers faced by local bookstore owners.', { align: 'center' });
  }

  doc.addPage();
  addCenteredHeading('Proposed Solution: BookVerse');
  addCenteredParagraph('The BookStore (BookVerse) application addresses these issues by offering a streamlined, lightweight, role-based platform. By providing approved sellers with dedicated dashboards for catalog uploads and order status tracking, and customers with a simplified "Buy Now" instant checkout flow, the platform creates an efficient and accessible online ecosystem.');

  // Page Numbers Footer
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.strokeColor('#000000').lineWidth(0.5).moveTo(55, 790).lineTo(540, 790).stroke();
    doc.fillColor(colorSub).fontSize(9).font(fontBody)
       .text(`Page ${i + 1} of ${pages.count}`, 55, 800, { align: 'right' });
  }

  doc.end();
  console.log('Problem Statement PDF generated successfully: Problem Statement.pdf');
};

buildProblemStatementPDF();
