<?php
// 安全的随机图片302跳转API
// 用法: ?type=landscape 或 ?type=portrait

// 定义允许的类型（白名单）
const ALLOWED_TYPES = ['landscape', 'portrait'];

// 获取type参数，未指定则随机选择
$type = $_GET['type'] ?? '';

// 如果未指定type，随机选择一个
if ($type === '') {
    $type = ALLOWED_TYPES[array_rand(ALLOWED_TYPES)];
}

// 白名单验证 - 防止路径遍历攻击
if (!in_array($type, ALLOWED_TYPES, true)) {
    http_response_code(400);
    exit('Invalid type parameter. Allowed: landscape, portrait');
}

// 构建文件路径
$filename = __DIR__ . '/' . $type . '.txt';

// 检查文件是否存在且可读
if (!is_file($filename) || !is_readable($filename)) {
    http_response_code(404);
    exit('Image list not found');
}

// 读取文件内容
$content = file_get_contents($filename);

if ($content === false || trim($content) === '') {
    http_response_code(404);
    exit('Image list is empty');
}

// 分割成数组并过滤空行
$urls = array_filter(
    array_map('trim', explode("\n", $content)),
    fn($url) => $url !== ''
);

if (empty($urls)) {
    http_response_code(404);
    exit('No valid URLs found');
}

// 随机选择一个URL
$randomUrl = $urls[array_rand($urls)];

// 验证URL格式（必须是http或https）
if (!preg_match('/^https?:\/\//i', $randomUrl)) {
    http_response_code(500);
    exit('Invalid URL format');
}

// 302重定向
header('Location: ' . $randomUrl, true, 302);
exit;
