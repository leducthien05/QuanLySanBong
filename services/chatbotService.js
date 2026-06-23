const Field = require("../model/field.model");
const Booking = require("../model/booking.model");
const Pricing = require("../model/pricing.model");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Lấy dữ liệu thực tế từ MongoDB để làm "context" cho AI trả lời chính xác
 * (kỹ thuật RAG - Retrieval Augmented Generation)
 */
async function buildContext(userId) {
  const fields = await Field.find({ status: "active", deleted: false })
    .limit(20)
    .lean();

  let userBookings = [];
  if (userId) {
    userBookings = await Booking.find({ user_id: userId, deleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
  }

  return { fields, userBookings };
}

/**
 * Hàm chính: nhận câu hỏi của khách hàng, trả về câu trả lời từ AI (qua OpenRouter)
 * chatHistory dạng: [{role: "user", content: "..."}, {role: "assistant", content: "..."}]
 */
async function askChatbot(userMessage, userId = null, chatHistory = []) {
  const { fields, userBookings } = await buildContext(userId);

  const systemPrompt = `
Bạn là trợ lý ảo của GreenField - hệ thống đặt sân bóng trực tuyến tại Hà Nội.
Nhiệm vụ của bạn:
- Tư vấn khách hàng về sân bóng, giá thuê, khung giờ trống
- Hướng dẫn quy trình đặt sân và thanh toán (VNPAY, MoMo, tiền mặt)
- Hướng dẫn quy trình hủy sân và hoàn tiền
- Trả lời ngắn gọn, thân thiện, bằng tiếng Việt

QUAN TRỌNG:
- Chỉ trả lời các câu hỏi liên quan đến GreenField và dịch vụ sân bóng
- Nếu không chắc chắn, đề nghị khách hàng liên hệ admin
- Không bịa đặt giá cả hoặc lịch trống không có trong dữ liệu được cung cấp

DỮ LIỆU SÂN BÓNG HIỆN CÓ:
${JSON.stringify(fields, null, 2)}

${userBookings.length > 0 ? `LỊCH SỬ ĐẶT SÂN CỦA KHÁCH HÀNG NÀY:\n${JSON.stringify(userBookings, null, 2)}` : "Khách hàng chưa đăng nhập hoặc chưa có lịch sử đặt sân."}
`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...chatHistory,
    { role: "user", content: userMessage },
  ];

  // Thử lần lượt các model free, nếu model đầu lỗi thì tự động fallback sang model tiếp theo
  const modelsToTry = [
    "openrouter/free",                          // router tự động chọn model free khả dụng - ưu tiên #1
    "meta-llama/llama-3.3-70b-instruct:free",
    "deepseek/deepseek-r1:free",
  ];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5080",
          "X-Title": "GreenField Chatbot",
        },
        body: JSON.stringify({ model, messages }),
      });

      const data = await response.json();

      if (data.error) {
        // In ra TOÀN BỘ lỗi gốc để biết chính xác nguyên nhân (quan trọng khi debug)
        console.error(`OpenRouter error với model "${model}":`, JSON.stringify(data.error, null, 2));
        lastError = data.error;
        continue; // thử model tiếp theo
      }

      const reply = data.choices?.[0]?.message?.content;
      if (!reply) {
        lastError = { message: "AI không trả về nội dung" };
        continue;
      }

      return reply; // thành công, trả về luôn
    } catch (err) {
      console.error(`Lỗi network khi gọi model "${model}":`, err.message);
      lastError = err;
    }
  }

  // Nếu tất cả model đều lỗi
  throw new Error(lastError?.message || "Tất cả model AI đều không phản hồi được");
}

module.exports = { askChatbot };