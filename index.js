const Comment = require('models/comment');

module.exports = {
    typeDefs: `
    type Asset {
        authorCount: Int!
    }
    `,
    loaders: (context) => ({
        Comments: {
            getUniqueAuthorCountOnAsset: async (asset_id) => {
                let results = await Comment.aggregate([
                    { $match: { asset_id } },
                    { $group: { _id: '$author_id' } },
                    { $count: 'count' }
                ]);

                // If there were no results from the aggregation, then there 
                // were no comments matching the query.
                if (results.length <= 0) {
                    return 0;
                }

                return results[0].count;
            }
        }
    }),
    resolvers: {
        Asset: {
            authorCount({id}, args, {loaders: {Comments}}) {
                return Comments.getUniqueAuthorCountOnAsset(id);
            }
        }
    }
}

