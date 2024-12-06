// OpenAI API Key
const OPENAI_API_KEY = "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";

// Listener for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "questionsWithOptions") {
    console.log("Questions with options received in background script:", request.questionsWithOptions);

    // Fetch responses for each question and create an answer map
    fetchOpenAIResponses(request.questionsWithOptions)
      .then(answerMap => {
        console.log("Generated answer map:", answerMap);
        
        // Send the question-answer map back to the content script
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { 
              type: "answerMap", 
              answerMap 
            });
          }
        });
      })
      .catch(error => {
        console.error("Error in processing questions:", error);
      });

    // Return true to indicate we wish to send a response asynchronously
    return true;
  }
});

// Function to fetch OpenAI responses for each question with options
async function fetchOpenAIResponses(questionsWithOptions) {
  const answerMap = {};
  
  // Loop over each question and fetch its answer from OpenAI
  for (const { question, options } of questionsWithOptions) {
    const answer = await fetchOpenAIResponse(question, options);
    answerMap[question] = answer;
  }
  
  return answerMap;
}

async function fetchOpenAIResponse(question, options) {
  try {
    // Format the question with options for the prompt
    const optionsText = options.map((option, index) => `${index + 1}. ${option}`).join("\n");
    const prompt = `You are an expert at solving multiple-choice questions. Carefully analyze the following question and select ONLY the definitively correct answer.

Question: ${question}

Available Options:
${optionsText}

Critical Instructions:
- First, start by reading the question and all options carefully
- After reading the questions, read them again and do any calculations required to arrive at an answer
- Select ONLY the single most accurate answer from the list of given options.
- Do NOT explain your reasoning
- For fill-in-the-blank type questions, you are not allowed to leave an 'unable to respond'
- Respond EXACTLY with the full text of the CORRECT option
- Only if you are unable to arrive at an answer, are you allowed to respond with "UNABLE TO DETERMINE"`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",  // Using GPT-4 for better reasoning
        messages: [
          { role: "system", content: "You are a precise academic problem-solving assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.2  // Low temperature for more deterministic output
      })
    });

    const data = await response.json();

    // Validate and process the response
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      const selectedAnswer = data.choices[0].message.content.trim();
      
      // Ensure the selected answer matches one of the original options
      const matchedOption = options.find(option => 
        selectedAnswer.includes(option) || option.includes(selectedAnswer)
      );

      return matchedOption || "UNABLE TO DETERMINE";
    } else {
      console.error("Unexpected response format from OpenAI API:", data);
      return "UNABLE TO DETERMINE";
    }
  } catch (error) {
    console.error("Error fetching data from OpenAI API:", error);
    return "UNABLE TO DETERMINE";
  }
}