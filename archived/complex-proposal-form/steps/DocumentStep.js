// src/components/proposals/steps/DocumentStep.js
import { Upload, FileText } from 'lucide-react';

export default function DocumentStep({ formData, errors, updateFormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">文件上傳</h2>
      <p className="text-gray-600">上傳相關的商業計劃書、財務報表等文件（可選）</p>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">上傳文件</h3>
        <p className="text-gray-500 mb-4">
          支持 PDF、DOC、DOCX、XLS、XLSX 格式，單個文件最大 10MB
        </p>
        <button
          type="button"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          選擇文件
        </button>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FileText className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              文件上傳提醒
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>• 文件上傳為可選項目，您可以稍後再補充</p>
              <p>• 建議上傳商業計劃書、財務報表等關鍵文件</p>
              <p>• 所有文件將進行安全審核，確保資訊安全</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}