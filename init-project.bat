@echo off
REM 提案媒合平台 - Windows 初始化腳本
REM 使用方法: init-project.bat

echo 🚀 開始初始化提案媒合平台...
echo.

REM 檢查 Node.js
echo 檢查 Node.js 版本...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安裝。請先安裝 Node.js 18+ 版本
    pause
    exit /b 1
)

for /f "tokens=1 delims=." %%a in ('node --version') do set NODE_MAJOR=%%a
set NODE_MAJOR=%NODE_MAJOR:v=%
if %NODE_MAJOR% LSS 18 (
    echo ❌ Node.js 版本過舊。需要 18+ 版本
    pause
    exit /b 1
)

echo ✅ Node.js 版本檢查通過
echo.

REM 創建資料夾結構
echo 創建專案資料夾結構...
mkdir src\components\common 2>nul
mkdir src\components\auth 2>nul
mkdir src\components\layout 2>nul
mkdir src\components\dashboard 2>nul
mkdir src\components\proposals 2>nul
mkdir src\components\admin 2>nul
mkdir src\contexts 2>nul
mkdir src\hooks 2>nul
mkdir src\services 2>nul
mkdir src\utils 2>nul
mkdir src\styles 2>nul
mkdir server\config 2>nul
mkdir server\models 2>nul
mkdir server\routes 2>nul
mkdir server\middleware 2>nul
mkdir server\utils 2>nul
mkdir server\tests 2>nul
mkdir pages 2>nul
mkdir public\images 2>nul
mkdir tests\components 2>nul
mkdir tests\pages 2>nul
mkdir tests\utils 2>nul
mkdir docs 2>nul
mkdir scripts 2>nul

echo ✅ 資料夾結構創建完成
echo.

REM 創建 package.json
echo 創建 package.json...
(
echo {
echo   "name": "proposal-matching-platform",
echo   "version": "1.0.0",
echo   "description": "A proposal matching platform for business proposals",
echo   "main": "server.js",
echo   "scripts": {
echo     "dev": "concurrently \"npm run server:dev\" \"npm run client:dev\"",
echo     "server:dev": "nodemon server/server.js",
echo     "client:dev": "next dev",
echo     "build": "next build",
echo     "start": "node server/server.js",
echo     "vercel-build": "next build",
echo     "test": "jest",
echo     "test:watch": "jest --watch",
echo     "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
echo     "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
echo     "seed": "node server/utils/seedData.js"
echo   },
echo   "dependencies": {
echo     "next": "^14.0.0",
echo     "react": "^18.0.0",
echo     "react-dom": "^18.0.0",
echo     "express": "^4.18.2",
echo     "mongoose": "^7.5.0",
echo     "bcryptjs": "^2.4.3",
echo     "jsonwebtoken": "^9.0.2",
echo     "cookie-parser": "^1.4.6",
echo     "cors": "^2.8.5",
echo     "helmet": "^7.0.0",
echo     "express-rate-limit": "^6.10.0",
echo     "express-validator": "^7.0.1",
echo     "dotenv": "^16.3.1",
echo     "react-hook-form": "^7.45.0",
echo     "yup": "^1.3.0",
echo     "@hookform/resolvers": "^3.3.0",
echo     "react-query": "^3.39.3",
echo     "axios": "^1.5.0",
echo     "date-fns": "^2.30.0"
echo   },
echo   "devDependencies": {
echo     "@types/node": "^20.0.0",
echo     "@types/react": "^18.0.0",
echo     "@types/express": "^4.17.17",
echo     "@types/bcryptjs": "^2.4.2",
echo     "@types/jsonwebtoken": "^9.0.2",
echo     "@types/cookie-parser": "^1.4.3",
echo     "typescript": "^5.0.0",
echo     "eslint": "^8.0.0",
echo     "eslint-config-next": "^14.0.0",
echo     "prettier": "^3.0.0",
echo     "nodemon": "^3.0.1",
echo     "concurrently": "^8.2.0",
echo     "jest": "^29.6.0",
echo     "@testing-library/react": "^13.4.0",
echo     "@testing-library/jest-dom": "^6.1.0",
echo     "supertest": "^6.3.3",
echo     "tailwindcss": "^3.3.0",
echo     "postcss": "^8.4.24",
echo     "autoprefixer": "^10.4.14"
echo   },
echo   "engines": {
echo     "node": ">=18.0.0"
echo   }
echo }
) > package.json

echo ✅ package.json 創建完成
echo.

REM 創建配置檔案
echo 創建配置檔案...

REM .gitignore
(
echo # Dependencies
echo node_modules/
echo npm-debug.log*
echo yarn-debug.log*
echo yarn-error.log*
echo.
echo # Environment variables
echo .env
echo .env.local
echo .env.development.local
echo .env.test.local
echo .env.production.local
echo.
echo # Next.js
echo .next/
echo out/
echo.
echo # Production build
echo build/
echo dist/
echo.
echo # OS generated files
echo .DS_Store
echo .DS_Store?
echo ._*
echo .Spotlight-V100
echo .Trashes
echo ehthumbs.db
echo Thumbs.db
echo.
echo # IDE
echo .vscode/
echo .idea/
echo *.swp
echo *.swo
echo.
echo # Logs
echo logs
echo *.log
echo.
echo # Vercel
echo .vercel
) > .gitignore

REM .env.example
(
echo NODE_ENV=development
echo PORT=5000
echo.
echo # Database
echo MONGODB_URI=mongodb://localhost:27017/proposal-matching
echo.
echo # JWT Secrets
echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
echo JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
echo.
echo # Frontend URL
echo FRONTEND_URL=http://localhost:3000
echo.
echo # Admin IP Whitelist ^(comma separated^)
echo ADMIN_IP_WHITELIST=127.0.0.1,::1
echo.
echo # Email Service ^(for notifications^)
echo EMAIL_API_KEY=your-email-service-api-key
echo EMAIL_FROM=noreply@yourapp.com
) > .env.example

REM next.config.js
(
echo /** @type {import^('next'^).NextConfig} */
echo const nextConfig = {
echo   reactStrictMode: true,
echo   swcMinify: true,
echo   async rewrites^(^) {
echo     return [
echo       {
echo         source: '/api/:path*',
echo         destination: process.env.NODE_ENV === 'development' 
echo           ? 'http://localhost:5000/api/:path*'
echo           : '/api/:path*',
echo       },
echo     ]
echo   },
echo   env: {
echo     CUSTOM_KEY: process.env.CUSTOM_KEY,
echo   },
echo }
echo.
echo module.exports = nextConfig
) > next.config.js

REM tailwind.config.js
(
echo /** @type {import^('tailwindcss'^).Config} */
echo module.exports = {
echo   content: [
echo     './pages/**/*.{js,ts,jsx,tsx,mdx}',
echo     './src/components/**/*.{js,ts,jsx,tsx,mdx}',
echo     './src/**/*.{js,ts,jsx,tsx,mdx}',
echo   ],
echo   theme: {
echo     extend: {
echo       colors: {
echo         primary: {
echo           50: '#eff6ff',
echo           500: '#3b82f6',
echo           600: '#2563eb',
echo           700: '#1d4ed8',
echo         }
echo       }
echo     },
echo   },
echo   plugins: [],
echo }
) > tailwind.config.js

REM postcss.config.js
(
echo module.exports = {
echo   plugins: {
echo     tailwindcss: {},
echo     autoprefixer: {},
echo   },
echo }
) > postcss.config.js

echo ✅ 配置檔案創建完成
echo.

REM 創建基礎檔案
echo 創建基礎頁面檔案...

REM README.md
(
echo # 提案媒合平台
echo.
echo 這是一個針對日本市場的商業提案媒合平台，連接提案方和買方。
echo.
echo ## 快速開始
echo.
echo ### 1. 安裝依賴
echo ```bash
echo npm install
echo ```
echo.
echo ### 2. 設定環境變數
echo ```bash
echo copy .env.example .env.local
echo # 編輯 .env.local 並填入正確的值
echo ```
echo.
echo ### 3. 創建管理員帳戶
echo ```bash
echo npm run seed
echo ```
echo.
echo ### 4. 啟動開發伺服器
echo ```bash
echo npm run dev
echo ```
echo.
echo ## 預設帳戶
echo.
echo - 管理員：admin@example.com / Admin123!
echo.
echo ## 技術棧
echo.
echo - Frontend: Next.js, React, Tailwind CSS
echo - Backend: Node.js, Express.js
echo - Database: MongoDB
echo - Authentication: JWT
echo - Deployment: Vercel
) > README.md

REM src/styles/globals.css
(
echo @tailwind base;
echo @tailwind components;
echo @tailwind utilities;
echo.
echo @layer base {
echo   html {
echo     font-family: system-ui, sans-serif;
echo   }
echo }
echo.
echo @layer components {
echo   .btn-primary {
echo     @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors;
echo   }
echo   
echo   .btn-secondary {
echo     @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors;
echo   }
echo   
echo   .input-field {
echo     @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
echo   }
echo   
echo   .card {
echo     @apply bg-white rounded-lg shadow-md p-6;
echo   }
echo }
) > src\styles\globals.css

echo ✅ 基礎檔案創建完成
echo.

REM 安裝依賴
echo 安裝 npm 依賴...
echo 這可能需要幾分鐘時間...
npm install --silent

if errorlevel 1 (
    echo ❌ 依賴安裝失敗
    pause
    exit /b 1
)

echo ✅ 依賴安裝完成
echo.

REM 創建環境變數檔案
echo 設定環境變數...
if not exist .env.local (
    copy .env.example .env.local >nul
    echo ✅ 環境變數檔案創建完成
    echo ⚠️  請編輯 .env.local 並設定正確的 MongoDB 連接字串
) else (
    echo ⚠️  .env.local 已存在，跳過創建
)
echo.

REM 顯示完成訊息
echo.
echo 🎉 專案初始化完成！
echo.
echo 下一步操作：
echo 1. 編輯 .env.local 設定 MongoDB 連接字串
echo 2. 確保 MongoDB 服務運行
echo 3. 創建管理員帳戶：
echo    npm run seed
echo 4. 啟動開發伺服器：
echo    npm run dev
echo.
echo 預設管理員帳戶：
echo    Email: admin@example.com
echo    Password: Admin123!
echo.
echo 開發伺服器位址：
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo.
echo 🚀 祝你開發順利！
echo.

pause