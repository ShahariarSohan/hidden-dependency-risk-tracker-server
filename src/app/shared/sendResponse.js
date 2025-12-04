const sendResponse = (res, data) => {
    res.status(data.statusCode).json({
        success: data.success,
        message: data.message,
        meta: data.meta || null || undefined,
        data: data.data || null || undefined,
    });
};
export default sendResponse;
