import { QuizData, QuestionType } from '../types';

export const triggerPrint = () => {
  window.print();
};

export const exportToWord = (quizData: QuizData, withAnswers: boolean) => {
  const content = generateHTMLContent(quizData, withAnswers);
  
  // A proper header for Word documents to interpret HTML correctly
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${quizData.title}</title>
      <style>
        /* Base Styles */
        body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
        
        /* Typography */
        h1 { font-size: 24pt; color: #2e4053; border-bottom: 2px solid #2e4053; padding-bottom: 10px; margin-bottom: 20px; mso-line-height-rule: exactly; }
        h2 { font-size: 16pt; margin-top: 30px; margin-bottom: 15px; color: #2e4053; font-weight: bold; }
        p { margin: 0 0 10px 0; }
        
        /* Meta Info */
        .meta { color: #666; font-size: 10pt; margin-bottom: 30px; border: 1px solid #eee; padding: 10px; background-color: #fafafa; }
        
        /* Question Blocks */
        .question-block { margin-bottom: 25px; page-break-inside: avoid; }
        .question-text { font-weight: bold; font-size: 12pt; margin-bottom: 8px; }
        
        /* Options & Inputs */
        .options { margin-left: 20px; }
        .option { margin-bottom: 5px; }
        .blank-line { display: inline-block; width: 200px; border-bottom: 1px solid #000; }
        
        /* Answer Key Specifics */
        .page-break { page-break-before: always; mso-special-character: line-break; }
        .answer-key-item { border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px; page-break-inside: avoid; }
        .answer-label { font-weight: bold; color: #2e4053; }
        .correct-answer { color: #27ae60; font-weight: bold; }
        .explanation { color: #555; font-style: italic; margin-top: 5px; display: block; background-color: #f9f9f9; padding: 5px; border-left: 3px solid #ccc; }
      </style>
    </head>
    <body>
  `;

  const footer = `</body></html>`;

  const blob = new Blob(['\ufeff', header + content + footer], {
    type: 'application/msword'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const filename = `${quizData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${withAnswers ? 'key' : 'blank'}.doc`;
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const generateHTMLContent = (quizData: QuizData, withAnswers: boolean): string => {
  let htmlBody = `
    <h1>${quizData.title}</h1>
    <div class="meta">
      <p><strong>Description:</strong> ${quizData.description}</p>
      <p><strong>Total Questions:</strong> ${quizData.questions.length}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
  `;

  // --- Questions Section ---
  quizData.questions.forEach((q, index) => {
    htmlBody += `
      <div class="question-block">
        <div class="question-text">${index + 1}. ${q.questionText}</div>
    `;

    if (q.type === QuestionType.MULTIPLE_CHOICE && q.options) {
      htmlBody += `<div class="options">`;
      q.options.forEach(opt => {
        htmlBody += `<div class="option"><span style="font-family: 'Courier New'">&#9744;</span> ${opt}</div>`;
      });
      htmlBody += `</div>`;
    } else if (q.type === QuestionType.FILL_IN_BLANK) {
      htmlBody += `<div class="option" style="margin-top: 10px;">Answer: __________________________________________</div>`;
    }

    htmlBody += `</div>`;
  });

  // --- Answer Key Section (New Page) ---
  if (withAnswers) {
    // Force page break for Word
    htmlBody += `<br clear=all style='mso-special-character:line-break;page-break-before:always'>`;
    
    htmlBody += `
      <h1>Answer Key & Explanations</h1>
      <p style="margin-bottom: 20px;">Use this key to grade the quiz. Explanations are provided for further study.</p>
    `;
    
    quizData.questions.forEach((q, index) => {
      htmlBody += `
        <div class="answer-key-item">
          <p><span class="answer-label">Question ${index + 1}:</span> <span class="correct-answer">${q.correctAnswer}</span></p>
          <div class="explanation"><strong>Explanation:</strong> ${q.explanation}</div>
        </div>
      `;
    });
  }

  return htmlBody;
};