// Log to confirm content script is running
console.log("Content script initialized.");

// Function to extract questions and send them to the background script
const extractAndSendQuestions = () => {
  const questions = [];
  document.querySelectorAll('.question-text, .question, label').forEach((question, index) => {
    const textContent = question.innerText.trim();
    if (textContent) {
      questions.push(textContent);
      console.log(`Question ${index + 1}:`, textContent);
    }
  });

  if (questions.length > 0) {
    console.log("Sending questions to background script:", questions);
    chrome.runtime.sendMessage({ type: "questions", questions }, response => {
      console.log("Response from background script:", response);
    });
  } else {
    console.warn("No questions found. Check if selectors match page structure.");
  }
};

// Function to delay execution by a random time between 30 and 45 seconds
const delayRandom = () => {
  return new Promise(resolve => {
    const delay = Math.floor(Math.random() * (45 - 30 + 1) + 30) * 1000;
    console.log(`Delaying for ${delay / 1000} seconds`);
    setTimeout(resolve, delay);
  });
};

// Listener for answer messages from the background script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "answer") {
    const { answerText } = message;
    console.log("Answer received:", answerText);

    // Find matching element (radio, checkbox, or input field) and set its value
    const updateFormElement = async () => {
      const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      const textInputs = Array.from(document.querySelectorAll('input[type="text"]'));

      let matched = false;

      // Attempt to match the answer to a radio button
      for (const radio of radios) {
        if (radio.value.includes(answerText)) {
          await delayRandom();
          radio.checked = true;
          console.log("Radio selected with value:", radio.value);
          matched = true;
          break;
        }
      }

      // Attempt to match the answer to a checkbox if no radio matched
      if (!matched) {
        for (const checkbox of checkboxes) {
          if (checkbox.value.includes(answerText)) {
            await delayRandom();
            checkbox.checked = true;
            console.log("Checkbox selected with value:", checkbox.value);
            matched = true;
            break;
          }
        }
      }

      // Fill in a text input if no radio or checkbox matched
      if (!matched) {
        for (const textInput of textInputs) {
          await delayRandom();
          textInput.value = answerText;
          console.log("Text input filled with:", answerText);
          break;
        }
      }
    };

    // Execute form update function
    await updateFormElement();
    sendResponse({ status: "success" });
  }
});

// Trigger extraction and question sending on page load
extractAndSendQuestions();