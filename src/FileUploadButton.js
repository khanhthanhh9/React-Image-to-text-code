import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';

function FileUploadButton() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [debugText, setDebugText] = useState('');
  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  const handlePaste = (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        setFile(file);
        break;
      }
    }
  };

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  //   const handleOCR = () => {
  //     Tesseract.recognize(file, 'eng', { osd: { oem: 3, psm: 6 } })
  //       .then(({ data }) => {
  //         console.log(data)
  //         setText(data.text);
  //       });
  //   };


  const handleOCR = () => {
    Tesseract.recognize(file, 'eng', { osd: { oem: 3, psm: 6 } })
      .then(({ data }) => {
        console.log(data);
        setText(data.text);
        let debugString = ''; // define debugString here

        if (data.lines) {
          console.log("OCR information for each line:");

          data.lines.forEach((line, i) => {

            console.log(`Line ${i + 1}: ${line.text}`);
            console.log(`Baseline x0: ${line.baseline.x0}`);
            console.log(`Baseline y0: ${line.baseline.y0}`);
            console.log(`Baseline x1: ${line.baseline.x1}`);
            console.log(`Baseline y1: ${line.baseline.y1}`);
            console.log(`Bounding box: (${line.bbox.x0}, ${line.bbox.y0}) - (${line.bbox.x1}, ${line.bbox.y1})`);
            let left_pointer = 0;
            let added = 0
            line.words.forEach((words, j) => {

              console.log(`Text: ${words.text}`);
              console.log(`Number of Symbols: ${words.symbols.length}`);
              console.log(`Left: ${words.bbox.x0}`);
              console.log(`Right: ${words.bbox.x1}`);
              const char_w = Math.floor((words.bbox.x1 - words.bbox.x0) / words.symbols.length);

              console.log('added value is ', added)
              console.log(`Average character width is  ${char_w}`);
              added = 0
              if (words.bbox.x0 / char_w > left_pointer + 1) {
                added = char_w > 0 ? Math.ceil(words.bbox.x0 / char_w) - left_pointer : 0;
                console.log('char_w is', char_w);
                console.log('words.bbox.x0 is ', words.bbox.x0);
                console.log('left_pointer is', left_pointer);
                console.log('added is', added);
                debugString += '&nbsp;'.repeat(added)
              }
              // setDebugText(debugText + ' ' * added);
              // setDebugText(debugText + words.text);

              debugString += words.text;
              left_pointer = left_pointer + words.symbols.length + added + 1;
              console.log('DEBUG text is ', debugString);
            });
            debugString += '\n'
          });
        }
        setDebugText(debugString); // set debugText outside the if statement
      });
  };


  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      <button onClick={handleOCR}>Recognize Text</button>
      {file && (
        <div>
          <img src={URL.createObjectURL(file)} alt="Uploaded file" />
        </div>
      )}
      {text && (
        <div>
          <h3>Recognized Text:</h3>
          {/* <p dangerouslySetInnerHTML={{__html: text.replace(/\n/g, '<br/>')}}></p> */}
          <p dangerouslySetInnerHTML={{ __html: debugText.replace(/\n/g, '<br/>') }}></p>

        </div>
      )}
    </div>
  );
}

export default FileUploadButton;
