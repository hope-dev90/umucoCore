export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  })
}

export const errorResponse = (res, message = 'Something went wrong', statusCode = 500) => {
  return res.status(statusCode).json({
    status: 'error',
    message
  })
}

export const paginatedResponse = (res, result, message = 'Data retrieved') => {
  return res.status(200).json({
    status: 'success',
    message,
    total: result.total,
    page: result.page,
    limit: result.limit,
    data: result.data
  })
}