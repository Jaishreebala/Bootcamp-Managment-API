const advancedResults = (model, populate) => async (req, res, next) => {
    let query;
    // Create copy of req query
    const requestQuery = { ...req.query }

    // fields to exclude
    console.log(requestQuery)

    let removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => {
        delete requestQuery[param]
    })

    console.log(requestQuery)
    // get elements in request
    let queryStr = JSON.stringify(requestQuery);

    // Get elements that are operators
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // finding resourses
    query = model.find(JSON.parse(queryStr));
    // select
    if (req.query.select) {
        let fields = req.query.select.split(',').join(' ');
        query = query.select(fields)
    }
    // sort
    if (req.query.sort) {
        let sort = req.query.sort.split(',').join(' ')
        query = query.sort(sort)
    } else {
        query = query.sort('-createdAt')
    }

    // pagintaion
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);


    if (populate) {
        query = query.populate(populate);
    }
    // Execute query
    const results = await query;

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }
    res.advancedResults = { success: true, count: results.length, pagination, data: results };
    next();
}

module.exports = advancedResults;