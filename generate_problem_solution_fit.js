const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure pdfkit is installed
try {
  require.resolve('pdfkit');
} catch (e) {
  console.log('Installing pdfkit to generate Problem-Solution Fit PDF...');
  execSync('npm install pdfkit --no-save', { stdio: 'inherit' });
}

const PDFDocument = require('pdfkit');

const buildProblemSolutionFitPDF = () => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 55, bottom: 55, left: 55, right: 55 },
    bufferPages: true
  });

  // Create "3. Project Design Phase" directory in workspace root
  const outputDir = path.join(__dirname, '3. Project Design Phase');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, 'Problem Solution fit.pdf');
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  // Formatting variables
  const fontTitle = 'Times-Bold';
  const fontBody = 'Times-Roman';
  const fontHeader = 'Times-Bold';
  const colorPrimary = '#000000';
  const colorText = '#1A1A1A';
  const colorSub = '#555555';

  // Paths of generated architecture image
  const brainDir = 'C:\\Users\\raman\\.gemini\\antigravity\\brain\\6bd19433-e93c-41ee-8bdc-1c3bcff342c6';
  const imgPath = path.join(brainDir, 'problem_solution_1784386108088.png');

  // Helpers
  const addHeaderTable = () => {
    // Draw table on the right side of the page (X: 340 to 540)
    const tableTop = 55;
    const col1X = 340;
    const col2X = 440;
    const rowHeight = 20;
    const tableWidth = 200;

    doc.strokeColor('#000000').lineWidth(0.5);

    // Draw Outer Box (4 rows)
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
    doc.font(fontBody).text('3 July 2026', col2X + 8, tableTop + 5);

    // Row 2
    doc.font(fontHeader).text('Team ID', col1X + 8, tableTop + rowHeight + 5);
    doc.font(fontBody).text('-', col2X + 8, tableTop + rowHeight + 5);

    // Row 3
    doc.font(fontHeader).text('Project Name', col1X + 8, tableTop + rowHeight * 2 + 5);
    doc.font(fontBody).text('Book-Store', col2X + 8, tableTop + rowHeight * 2 + 5);

    // Row 4
    doc.font(fontHeader).text('Maximum Marks', col1X + 8, tableTop + rowHeight * 3 + 5);
    doc.font(fontBody).text('2 Marks', col2X + 8, tableTop + rowHeight * 3 + 5);

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

  const addBulletPoint = (title, body) => {
    doc.fillColor(colorPrimary).fontSize(10.5).font(fontHeader).text('• ' + title + ': ', { continued: true });
    doc.fillColor(colorText).font(fontBody).text(body, { lineGap: 3 });
    doc.moveDown(0.3);
  };

  // --- Page 1: Metadata Table, Title, and Intro ---
  addHeaderTable();

  // Document Title
  doc.fontSize(15).font(fontTitle).text('PROJECT DESIGN PHASE: PROBLEM-SOLUTION FIT', { align: 'center' });
  doc.moveDown(1.2);

  addCenteredHeading('Problem – Solution Fit Template');
  addCenteredParagraph('The Problem-Solution Fit simply means that you have found a problem with your customer and that the solution you have realized for it actually solves the customer\'s problem. It helps entrepreneurs, marketers and corporate innovators identify behavioral patterns and recognize what would work and why.');

  if (fs.existsSync(imgPath)) {
    doc.moveDown(0.5);
    doc.image(imgPath, {
      fit: [460, 260],
      align: 'center'
    });
    doc.moveDown(0.8);
    doc.fillColor(colorSub).fontSize(9.5).font(fontBody).text('Figure 1: Problem-Solution Fit diagram depicting customer needs alignment with system solutions.', { align: 'center' });
  }

  // --- Page 2: Purpose & Bookstore Fit ---
  doc.addPage();
  addCenteredHeading('Purpose of the Template');
  addCenteredParagraph('By structuring our development cycles around the Problem-Solution Fit, we achieved the following core objectives:');
  doc.moveDown(0.5);

  addBulletPoint('Solve Complex Customer Pain Points', 'Providing an easy, direct checkout page to simplify ordering and prevent cart abandonments.');
  addBulletPoint('Accelerate Solution Adoption', 'Tapping into simple online browsing layouts that match familiar e-commerce patterns.');
  addBulletPoint('Improve Target Group Situation', 'Allowing small booksellers to list items and process orders directly with zero technology overhead.');
  addBulletPoint('Build Trust with Verified Channels', 'Using an administrator verification queue to approve and monitor active sellers.');

  addCenteredHeading('Bookstore (BookVerse) Problem-Solution Fit Analysis');
  addCenteredParagraph('Our project directly maps Small Bookstore barriers to clear engineering features:');
  doc.moveDown(0.5);

  addBulletPoint('Customer Friction', 'Solved by introducing an instant "Buy Now" checkout collecting customer delivery names and addresses in one step.');
  addBulletPoint('Seller Accessibility', 'Solved by creating dedicated Seller Dashboards to add books, upload cover art files, and track shipment log states.');
  addBulletPoint('System Integrity', 'Solved by introducing an Admin control board to approve new vendor registrations and delete outdated entries.');

  // Page Numbers Footer
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.strokeColor('#000000').lineWidth(0.5).moveTo(55, 790).lineTo(540, 790).stroke();
    doc.fillColor(colorSub).fontSize(9).font(fontBody)
       .text(`Page ${i + 1} of ${pages.count}`, 55, 800, { align: 'right' });
  }

  doc.end();
  console.log('Problem-Solution Fit PDF generated successfully: Problem Solution fit.pdf');
};

buildProblemSolutionFitPDF();
