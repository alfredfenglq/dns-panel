
# Cloudflare DNS Manager (Cloudflare Pages + Functions)

前端：React + Vite + Tailwind  
后端：**Cloudflare Pages Functions**（代理 Cloudflare API；安全存放 `CLOUDFLARE_API_TOKEN`）

> ✅ 符合安全要求：Token 仅存在于 Functions 运行时环境变量，**不会暴露给前端**  
> ✅ 同源：前后端同域，无需 CORS  
> ✅ 一键部署到 Cloudflare Pages

---

## 目录结构
```
cloudflare-dns-manager-pages/
├── README.md
├── .gitignore
├── .env.example                 # 仅示例（线上用 Pages 的环境变量）
├── wrangler.toml               # 本地联调（可选）
├── functions/                  # Pages Functions（后端代理）
│   └── api/
│       ├── _utils.js
│       ├── health.js
│       ├── zones.js
│       └── zones/
│           └── [zoneId]/
│               ├── dns_records.js
│               └── dns_records/
│                   └── [recordId].js
└── client/                     # 前端（Vite）
    ├── index.html
    ├── vite.config.js
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── api.js
        ├── index.css
        ├── main.jsx
        ├── App.jsx
        └── components/
            └── RecordForm.jsx
```

---

## 部署到 Cloudflare Pages（推荐）

### 1) 新建 Pages 项目
- 连接本仓库（或把代码推到你自己的 Git，再连接）
- **Build command**（示例）：
  ```bash
  npm --prefix client ci && npm --prefix client run build
  ```
- **Build output directory**：
  ```
  client/dist
  ```
- Functions 目录默认为 `functions`，无需额外设置

### 2) 设置环境变量（重要）
在 **Pages → Settings → Environment variables**：
- 添加 Secret：`CLOUDFLARE_API_TOKEN`
  - 权限建议：**Zone: Read** + **DNS: Read/Write (Edit)**

> 注意：Pages 使用平台环境变量，**不会读取 `.env` 文件**。

### 3) 访问
构建完成后，直接访问 Pages 提供的域名（或你的自定义域名）。  
前端调用 `/api/...` 将命中同站点下的 Functions。

---

## 本地开发（可选）

### 前端开发服务器（仅前端）
```bash
cd client
npm i
npm run dev -- --host
# 打开 http://localhost:5173
# 注意：此模式下 /api 不可用（需要代理或 Functions 本地服务）
```

### Functions + 静态资源一起本地预览（推荐）
1) 先构建前端：
```bash
cd client
npm i
npm run build
cd ..
```

2) 本地设置 Secret（仅本机）：
```bash
wrangler secret put CLOUDFLARE_API_TOKEN
```

3) 运行 Pages Dev（同时挂载 functions + dist）：
```bash
wrangler pages dev client/dist --compatibility-date=2024-09-01
# 打开 http://127.0.0.1:8788
```

> 需要安装 Wrangler：`npm i -g wrangler`

---

## `.env.example`
此文件仅做示例说明。**线上部署请在 Pages 项目配置环境变量**，不要把 Token 写入任何文件。
