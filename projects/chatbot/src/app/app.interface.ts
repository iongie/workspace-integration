interface Prompt {
    type: string | null;
    userId: string | null;
    id: string | null;
}


const defaultPrompt: Prompt = {
    type: null,
    userId: null,
    id: null
}

export {
    Prompt, 
    defaultPrompt
}