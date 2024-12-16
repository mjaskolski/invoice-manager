const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs/promises');
const path = require('path');

function sanitizeCompanyName(name) {
    // Replace special characters with spaces, then remove multiple spaces
    return name
        .replace(/[^a-zA-Z0-9\s-]/g, ' ')  // Replace special chars with space
        .replace(/\s+/g, ' ')              // Replace multiple spaces with single space
        .trim();                           // Remove leading/trailing spaces
}

function sanitizeInvoiceNumber(invoiceNumber) {
    // Replace special characters with hyphens, collapse multiple hyphens
    return invoiceNumber
        .replace(/[^a-zA-Z0-9-]/g, '-')    // Replace special chars with hyphen
        .replace(/-+/g, '-')               // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, '');            // Remove leading/trailing hyphens
}

// Validate required environment variables
const requiredEnvVars = ['ANTHROPIC_API_KEY', 'SOURCE_DIR', 'BASE_TARGET_DIR'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('Error: Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SOURCE_DIR = process.env.SOURCE_DIR;
const BASE_TARGET_DIR = process.env.BASE_TARGET_DIR;

// Validate directories exist
async function validateDirectories() {
    try {
        await fs.access(SOURCE_DIR);
        await fs.access(BASE_TARGET_DIR);
    } catch (error) {
        console.error('Error: Directory does not exist or is not accessible:', error.message);
        process.exit(1);
    }
}

async function extractInvoiceData(pdfPath) {
    const pdfBuffer = await fs.readFile(pdfPath);
    const pdfBase64 = pdfBuffer.toString('base64');

    const response = await anthropic.beta.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        betas: ["pdfs-2024-09-25"],
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'document',
                        source: {
                            type: 'base64',
                            media_type: 'application/pdf',
                            data: pdfBase64,
                        },
                    },
                    {
                        type: 'text',
                        text: 'Extract the following information from this invoice in JSON format. This data will be used to automatically organize and rename the invoice PDF file into a structured directory system. Find both the invoice date and issue date, then use the earlier one of these two dates (this will be used to determine which month folder to store the file in). For dates in format __.__.____, assume DD.MM.YYYY pattern. For dates in format ____.__.__,  assume YYYY.MM.DD pattern. Also extract the company name (who issued the invoice) and invoice number (these will be used in the filename). Return ONLY a valid JSON object with no additional text, containing exactly these three fields: date (YYYY-MM-DD format, using the earlier of invoice/issue date), companyName (will be sanitized for filename use), invoiceNumber (will be sanitized for filename use). Example of expected format: {"date": "2024-03-15", "companyName": "Example Corp", "invoiceNumber": "INV-2024-001"}. The final filename will be structured as: "CompanyName Date InvoiceNumber.pdf".',
                    },
                ],
            },
        ],
    });

    try {
        const responseText = response.content[0].text.trim();
        console.log('Claude response:', responseText); // Debug log
        
        const jsonResponse = JSON.parse(responseText);
        
        // Validate required fields and format
        if (!jsonResponse.date || !jsonResponse.companyName || !jsonResponse.invoiceNumber) {
            throw new Error('Missing required fields in JSON response');
        }
        
        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(jsonResponse.date)) {
            throw new Error('Invalid date format in JSON response');
        }
        
        return jsonResponse;
    } catch (error) {
        console.error('Error parsing Claude response:', error.message);
        console.error('Raw response:', response.content[0].text);
        throw new Error(`Failed to parse invoice data: ${error.message}`);
    }
}

async function processInvoices() {
    try {
        // Read all files from source directory
        const files = await fs.readdir(SOURCE_DIR);
        
        for (const file of files) {
            if (!file.toLowerCase().endsWith('.pdf')) continue;
            
            const sourcePath = path.join(SOURCE_DIR, file);
            
            try {
                // Extract information using Anthropic AI
                const invoiceData = await extractInvoiceData(sourcePath);
                
                // Create target directory based on date (YYYY-MM)
                const [year, month] = invoiceData.date.split('-');
                const targetDir = path.join(BASE_TARGET_DIR, `${year}-${month}`);
                
                // Ensure target directory exists
                await fs.mkdir(targetDir, { recursive: true });
                
                // Create new filename
                const sanitizedCompanyName = sanitizeCompanyName(invoiceData.companyName);
                const sanitizedInvoiceNumber = sanitizeInvoiceNumber(invoiceData.invoiceNumber);
                const newFileName = `${sanitizedCompanyName} ${invoiceData.date} ${sanitizedInvoiceNumber}.pdf`;
                const targetPath = path.join(targetDir, newFileName);
                
                // Move and rename file
                await fs.rename(sourcePath, targetPath);
                
                console.log(`Processed: ${file}\n  → ${newFileName}\n  → Directory: ${targetDir}`);
            } catch (error) {
                console.error(`Failed to process file ${file}:`, error.message);
                continue; // Continue with next file even if this one fails
            }
        }
    } catch (error) {
        console.error('Error processing invoices:', error);
    }
}

// Run the script
processInvoices().then(() => console.log('Processing complete!')); 