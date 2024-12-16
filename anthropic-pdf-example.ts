import Anthropic from '@anthropic-ai/sdk';
import fetch from 'node-fetch';

// First fetch the file
const pdfURL = "https://assets.anthropic.com/m/1cd9d098ac3e6467/original/Claude-3-Model-Card-October-Addendum.pdf";

const pdfResponse = await fetch(pdfURL);

// Then convert the file to base64
const arrayBuffer = await pdfResponse.arrayBuffer();
const pdfBase64 = Buffer.from(arrayBuffer).toString('base64');

// Finally send the API request
const anthropic = new Anthropic();
const response = await anthropic.beta.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  betas: ["pdfs-2024-09-25"],
  max_tokens: 1024,
  messages: [
    {
      content: [
        {
          type: 'document',
          source: {
            media_type: 'application/pdf',
            type: 'base64',
            data: pdfBase64,
          },
        },
        {
          type: 'text',
          text: 'Which model has the highest human preference win rates across each use-case?',
        },
      ],
      role: 'user',
    },
  ],
});
console.log(response);
