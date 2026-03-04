# Random Image 302 API

随机图片 302 跳转 API，支持 PHP 和 Cloudflare Workers 两种部署方式。

## 使用方法

### 请求参数

| 参数 | 说明 |
|------|------|
| `type` | 图片类型：`landscape`（横屏）或 `portrait`（竖屏），不传则随机选择 |

### 示例

```
GET /                    # 随机选择类型
GET /?type=landscape     # 横屏图片
GET /?type=portrait      # 竖屏图片
```

## PHP 部署

将以下文件上传到支持 PHP 的服务器：

- `Random.php`
- `landscape.txt`
- `portrait.txt`

## Cloudflare Workers 部署

### 1. 准备图片列表

编辑 `landscape.txt` 和 `portrait.txt`，每行一个图片 URL。

### 2. 构建并部署

```bash
# 构建 worker.js
node build.js

# 部署到 Cloudflare Workers
npx wrangler deploy
```

或者使用 Cloudflare Pages 的 CI/CD：
- Build command: `node build.js`
- Deploy command: `npx wrangler deploy`

## 文件说明

| 文件 | 说明 |
|------|------|
| `Random.php` | PHP 版本入口 |
| `worker.js` | Cloudflare Workers 入口（由 build.js 生成） |
| `build.js` | 构建脚本，读取 txt 生成 worker.js |
| `wrangler.toml` | Cloudflare Workers 配置 |
| `landscape.txt` | 横屏图片 URL 列表 |
| `portrait.txt` | 竖屏图片 URL 列表 |

## License

MIT