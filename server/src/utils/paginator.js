import { defaultPageSize } from "../config/pagination.js";

const createPaginator = (model) => {
    return async (query, options) => {
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || defaultPageSize;
      const skip = (page - 1) * limit;
      const sortBy = options.sortBy || { createdAt: -1 };

      const countPromise = model.countDocuments(query);
      const docsPromise = model.find(query).sort(sortBy).skip(skip).limit(limit);

      const [totalDocs, docs] = await Promise.all([countPromise, docsPromise]);

      const totalPages = Math.ceil(totalDocs / limit);

      const result = {
        results: docs,
        totalDocs,
        limit,
        page,
        totalPages,
      };

      if (options.baseUrl) {
        result.nextPage = page < totalPages ? `${options.baseUrl}?page=${page + 1}&limit=${limit}` : null;
        result.prevPage = page > 1 ? `${options.baseUrl}?page=${page - 1}&limit=${limit}` : null;
      }

      return result;
    };
  };

export default createPaginator;
