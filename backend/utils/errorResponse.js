export function handleServerError(res, error, message = "Server error") {
  console.error(error);

  return res.status(500).json({
    success: false,
    message,
  });
}