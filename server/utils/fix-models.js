// 創建這個檔案：server/utils/fix-models.js
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../models');
const modelFiles = ['User.js', 'Proposal.js', 'ProposalSubmission.js', 'Comment.js', 'Notification.js', 'AuditLog.js'];

modelFiles.forEach(filename => {
  const filePath = path.join(modelsDir, filename);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const modelName = filename.replace('.js', '');
    
    // 檢查是否已經有重複註冊檢查
    if (!content.includes('mongoose.models.' + modelName)) {
      // 找到第一個 require('mongoose') 後插入檢查代碼
      const requireRegex = /const mongoose = require\('mongoose'\);/;
      const checkCode = `\n\n// 避免重複註冊模型\nif (mongoose.models.${modelName}) {\n  module.exports = mongoose.models.${modelName};\n  return;\n}`;
      
      content = content.replace(requireRegex, `const mongoose = require('mongoose');${checkCode}`);
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ 修復完成: ${filename}`);
    } else {
      console.log(`⏭️  已修復過: ${filename}`);
    }
  } else {
    console.log(`⚠️  檔案不存在: ${filename}`);
  }
});

console.log('🎉 所有模型檔案修復完成！');

// 執行方式：
// node server/utils/fix-models.js