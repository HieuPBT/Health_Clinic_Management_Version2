import { defaultPageSize } from "../config/pagination.js";

const createPaginator = (model) => {
  return async (queryOrPipeline, options) => {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || defaultPageSize;
    const skip = (page - 1) * limit;
    const sortBy = options.sortBy || { createdAt: -1 };
    
    let isPipeline = Array.isArray(queryOrPipeline);
    let countPromise, docsPromise;

    if (isPipeline) {
      // If it's an aggregation pipeline, add pagination stages
      const pipeline = [
        ...queryOrPipeline,
        { $sort: sortBy },
        { $skip: skip },
        { $limit: limit },
      ];

      // Count total documents separately
      const countPipeline = [...queryOrPipeline, { $count: 'totalDocs' }];
      const [countResult] = await model.aggregate(countPipeline);
      const totalDocs = countResult ? countResult.totalDocs : 0;
      
      // Fetch documents with pagination
      docsPromise = model.aggregate(pipeline).exec();
      countPromise = Promise.resolve(totalDocs);
      
    } else {
      // Standard query (non-pipeline)
      countPromise = model.countDocuments(queryOrPipeline);
      docsPromise = model.find(queryOrPipeline).sort(sortBy).skip(skip).limit(limit);
    }

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
