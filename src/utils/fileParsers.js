import * as pdfjsLib from 'pdfjs-dist';
import ePub from 'epubjs';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

export const parsePdf = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};

export const parseEpub = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const book = ePub(arrayBuffer);
    await book.ready;
    
    let fullText = '';
    const spine = book.spine;

    for (const item of spine.spineItems) {
        try {
            // Load the chapter/section
            const doc = await item.load(book.load.bind(book));
            
            // Extract text content safely
            let text = '';
            if (doc && doc.body) {
                text = doc.body.innerText || doc.body.textContent;
            } else if (doc && doc.documentElement) {
                text = doc.documentElement.textContent;
            } else if (doc) {
                text = doc.textContent || '';
            }
            
            fullText += text + '\n';
            
            // Unload to free memory
            item.unload();
        } catch (error) {
            console.warn(`Could not load section: ${item.idRef}`, error);
        }
    }
    
    return fullText;
};

export const parseFile = async (file) => {
  if (file.type === 'application/pdf') {
    return parsePdf(file);
  } else if (file.type === 'application/epub+zip' || file.name.endsWith('.epub')) {
    return parseEpub(file);
  } else {
    return readFileAsText(file);
  }
};
