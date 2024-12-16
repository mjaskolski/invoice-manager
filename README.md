# Invoice Manager

A Node.js-based invoice processing system developed by [Wondel.ai](https://wondel.ai).

## Overview

This project provides automated invoice processing capabilities, helping businesses streamline their invoice management workflow. It follows the "inbox" concept where new invoices are placed in a designated inbox folder and automatically processed, organized, and moved to their appropriate destination folders.

## Features

- Invoice processing automation
- PDF document handling
- Batch processing support via shell script
- Inbox-based workflow for easy invoice management

## Installation

```bash
npm install
```

## Configuration

The following environment variables must be set before running the application:

- `ANTHROPIC_API_KEY` - Your Anthropic API key for Claude AI
- `SOURCE_DIR` - Directory containing the PDF invoices to process (your "Inbox" folder)
- `BASE_TARGET_DIR` - Base directory where processed invoices will be organized

You can set these variables in your shell:
```bash
export ANTHROPIC_API_KEY='your-api-key'
export SOURCE_DIR='/path/to/inbox/directory'
export BASE_TARGET_DIR='/path/to/target/directory'
```

## Workflow

### 1. Inbox System
The application uses an "inbox" system for processing invoices:

1. Place new invoice PDFs in the `SOURCE_DIR` (Inbox folder)
2. Run the processing script
3. Invoices are automatically:
   - Analyzed for relevant information
   - Renamed with a standardized format
   - Moved to appropriate date-based folders in `BASE_TARGET_DIR`
   - Original files are removed from the inbox

This workflow allows you to:
- Quickly dump new invoices into a single folder
- Process them in batch
- Keep your inbox clean and organized
- Maintain a structured archive of processed invoices

### 2. Processing

You can process invoices using either the Node.js script directly or the provided shell script:

```bash
# Using Node.js directly
node invoice-processor.js

# Using the shell script
./process-invoices.sh
```

### 3. How It Works

1. The system scans the `SOURCE_DIR` (Inbox) for PDF files
2. For each PDF, it:
   - Extracts invoice data using Claude AI
   - Creates a target directory based on invoice date (YYYY-MM format)
   - Renames the file using the pattern: `CompanyName Date InvoiceNumber.pdf`
   - Moves the file from inbox to the appropriate directory

### 4. Output Structure

Processed invoices are organized in the following structure:
```
BASE_TARGET_DIR/
├── Inbox/                      # Your SOURCE_DIR - where you put new invoices
│   └── ... new invoices ...
├── 2024-01/                   # Processed invoices organized by month
│   ├── Company1 2024-01-15 INV001.pdf
│   └── Company2 2024-01-20 INV002.pdf
├── 2024-02/
│   └── Company3 2024-02-01 INV003.pdf
└── ...
```

## Project Structure

- `invoice-processor.js` - Main processing logic
- `process-invoices.sh` - Shell script for batch processing
- `anthropic-pdf-example.ts` - PDF processing example

## Dependencies

The project uses various Node.js packages. See `package.json` for the complete list of dependencies.

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License](http://creativecommons.org/licenses/by-nc/4.0/) - see the [LICENSE](LICENSE) file for details.

For commercial licensing inquiries, please contact: Michal Jaskolski @ [Wondel.ai](https://wondel.ai)

## Author

Michal Jaskolski @ [Wondel.ai](https://wondel.ai) 