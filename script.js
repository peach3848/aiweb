// 对话历史
let conversationHistory = [];

// DOM 元素
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const clearContextButton = document.getElementById('clear-context');
const temperatureSlider = document.getElementById('temperature');
const temperatureValue = document.getElementById('temperature-value');
const modelSelect = document.getElementById('model-select');

// 更新 temperature 显示值
temperatureSlider.addEventListener('input', () => {
    temperatureValue.textContent = temperatureSlider.value;
});

// 发送消息
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// 清空上下文
clearContextButton.addEventListener('click', () => {
    conversationHistory = [];
    chatContainer.innerHTML = '';
    addMessage('system', '对话历史已清空');
});

// 添加消息到聊天界面
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    if (role === 'user') {
        messageDiv.classList.add('user-message');
        messageDiv.textContent = '你: ' + content;
    } else if (role === 'assistant') {
        messageDiv.classList.add('ai-message');
        messageDiv.innerHTML = 'AI: ' + marked.parse(content);
        messageDiv.classList.add('markdown-body');
        
        // 延迟渲染数学公式，确保 DOM 已更新
        setTimeout(() => {
            renderMathInElement(messageDiv, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false
            });
        }, 0);
    } else {
        messageDiv.style.textAlign = 'center';
        messageDiv.style.color = '#666';
        messageDiv.textContent = content;
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
// 发送消息到 AI
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // 添加用户消息到界面和历史
    addMessage('user', message);
    conversationHistory.push({ role: 'user', content: message });
    
    // 清空输入框
    userInput.value = '';
    
    try {
        // 显示正在思考
        const thinkingDiv = document.createElement('div');
        thinkingDiv.textContent = 'AI 正在思考...';
        thinkingDiv.style.textAlign = 'center';
        thinkingDiv.style.color = '#666';
        chatContainer.appendChild(thinkingDiv);
        
        // 获取 temperature 值
        const temperature = parseFloat(temperatureSlider.value);
        const model = modelSelect.value;
        
        // 调用 API
        const response = await callAIAPI(conversationHistory, temperature, model);
        
        // 移除"正在思考"提示
        chatContainer.removeChild(thinkingDiv);
        
        // 添加 AI 回复到界面和历史
        addMessage('assistant', response);
        conversationHistory.push({ role: 'assistant', content: response });
    } catch (error) {
        console.error('API 调用失败:', error);
        addMessage('system', '错误: ' + error.message);
    }
}

// 调用 AI API (使用加密配置)
async function callAIAPI(messages, temperature, model) {
    // 解密配置
    const decryptedConfig = decryptConfig(ENCRYPTED_CONFIG);
    
    // 根据配置选择 API 提供商
    if (decryptedConfig.provider === 'openrouter') {
        return callOpenAIAPI(messages, temperature, model, decryptedConfig.apiKey);
    } else if (decryptedConfig.provider === 'anthropic') {
        return callAnthropicAPI(messages, temperature, model, decryptedConfig.apiKey);
    } else {
        throw new Error('不支持的 AI 提供商');
    }
}

// 调用 OpenAI API
async function callOpenAIAPI(messages, temperature, model, apiKey) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: temperature
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'OpenAI API 请求失败');
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || '没有收到回复';
}

// 调用 Anthropic API (示例)
async function callAnthropicAPI(messages, temperature, model, apiKey) {
    // 这里只是示例，实际 Anthropic API 调用方式可能不同
    throw new Error('Anthropic API 实现未完成');
}

// 初始化
addMessage('system', '欢迎使用 AI 对话助手！请在下方的输入框中输入你的问题。');
