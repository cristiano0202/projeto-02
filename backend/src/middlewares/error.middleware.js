function notFound(req, res, next) {
  res.status(404).json({
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
}

function errorHandler(error, req, res, next) {
  console.error(error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
}

module.exports = { notFound, errorHandler };
