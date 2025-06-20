// 標準化 API 回應格式
class ResponseFormatter {
  static success(data = null, message = '操作成功', statusCode = 200) {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      statusCode
    };
  }

  static error(code, message, details = null, statusCode = 400) {
    return {
      success: false,
      error: {
        code,
        message,
        details
      },
      timestamp: new Date().toISOString(),
      statusCode
    };
  }

  static paginated(data, pagination, message = '資料擷取成功') {
    return {
      success: true,
      data,
      pagination: {
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        itemsPerPage: pagination.limit,
        hasNextPage: pagination.page < pagination.totalPages,
        hasPrevPage: pagination.page > 1
      },
      message,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ResponseFormatter;