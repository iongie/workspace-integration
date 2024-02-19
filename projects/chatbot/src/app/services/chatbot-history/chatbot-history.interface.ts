interface ChatbotHistory {
    question: string | null;
    answer: string | null;
    uuid: string | null;
    moment: string | null
}

const defaultChatbotHistory: ChatbotHistory[] = []

export {
    ChatbotHistory,
    defaultChatbotHistory
}