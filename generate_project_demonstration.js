const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure pdfkit is installed
try {
  require.resolve('pdfkit');
} catch (e) {
  console.log('Installing pdfkit to generate Project Demonstration PDF...');
  execSync('npm install pdfkit --no-save', { stdio: 'inherit' });
}

const PDFDocument = require('pdfkit');

const buildDemonstrationPDF = () => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 55, bottom: 55, left: 55, right: 55 },
    bufferPages: true
  });

  // Create "7. Project Demonstration" directory in workspace root
  const outputDir = path.join(__dirname, '7. Project Demonstration');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, 'Project Demonstration.pdf');
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  // Formatting variables
  const fontTitle = 'Times-Bold';
  const fontBody = 'Times-Roman';
  const fontHeader = 'Times-Bold';
  const colorPrimary = '#000000';
  const colorText = '#1A1A1A';
  const colorSub = '#555555';

  // Path of the brain image folder
  const brainDir = 'C:\\Users\\raman\\.gemini\\antigravity\\brain\\6bd19433-e93c-41ee-8bdc-1c3bcff342c6';

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
    doc.font(fontBody).text('18 July 2026', col2X + 8, tableTop + 5);

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
    doc.moveDown(1.2);
    doc.fillColor(colorPrimary).fontSize(13).font(fontTitle).text(text, { align: 'center' });
    doc.moveDown(0.5);
  };

  const addDemoImagePage = (fileName, heading, description) => {
    const filePath = path.join(brainDir, fileName);
    if (fs.existsSync(filePath)) {
      doc.addPage();
      doc.fillColor(colorPrimary).fontSize(14).font(fontTitle).text(heading, { align: 'center' });
      doc.moveDown(0.5);
      
      doc.image(filePath, {
        fit: [495, 340],
        align: 'center',
        valign: 'center'
      });
      doc.moveDown(1.5);
      
      doc.fillColor(colorText).fontSize(10.5).font(fontBody).text(description, { align: 'center', lineGap: 3 });
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  };

  // --- Page 1: Metadata Table, Title, and Intro ---
  addHeaderTable();

  // Document Title
  doc.fontSize(15).font(fontTitle).text('PROJECT DEVELOPMENT PHASE: WALKTHROUGH', { align: 'center' });
  doc.moveDown(1.2);

  addCenteredHeading('Project Demonstration & Execution Guide');
  addCenteredParagraph('The Book Store (BookVerse) application is fully deployed and verified. To demonstrate the working features of the system, this document outlines the core client views, vendor dashboards, and administrator interfaces page-by-page.');
  
  addCenteredHeading('Live Project Access');
  addCenteredParagraph('The live online website is hosted on Render at:');
  doc.fillColor('blue').font(fontBody).fontSize(11).text('https://book-store-nzxy.onrender.com/', {
    align: 'center',
    link: 'https://book-store-nzxy.onrender.com/',
    underline: true
  });
  doc.moveDown(1);
  addCenteredParagraph('The following pages present screenshots of each workflow in action.');

  // --- Image Pages ---
  addDemoImagePage(
    'media__1784304688594.png',
    '1. Guest Home Landing Page',
    'Figure 1: The BookVerse landing homepage showing the custom category grid (Fiction, Science, Biographies, Children\'s Books) and multi-role login badges.'
  );

  addDemoImagePage(
    'media__1784304710949.png',
    '2. Administrator Dashboard',
    'Figure 2: The system admin dashboard showing aggregate stats of Users, Sellers, Books, and Orders, along with a custom SVG vertical chart.'
  );

  addDemoImagePage(
    'media__1784304710976.png',
    '3. Admin Users Management List',
    'Figure 3: Detailed users management view within the admin dashboard listing Sl/No, User ID, Name, Email, and operation buttons.'
  );

  addDemoImagePage(
    'media__1784304891346.png',
    '4. Seller Dashboard',
    'Figure 4: Approved seller portal rendering metrics for total items and orders, alongside a custom SVG bar chart indicating the seller\'s specific counts.'
  );

  addDemoImagePage(
    'media__1784304891353.png',
    '5. Seller Listed Books',
    'Figure 5: Seller catalog management view displaying currently listed books as product cards with title, author, genre, price, and cover image, complete with delete triggers.'
  );

  addDemoImagePage(
    'media__1784304931222.png',
    '6. Seller Add Product Form',
    'Figure 6: Product creation interface for sellers allowing inputs for Title, Author, Genre, Price, Description, and a cover image file upload.'
  );

  addDemoImagePage(
    'media__1784304931230.png',
    '7. Seller Orders Fulfillment Tracker',
    'Figure 7: Seller orders log sheet showing details of orders placed for their books, booking dates, delivery estimations, price, and status controllers.'
  );

  addDemoImagePage(
    'media__1784305019793.png',
    '8. Customer Catalog Explorer',
    'Figure 8: Customer books list grid featuring search bars, genre selectors, and book cards containing details and action buttons.'
  );

  addDemoImagePage(
    'media__1784305019770.png',
    '9. Customer Book Details & Checkout',
    'Figure 9: Detailed single book view with cover display, description card, info card, and the Buy Now checkout button.'
  );

  addDemoImagePage(
    'media__1784305019758.png',
    '10. Customer Orders Tracker',
    'Figure 10: Customer order tracker list page displaying historical order cards, tracking statuses, and the BookVerse contact footer.'
  );

  // Footer and Page Numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    if (i > 0) {
      doc.strokeColor('#000000').lineWidth(0.5).moveTo(55, 790).lineTo(540, 790).stroke();
      doc.fillColor(colorSub).fontSize(9).font(fontBody)
         .text(`Page ${i + 1} of ${pages.count}`, 55, 800, { align: 'right' });
    }
  }

  doc.end();
  console.log('Project Demonstration PDF generated successfully: Project Demonstration.pdf');
};

buildDemonstrationPDF();
