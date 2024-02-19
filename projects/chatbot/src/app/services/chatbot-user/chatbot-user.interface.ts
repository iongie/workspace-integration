interface ChatbotUser {
    user: string | null;
    apiKey: string | null;
    uuid: string | null;
}

const defaultChatbotUser: ChatbotUser = {
    user: null,
    apiKey: null,
    uuid: null
}

export {
    ChatbotUser,
    defaultChatbotUser
}