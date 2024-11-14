// Ensure content script is running
console.log("Content script initialized.");

// Function to extract questions and send them to the background script
const extractAndSendQuestions = () => {
  const questions = [];
  
  // Select all potential question elements and log each
  document.querySelectorAll('.question-text, .question, label').forEach((question, index) => {
    const textContent = question.innerText.trim();
    if (textContent) {
      questions.push(textContent);
      console.log(`Question ${index + 1}:`, textContent);
    }
  });

  // Check if questions were found and send them
  if (questions.length > 0) {
    console.log("Sending questions to background script:", questions);
    chrome.runtime.sendMessage({ type: "questions", questions }, response => {
      console.log("Response from background script:", response);
    });
  } else {
    console.warn("No questions found. Check if selectors match page structure.");
  }
};

// Listener for response from background script with answer
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "answer") {
    const { answerText } = message;
    console.log("Answer received from background script:", answerText);
    
    // Log each radio button's value to check for matches
    let matchFound = false;
    document.querySelectorAll('input[type="radio"]').forEach((radio, index) => {
      console.log(`Radio ${index + 1} value:`, radio.value);
      if (radio.value.includes(answerText)) {
        radio.checked = true;
        console.log(`Match found! Radio button ${index + 1} selected.`);
        matchFound = true;
      }
    });

    if (!matchFound) {
      console.warn("No matching radio button found for answer:", answerText);
    }
    sendResponse({ status: "success" });
  }
});

// Trigger extraction and question sending
extractAndSendQuestions();
