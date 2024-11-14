// OpenAI API Key
const OPENAI_API_KEY = "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";
// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "questions") {
      console.log("Questions received in background script:", request.questions);
  
      const questionText = request.questions.join(" ");
      fetchOpenAIResponse(questionText).then(answerText => {
        console.log("Answer from OpenAI API:", answerText);
  
        // Send the answer back to the content script
        chrome.tabs.sendMessage(sender.tab.id, {
          type: "answer",
          answerText: answerText
        }, response => {
          console.log("Sent answer back to content script:", response);
        });
      });
      sendResponse({ status: "questions processed" });
    }
  });
  
  // Function to call OpenAI API
// Function to call OpenAI API
// Function to call OpenAI's Chat API with GPT-3.5-turbo or GPT-4
async function fetchOpenAIResponse(questionText) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",  // You can also use "gpt-4" if available and needed
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: questionText }
          ],
          max_tokens: 50
        })
      });
  
      const data = await response.json();
  
      // Log the full response for troubleshooting
      console.log("OpenAI API response data:", data);
  
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
  