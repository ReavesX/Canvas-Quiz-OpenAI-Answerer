// OpenAI API Key
const OPENAI_API_KEY = "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";
// Listener for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "questionsWithOptions") {
      console.log("Questions with options received in background script:", request.questionsWithOptions);
  
      // Fetch responses for each question and create an answer map
      fetchOpenAIResponses(request.questionsWithOptions).then(answerMap => {
        console.log("Generated answer map:", answerMap);
        
        // Send the question-answer map back to the content script
        chrome.tabs.sendMessage(sender.tab.id, { type: "answerMap", answerMap });
      });
  
      sendResponse({ status: "questions processed" });
    }
  });
  
  // Function to fetch OpenAI responses for each question with options and create a question-answer map
  async function fetchOpenAIResponses(questionsWithOptions) {
    const answerMap = {};
  
    // Loop over each question and fetch its answer from OpenAI
    for (const { question, options } of questionsWithOptions) {
      const answer = await fetchOpenAIResponse(question, options);
      answerMap[question] = answer;
    }
    
    return answerMap;
  }
  
  // Function to call OpenAI's Chat API for a single question with options
  async function fetchOpenAIResponse(question, options) {
    try {
      // Format the question with options for the prompt
      const optionsText = options.map((option, index) => `${index + 1}. ${option}`).join("\n");
      const prompt = `Question: ${question}\nOptions:\n${optionsText}\n\nChoose the best option from the options above and respond with only the exact text of the best answer.`;
  
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",  // Optionally switch to "gpt-4" if preferred
          messages: [
            { role: "system", content: "You are a helpful assistant that always picks the best answer from a list of options." },
            { role: "user", content: prompt }
          ],
          max_tokens: 50
        })
      });
  
      const data = await response.json();
  
      // Log the full response for troubleshooting
      console.log("OpenAI API response data for question:", question, data);
  
      // Check if there's an error in the response
      if (data.error) {
        console.error("OpenAI API error:", data.error.message);
        return `Error: ${data.error.message}`;
      }
  
      // Extract response text from the chat completion
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content.trim();
      } else {
        console.error("Unexpected response format from OpenAI API:", data);
        return "No valid response from OpenAI";
      }
    } catch (error) {
      console.error("Error fetching data from OpenAI API:", error);
      return "Error fetching response";
    }
  }