const {askChatbot} = require("../../services/chatbotService");
 
module.exports.ask = async (req, res) => {
  try {
    const { message } = req.body;
 
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập câu hỏi" });
    }
 
    const userId = req.user ? req.user._id : null;
 
    if (!req.session.chatHistory) req.session.chatHistory = [];
    const chatHistory = req.session.chatHistory;
 
    const reply = await askChatbot(message, userId, chatHistory);
 
    // Format OpenAI-style: { role: "user"|"assistant", content: "..." }
    chatHistory.push({ role: "user", content: message });
    chatHistory.push({ role: "assistant", content: reply });
 
    if (chatHistory.length > 20) chatHistory.splice(0, chatHistory.length - 20);
 
    return res.json({ success: true, reply });
  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({
      success: false,
      message: "Xin lỗi, chatbot đang gặp sự cố. Vui lòng thử lại sau."
    });
  }
};
 
module.exports.resetChat = (req, res) => {
  req.session.chatHistory = [];
  return res.json({ success: true });
};
 