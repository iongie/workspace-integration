interface fileUpload {
    name: string | null;
    size: number | null;
    type: string | null;
}

const defaultFileUpload: fileUpload = {
    name: null,
    size: null,
    type: null
}

interface dataPDF {
    name: string | null;
    status: string | null; 
    file: string | null;
    thumbnail: string | null;
}

const defaultdataPDF: dataPDF = {
    name: null,
    thumbnail: null,
    file: null,
    status: null
} 

interface InputChat {
    prompt: string | null;
    type: string | null; 
}

const defaultInputChat: InputChat = {
    prompt: null,
    type: null
}

export {
    fileUpload,
    defaultFileUpload,
    dataPDF,
    defaultdataPDF,
    InputChat,
    defaultInputChat
}