const Comment = require('models/comment');
const {singleJoinBy} = require('graph/loaders/util');
const DataLoader = require('dataloader');

const getUniqueAuthorCountOnAssets = async (asset_ids) => {
    let results = await Comment.aggregate([
        { $match: { asset_id: { $in: asset_ids } } },
        { $group: { _id: { asset_id: '$asset_id', author_id: '$author_id' } } },
        { $group: { _id: '$_id.asset_id', count: { $sum: 1 } } }
    ]);

    return singleJoinBy(asset_ids, '_id')(results).map((result) => {
        if (result == null) {
            return 0;
        }

        return result.count;
    });
}

module.exports = {
    typeDefs: `
    type Asset {
        authorCount: Int!
    }
    `,
    loaders: (context) => ({
        Comments: {
            getUniqueAuthorCountOnAsset: new DataLoader((ids) => getUniqueAuthorCountOnAssets(ids))
        }
    }),
    resolvers: {
        Asset: {
            authorCount({id}, args, {loaders: {Comments}}) {
                return Comments.getUniqueAuthorCountOnAsset.load(id);
            }
        }
    }
}

