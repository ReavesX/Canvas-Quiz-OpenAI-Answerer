Quiz Automation Content Script
This script automates the process of answering quiz questions on web pages by:

Extracting questions and options from the DOM.
Sending them to a background script, which interacts with OpenAI to determine the correct answers.
Updating form elements (radio buttons, checkboxes, or text fields) with the correct answers provided by OpenAI.
Features
Extract Questions and Options:

Parses each question block on the page.
Supports radio buttons, checkboxes, and text input fields.
Organizes questions and their associated options in a structured format.
Answer Parsing:

Processes comma-separated answers for multiple-select questions (checkboxes).
Handles special answers like "none of these are correct" or "all are correct" for both multiple-choice and multiple-select questions.
Answer Application:

Selects the appropriate radio button or checkbox.
Writes clean text to input fields (removes prefixes like 1.).
Updates form elements with random delays (15–45 seconds) between actions to simulate human interaction.
Installation and Usage
Set Up the Chrome Extension:

Save this script as content.js.
Include it in a Chrome extension alongside manifest.json and a background script (background.js).
Ensure the HTML Structure Matches:

This script expects the following structure for quiz questions:
html
Copy code
<div class="quiz-question">
  <p class="question-text">What is the capital of France?</p>
  <div class="answers">
    <label><input type="radio" name="question_1" value="a"> Paris</label>
    <label><input type="radio" name="question_1" value="b"> London</label>
    <label><input type="radio" name="question_1" value="c"> Berlin</label>
    <label><input type="radio" name="question_1" value="d"> Rome</label>
  </div>
</div>
Update selectors in the script if your quiz structure differs.
Run the Script:

Load the extension in Chrome (via Developer Mode).
Visit the quiz page.
The script will automatically extract questions, send them to the background script, and apply the correct answers to the form elements.
Code Details
Script Workflow
Question Extraction:

The script searches for .quiz-question blocks, extracting:
Question text: From .question-text.
Options: From <label> tags associated with radio or checkbox inputs.
Text inputs: For fill-in-the-blank questions.
Send Questions to Background Script:

Sends a structured array of questions and their options to the background script.
Receive and Apply Answers:

The background script fetches answers using OpenAI and returns an answerMap object:
json
Copy code
{
  "What is the capital of France?": "Paris",
  "Which of these is a mammal?": "Elephant",
  "What animal is a rodent?": "Rat"
}
Based on the type of question, the script:
Checks the correct radio button.
Checks all correct checkboxes for multiple-select questions.
Fills in text for fill-in-the-blank questions.
Special Cases
Comma-Separated Answers:

For multiple-select questions, ChatGPT's response can include a list of answers (e.g., "Elephant, Penguin"). The script splits the response and matches each part with the checkboxes.
"None of These" or "All are Correct":

If ChatGPT responds with "none of these are correct" or "all are correct", the script identifies corresponding options and selects them.
Clean Text Inputs:

Removes numeric prefixes (like 1.) from ChatGPT's answers for text fields to ensure clean input.
Random Delays
To mimic human interaction, a random delay of 15–45 seconds is added between answering each question.
Customization
Change Delay Timing: Modify the delayRandom function to adjust the delay range:

javascript
Copy code
const delayRandom = () => {
  return new Promise(resolve => {
    const delay = Math.floor(Math.random() * (45 - 15 + 1) + 15) * 1000;
    console.log(`Delaying for ${delay / 1000} seconds`);
    setTimeout(resolve, delay);
  });
};
Update Selectors: Adjust selectors to match the structure of your quiz page. For example:

'.quiz-question' for question blocks.
'.question-text' for question text.
<label> tags for options.
Example Logs
Example console output for a quiz with three questions:

python
Copy code
Content script initialized.
Question 1: "What is the capital of France?" with options: ['Paris', 'London', 'Berlin', 'Rome']
Question 2: "Which of these is a mammal?" with options: ['Shark', 'Elephant', 'Penguin', 'Eagle']
Question 3: "What animal is a rodent?" with options: ['Fill in the blank']
Sending questions with options to background script: [{...}, {...}, {...}]
Response from background script: {status: 'questions processed'}
Received answer map: {What is the capital of France?: 'Paris', Which of these is a mammal?: 'Elephant', What animal is a rodent?: 'Rat'}
Processing question: "What is the capital of France?" with answer: "Paris"
Radio selected for question "What is the capital of France?" with answer: "Paris"
Delaying for 27 seconds
Processing question: "Which of these is a mammal?" with answer: "Elephant"
Checkbox selected for question "Which of these is a mammal?" with answer: "Elephant"
Delaying for 32 seconds
Processing question: "What animal is a rodent?" with answer: "Rat"
Text input filled for question "What animal is a rodent?" with answer: "Rat"
Limitations
The script assumes that the quiz follows a consistent HTML structure. If not, selectors will need to be adjusted.
For large quizzes, OpenAI rate limits may apply.
This README provides the necessary context and usage instructions for your script. Let me know if additional sections or clarifications are needed!





