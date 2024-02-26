interface ChatbotHistory {
    question: string | null;
    answer: string | null;
    uuid: string | null;
    moment: string | null;
    type: string | null;
    name_file?: string | null;
    thumbnail?: string | null;
}

const defaultChatbotHistory: ChatbotHistory[] = []

interface ChatPrompt {
    prompt: string | null;
    type: string | null;  
}

const defaultChatPrompt: ChatPrompt = {
    prompt: '',
    type: 'text'
}


export {
    ChatbotHistory,
    defaultChatbotHistory,
    ChatPrompt,
    defaultChatPrompt
}