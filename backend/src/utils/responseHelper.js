/**
 * Send a standardized success response.
 */
function success(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send a standardized error response.
 */
function error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
  const body = {
    success: false,
    message,
  };
  if (errors) {
    body.errors = errors;
  }
  return res.status(statusCode).json(body);
}

/**
 * Send a standardized paginated response.
 */
function paginated(res, data, page, limit, total, message = 'Success') {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
}

module.exports = { success, error, paginated };
