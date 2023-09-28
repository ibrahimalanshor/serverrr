import { Handler, Request, Response, NextFunction, query } from 'express';
import Joi from 'joi';

interface QueryForAll {
  page: {
    size: number;
    number: number;
  };
}

export class QueryMiddleware {
  private schema: Joi.Schema = Joi.object({
    page: Joi.object({
      number: Joi.number().positive().messages({
        'number.base': 'page number must be a number',
        'number.positive': 'page number must be a positive number',
      }),
      size: Joi.number().positive().messages({
        'number.base': 'page size must be a number',
        'number.positive': 'page size must be a positive number',
      }),
    }).messages({
      'object.base': 'page must be an object',
    }),
  });

  private createRequestQuery(query: Request['query']): QueryForAll {
    return {
      page: {
        size: 10,
        number: 1,
      },
    };
  }

  forAll(): Handler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await this.schema.validateAsync(req.query);

        req.query = this.createRequestQuery(
          req.query,
        ) as unknown as Request['query'];

        return next();
      } catch (err) {
        if (err instanceof Joi.ValidationError) {
          return res.status(400).json({
            status: 400,
            title: 'Query Invalid',
            details: {
              [err.details[0].context?.label as string]: err.details[0].message,
            },
          });
        }

        return res.status(500).json(err);
      }
    };
  }
}
