// 加密配置 - 使用简单的 Base64 编码 (实际项目中应该使用更安全的加密方式)
const ENCRYPTED_CONFIG = {
    provider: 'b3BlbnJvdXRlcg==', // 'openai' 的 Base64 编码
    apiKey: 'c2stb3ItdjEtZTI3ZGE2NjkwY2YwMzBhNmIxZGZiZTNjYWNkNjlmMjBiNWZjYWY3MWMyYTA2OWI4NDkwMGE2MGY1NDllYjUyNg==' // 示例 API key 的 Base64 编码
};

// 解密配置
function decryptConfig(encryptedConfig) {
    return {
        provider: atob(encryptedConfig.provider),
        apiKey: atob(encryptedConfig.apiKey)
    };
}

// 注意: 这只是基本示例，实际项目中应该:
// 1. 使用更安全的加密方式
// 2. 不要将 API 密钥直接存储在客户端代码中
// 3. 考虑使用后端服务作为代理来保护 API 密钥
