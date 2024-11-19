// Log to confirm content script is running
console.log("Content script initialized.");

// Declare questionsWithOptions globally so it’s accessible throughout the script
let questionsWithOptions = [];

// Function to extract questions with their options and send them to the background script
const extractAndSendQuestionsWithOptions = () => {
  questionsWithOptions = []; // Reset in case this function is called more than once

  // Select each question block
  document.querySelectorAll('.quiz-question').forEach((block, index) => {
    // Get the question text
    const questionTextElement = block.querySelector('.question-text');
    const questionText = questionTextElement ? questionTextElement.innerText.trim() : null;

    // Collect options based on input types within the specific question block
    const options = [];
    const radioOptions = block.querySelectorAll('input[type="radio"]');
    const checkboxOptions = block.querySelectorAll('input[type="checkbox"]');
    const textInput = block.querySelector('input[type="text"]');

    // Collect radio button and checkbox options by capturing their associated labels
    block.querySelectorAll('label').forEach(label => {
      const optionText = label.innerText.trim();
      if (optionText) options.push(optionText);
    });

    // If it's a text input question with no options, add a placeholder
    if (textInput && options.length === 0) {
      options.push("Fill in the blank");
    }

    // Push the question and options to the list if valid
    if (questionText && options.length > 0) {
      questionsWithOptions.push({ question: questionText, options, element: block });
      console.log(`Question ${index + 1}: "${questionText}" with options:`, options);
    }
  });

  // Send the structured questions and options to the background script
  if (questionsWithOptions.length > 0) {
    console.log("Sending questions with options to background script:", questionsWithOptions);
    chrome.runtime.sendMessage({ type: "questionsWithOptions", questionsWithOptions }, response => {
      console.log("Response from background script:", response);
    });
  } else {
    console.warn("No questions or options found. Check if selectors match page structure.");
  }
};

// Function to create a delay of random time between 15 and 45 seconds
const delayRandom = () => {
  return new Promise(resolve => {
    const delay = Math.floor(Math.random() * (45 - 15 + 1) + 15) * 1000;
    console.log(`Delaying for ${delay / 1000} seconds`);
    setTimeout(resolve, delay);
  });
};

// Listener for the answer map from the background script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "answerMap") {
    const questionAnswerMap = message.answerMap;
    console.log("Received answer map:", questionAnswerMap);

    // Function to update form elements based on question-answer mapping, scoped by question block
    const updateFormElement = async (question, answer, block) => {
      const radios = Array.from(block.querySelectorAll('input[type="radio"]'));
      const checkboxes = Array.from(block.querySelectorAll('input[type="checkbox"]'));
      const textInput = block.querySelector('input[type="text"]');

      let matched = false;

      // Handle "none of these are correct" and "all are correct"
      if (["none of these are correct", "none are correct"].includes(answer.toLowerCase())) {
        const noneOption = Array.from(block.querySelectorAll('label')).find(label =>
          label.innerText.toLowerCase().includes("none")
        );
        if (noneOption) {
          const input = noneOption.querySelector('input');
          if (input) {
            input.checked = true;
            console.log(`"None of these are correct" selected for question "${question}"`);
            return;
          }
        }
      } else if (["all are correct", "all of these are correct"].includes(answer.toLowerCase())) {
        const allOption = Array.from(block.querySelectorAll('label')).find(label =>
          label.innerText.toLowerCase().includes("all")
        );
        if (allOption) {
          const input = allOption.querySelector('input');
          if (input) {
            input.checked = true;
            console.log(`"All are correct" selected for question "${question}"`);
            return;
          }
        }
      }

      // Attempt to match the answer to a radio button within the specific question block
      for (const radio of radios) {
        const label = radio.closest('label');
        const optionText = label ? label.innerText.trim() : null;
        if (optionText && answer === optionText) {
          radio.checked = true;
          console.log(`Radio selected for question "${question}" with answer: "${answer}"`);
          matched = true;
          break;
        }
      }

      // Handle multiple select (checkbox) answers
      if (!matched && checkboxes.length > 0) {
        const answers = answer.split(',').map(a => a.trim()); // Split comma-separated answers
        for (const checkbox of checkboxes) {
          const label = checkbox.closest('label');
          const optionText = label ? label.innerText.trim() : null;
          if (optionText && answers.includes(optionText)) {
            checkbox.checked = true;
            console.log(`Checkbox selected for question "${question}" with answer: "${optionText}"`);
          }
        }
        matched = true;
      }

      // Fill in a text input if no radio or checkbox matched and only if it's a text answer
      if (!matched && textInput) {
        const cleanAnswer = answer.replace(/^\d+\.\s*/, "").trim(); // Remove "1." prefix if present
        textInput.value = cleanAnswer;
        console.log(`Text input filled for question "${question}" with answer: "${cleanAnswer}"`);
      }
    };

    // Iterate over each question and apply the answer with a delay in between
    for (const [question, answer] of Object.entries(questionAnswerMap)) {
      // Find the question block from the global questionsWithOptions array
      const questionBlock = questionsWithOptions.find(q => q.question === question)?.element;
      if (questionBlock) {
        console.log(`Processing question: "${question}" with answer: "${answer}"`);
        await updateFormElement(question, answer, questionBlock);
        await delayRandom(); // Wait before processing the next question
      } else {
        console.warn(`Question block not found for question: "${question}"`);
      }
    }

    sendResponse({ status: "completed" });
  }
});

// Trigger extraction and question sending on page load
extractAndSendQuestionsWithOptions();
