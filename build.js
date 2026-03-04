// 构建脚本：读取txt文件生成Cloudflare Worker代码
// 运行: node build.js

const fs = require('fs');
const path = require('path');

const ALLOWED_TYPES = ['landscape', 'portrait'];

// 读取txt文件并转换为数组
function loadUrls(type) {
    const filePath = path.join(__dirname, `${type}.txt`);
    if (!fs.existsSync(filePath)) {
        console.warn(`Warning: ${type}.txt not found, using empty array`);
        return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const urls = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && line.startsWith('http'));
    return urls;
}

// 构建数据
const data = {};
for (const type of ALLOWED_TYPES) {
    data[type] = loadUrls(type);
    console.log(`Loaded ${data[type].length} URLs for type "${type}"`);
}

// 生成Worker代码
const workerCode = `// Cloudflare Worker - 随机图片302跳转API
// 由 build.js 自动生成，请勿手动编辑
// 用法: ?type=landscape 或 ?type=portrait 或 不传参数随机选择

const IMAGE_DATA = ${JSON.stringify(data, null, 2)};

const ALLOWED_TYPES = ${JSON.stringify(ALLOWED_TYPES)};

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const type = url.searchParams.get('type') || '';

        // 如果未指定type，随机选择一个
        let selectedType = type;
        if (selectedType === '') {
            selectedType = ALLOWED_TYPES[Math.floor(Math.random() * ALLOWED_TYPES.length)];
        }

        // 白名单验证
        if (!ALLOWED_TYPES.includes(selectedType)) {
            return new Response('Invalid type parameter. Allowed: landscape, portrait', {
                status: 400,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }

        // 获取对应类型的URL列表
        const urls = IMAGE_DATA[selectedType];

        if (!urls || urls.length === 0) {
            return new Response('No images available for this type', {
                status: 404,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }

        // 随机选择一个URL
        const randomUrl = urls[Math.floor(Math.random() * urls.length)];

        // 处理 suffix 参数（用于图片压缩参数如 @320w_200h / @1200w_800h / 320x200）
        let finalUrl = randomUrl;
        const suffix = url.searchParams.get('suffix');
        if (suffix) {
            // 安全校验：只允许数字、下划线、@、x、w、h 等常见图片压缩参数字符
            // 格式示例: @320w_200h, @1200w_800h, 320x200
            const safeSuffixPattern = /^[\d@_xwh]+$/;
            if (safeSuffixPattern.test(suffix)) {
                finalUrl = randomUrl + suffix;
            }
        }

        // 302重定向
        return Response.redirect(finalUrl, 302);
    }
};
`;

// 写入Worker文件
const outputPath = path.join(__dirname, 'worker.js');
fs.writeFileSync(outputPath, workerCode, 'utf-8');
console.log(`\nGenerated: ${outputPath}`);
console.log('Build complete!');