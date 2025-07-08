
// Grab DOM elements
const prompt = document.querySelector("#prompt");
const submitbtn = document.querySelector("#submit");
const chatContainer = document.querySelector(".chat-container");
const imagebtn = document.querySelector("#image");
const image = document.querySelector("#image img");
const imageinput = document.querySelector("#image input");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDB3BL9lNQYPdvKSYR6WP_6ozf_--fQ45k  ";

let user = {
  message: null,
  file: {
    mime_type: null,
    data: null
  }
};

function createChatBox(html, classes) {
  const div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  return div;
}
async function generateResponse(aiChatBox) {
  const textArea = aiChatBox.querySelector(".ai-chat-area");


  const parts = [{ text: user.message }];
  if (user.file.data) {
    parts.push({ inline_data: user.file });
  }

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",  // REQUIRED by the Gemini API
          parts: parts
        }
      ]
    })
  };

  try {
    const resp = await fetch(Api_Url, requestOptions);
    const data = await resp.json();

    // Handle API errors or missing candidates
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No valid response from Gemini API.");
    }

    const apiResponse = data.candidates[0].content.parts[0].text.trim();
    textArea.innerHTML = apiResponse;

  } catch (err) {
    console.error("Error in generateResponse:", err);
    textArea.innerHTML = "⚠️ Error: Failed to get a reply.";
  } finally {
    // Reset loading indicator and scroll to latest message
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
    image.src = "img.svg"; // or your default camera icon
    image.classList.remove("choose");
    user.file = { mime_type: null, data: null };
  }
}

// Called when user sends a message
function handleChatResponse(userMessage) {
  user.message = userMessage;

  const userHtml = `
    <img src="user.png" alt="You" id="userImage" width="8%">
    <div class="user-chat-area">
      ${user.message}
      ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
    </div>
  `;

  prompt.value = "";
  const userChatBox = createChatBox(userHtml, "user-chat-box");
  chatContainer.appendChild(userChatBox);
  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

  // Show AI response placeholder
  setTimeout(() => {
    const loadingHtml = `
      <img src="ai.png" alt="Bot" id="aiImage" width="10%">
      <div class="ai-chat-area">
        <img src="loading.webp" alt="Loading..." class="load" width="50px">
      </div>
    `;
    const aiChatBox = createChatBox(loadingHtml, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);
    generateResponse(aiChatBox);
  }, 300);
}

// 🪄 Event listeners
prompt.addEventListener("keydown", e => {
  if (e.key === "Enter" && prompt.value.trim()) {
    handleChatResponse(prompt.value.trim());
  }
});

submitbtn.addEventListener("click", () => {
  if (prompt.value.trim()) {
    handleChatResponse(prompt.value.trim());
  }
});

imageinput.addEventListener("change", () => {
  const file = imageinput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const base64string = e.target.result.split(",")[1];
    user.file = { mime_type: file.type, data: base64string };
    image.src = e.target.result;
    image.classList.add("choose");
  };
  reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
  imageinput.click();
});
