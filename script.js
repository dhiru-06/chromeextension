const container = document.querySelector('.container');
const contextMenu = document.getElementById('context-menu');
let selectionTimeout;

container.addEventListener('mouseup', (e) => {
  const selectedText = window.getSelection().toString();
  
  if (selectedText && !isTextAreaSelected(e.target)) {
    clearTimeout(selectionTimeout);

    const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();

    contextMenu.style.display = 'block';
    contextMenu.style.left = rect.left + rect.width / 2 + 'px';
    contextMenu.style.top = rect.bottom + 'px';
  }
});

function isTextAreaSelected(target) {
  return target.classList.contains('text-area');
}

contextMenu.addEventListener('click', async (e) => {
  e.preventDefault();
  contextMenu.style.display = 'none';

  const selectedText = window.getSelection().toString();
  if (selectedText && !isTextAreaSelected(e.target)) {
    const textArea = document.createElement('textarea');
    textArea.classList.add('text-area');
    textArea.value = selectedText;
    textArea.style.left = contextMenu.style.left;
    textArea.style.top = contextMenu.style.top;

    const iconsContainer = document.createElement('div');
    iconsContainer.classList.add('text-area-icons');
    const cancelIcon = document.createElement('span');
    cancelIcon.innerHTML = '✕'; // Cancel icon
    cancelIcon.classList.add('cancel-icon');

    // Function to call OpenAI API and update text area with response
    async function callOpenAPIAndDisplay() {
      const apiKey = "YOUR_API_KEY"; // Replace with your OpenAI API key
      
      try {
        const response = await fetch("https://api.openai.com/v1/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "text-davinci-003",
            prompt: selectedText,
            max_tokens: 2048,
            temperature: 0,
            top_p: 1,
            n: 1,
            stream: false,
            logprobs: null,
          }),
        });
        
        if (!response.ok) {
          throw new Error("API request failed");
        }
        
        const responseJson = await response.json();
        const generatedText = responseJson.choices[0].text;
        textArea.value = generatedText;
      } catch (error) {
        console.error("Error while calling OpenAI API:", error);
        textArea.value = "Error occurred while processing";
      }
    }

    cancelIcon.addEventListener('click', () => {
      container.removeChild(textArea);
      container.removeChild(iconsContainer);
    });

    // Create a button to trigger the API call
    const explainButton = document.createElement('button');
    explainButton.innerHTML = 'Explain';

    explainButton.addEventListener('click', async () => {
      await callOpenAPIAndDisplay();
    });

    iconsContainer.appendChild(explainButton);
    iconsContainer.appendChild(cancelIcon);

    container.appendChild(textArea);
    container.appendChild(iconsContainer);

    textArea.focus();
  }
});
