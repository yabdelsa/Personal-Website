import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

const SYSTEM_PROMPT = `You are an AI assistant on Yahia Abdelsalam's portfolio website. 
You help visitors learn about Yahia and his work.

About Yahia:
- Name: Yahia Abdelsalam
- Student at Stevens Institute of Technology, Computer Science, class of 2028
- Skills: C++, Java, Python, JavaScript, HTML, CSS, ReactJS
- GitHub: https://github.com/yabdelsa
- LinkedIn: http://www.linkedin.com/in/yabdelsa
- Instagram: https://www.instagram.com/yahia_abdel06

You can:
1. Answer questions about Yahia's background, skills, and projects
2. Suggest which of Yahia's projects might interest the visitor based on their needs
3. Help visitors draft a message to contact Yahia
4. Have general helpful conversations

Keep responses concise, friendly, and professional.
If asked about specific projects, mention that visitors can check the Projects tab on the portfolio.
If you don't know something specific about Yahia, be honest and suggest they contact him directly.`;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm Yahia's AI assistant 👋 Ask me anything about Yahia, his skills, or his projects!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const contents = [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "Understood! I'm ready to help visitors learn about Yahia." }],
        },
        ...[...messages, userMessage]
          .filter((m) => m.role === "user" || m.role === "model")
          .map((m) => ({
            role: m.role,
            parts: [{ text: m.content }],
          })),
      ];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            contents: [...messages, userMessage]
              .filter((m) => m.role === "user" || m.role === "model")
              .map((m) => ({
                role: m.role,
                parts: [{ text: m.content }],
              })),
          }),
        }
      );

      const data = await response.json();
      console.log("Gemini response:", JSON.stringify(data));
      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response. Please try again!";

      setMessages((prev) => [...prev, { role: "model", content: reply }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Sorry, something went wrong. Please try again!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[350px] h-[500px] bg-[#0a0a1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Yahia's Assistant</p>
              <p className="text-white/70 text-xs">Powered by Gemini AI</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user"
                    ? "bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
                    : "bg-white/10"
                    }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed break-words overflow-hidden ${msg.role === "user"
                    ? "bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-tr-sm"
                    : "bg-white/5 text-gray-300 rounded-tl-sm border border-white/10"
                    }`}
                >
                  {msg.content.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$2')}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-2 text-center">Press Enter to send</p>
          </div>
        </div>
      )}
    </>
  );
}