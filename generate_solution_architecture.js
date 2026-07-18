const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure pdfkit is installed
try {
  require.resolve('pdfkit');
} catch (e) {
  console.log('Installing pdfkit to generate Solution Architecture PDF...');
  execSync('npm install pdfkit --no-save', { stdio: 'inherit' });
}

const PDFDocument = require('pdfkit');

const buildSolutionArchitecturePDF = () => {
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

  const pdfPath = path.join(outputDir, 'Solution Architecture.pdf');
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
  const imgPath = path.join(brainDir, 'solution_map_1784388264373.png');

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

  const addBulletPoint = (text) => {
    doc.fillColor(colorText).fontSize(10.5).font(fontBody).text('• ' + text, { lineGap: 4 });
    doc.moveDown(0.3);
  };

  // --- Page 1: Metadata Table, Title, and Intro ---
  addHeaderTable();

  // Document Title
  doc.fontSize(15).font(fontTitle).text('PROJECT DESIGN PHASE: SOLUTION ARCHITECTURE', { align: 'center' });
  doc.moveDown(1.2);

  addCenteredHeading('Solution Architecture Overview');
  addCenteredParagraph('Solution architecture is a complex process – with many sub-processes – that bridges the gap between business problems and technology solutions. Its goals are to:');
  doc.moveDown(0.5);

  addBulletPoint('Find the best tech solution to solve existing business problems.');
  addBulletPoint('Describe the structure, characteristics, behavior, and other aspects of the software to project stakeholders.');
  addBulletPoint('Define features, development phases, and solution requirements.');
  addBulletPoint('Provide specifications according to which the solution is defined, managed, and delivered.');

  if (fs.existsSync(imgPath)) {
    doc.moveDown(0.5);
    doc.image(imgPath, {
      fit: [460, 260],
      align: 'center'
    });
    doc.moveDown(0.8);
    doc.fillColor(colorSub).fontSize(9.5).font(fontBody).text('Figure 1: Solution Architecture Diagram detailing presentation, server application, and database storage tiers.', { align: 'center' });
  }

  // --- Page 2: System Tiers Detailed ---
  doc.addPage();
  addCenteredHeading('Architecture Layers Breakdown');
  
  doc.font(fontHeader).fontSize(11).fillColor(colorPrimary).text('1. Presentation Tier (Frontend Client)', { align: 'center' });
  addCenteredParagraph('A Single Page Application (SPA) built using React.js. It manages active routing paths via React Router, authenticates states via context APIs, and performs structured HTTP request queries to the application tier using Axios.');

  doc.font(fontHeader).fontSize(11).fillColor(colorPrimary).text('2. Application Tier (REST API Server)', { align: 'center' });
  addCenteredParagraph('An Express.js server hosted on Node.js. It registers endpoint routes for authorization, book inventory updates, and order generation. Middlewares verify incoming JWT tokens and manage local file directory storage via Multer.');

  doc.font(fontHeader).fontSize(11).fillColor(colorPrimary).text('3. Data Tier (Cloud Storage Cluster)', { align: 'center' });
  addCenteredParagraph('A cloud-hosted MongoDB Atlas replica set cluster. Object-document mapping is coordinated via Mongoose schema definitions (Admins, Sellers, Users, Books, Orders) which validate and update catalog records.');

  // Page Numbers Footer
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.strokeColor('#000000').lineWidth(0.5).moveTo(55, 790).lineTo(540, 790).stroke();
    doc.fillColor(colorSub).fontSize(9).font(fontBody)
       .text(`Page ${i + 1} of ${pages.count}`, 55, 800, { align: 'right' });
  }

  doc.end();
  console.log('Solution Architecture PDF generated successfully: Solution Architecture.pdf');
};

buildSolutionArchitecturePDF();
