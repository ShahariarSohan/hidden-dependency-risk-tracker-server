export const validateRequest = (ZodSchema) => async (req, res, next) => {
    try {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        req.body = await ZodSchema.parseAsync(req.body);
        next();
    }
    catch (error) {
        next(error);
    }
};
