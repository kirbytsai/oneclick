const path = require('path');
const dotenv = require('dotenv');

// 載入環境變數
const envPath = path.join(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

const jwtService = require('./utils/jwt');
const ResponseFormatter = require('./utils/response');

const testJWT = () => {
  try {
    console.log('🔍 測試 JWT 服務...');
    
    // 測試 Token 生成
    console.log('🔑 測試 Token 生成...');
    const payload = {
      userId: '12345',
      email: 'test@example.com',
      role: 'seller'
    };
    
    const { accessToken, refreshToken } = jwtService.generateTokenPair(payload);
    console.log('✅ Access Token 生成成功');
    console.log('✅ Refresh Token 生成成功');
    
    // 測試 Token 驗證
    console.log('🔍 測試 Token 驗證...');
    const decodedAccess = jwtService.verifyAccessToken(accessToken);
    const decodedRefresh = jwtService.verifyRefreshToken(refreshToken);
    
    console.log('✅ Access Token 驗證成功:', decodedAccess.email);
    console.log('✅ Refresh Token 驗證成功:', decodedRefresh.email);
    
    // 測試回應格式化
    console.log('📤 測試回應格式化...');
    const successResponse = ResponseFormatter.success({ token: accessToken }, '登入成功');
    const errorResponse = ResponseFormatter.error('INVALID_CREDENTIALS', '帳號或密碼錯誤', null, 401);
    
    console.log('✅ 成功回應格式:', successResponse.success);
    console.log('✅ 錯誤回應格式:', errorResponse.success);
    
    console.log('🎉 JWT 服務測試通過！');
    
  } catch (error) {
    console.error('❌ JWT 服務測試失敗:', error.message);
  }
};

testJWT();