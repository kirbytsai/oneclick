export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🎉 提案媒合平台
        </h1>
        <p className="text-gray-600 mb-6">
          基礎環境設置成功！
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ Next.js 運行正常</p>
          <p>✅ Tailwind CSS 載入成功</p>
          <p>✅ 專案結構建立完成</p>
        </div>
        <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
          準備開始 Phase 1
        </button>
      </div>
    </div>
  );
}