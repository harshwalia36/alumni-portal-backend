const { ObjectID } = require('mongodb');

module.exports = async (req, res, db, client) => {
  const { email } = req.user;
  const user = await db.collection('users').findOne({ email });
  const userID = user._id;

  const session = client.startSession();
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' },
  };
  try {
    const transactionResults = await session.withTransaction(async () => {
      // inserting comment in comment collection
      let cmntID = await db
        .collection('comments')
        .insertOne({ ...req.body, timestamp: Date() }, { session });
      // updating users collection with commentID and postID in a comment array.

      cmntID = cmntID.insertedId;

      await db.collection('users').updateOne(
        { _id: userID },
        {
          $push: { comments: { commentID: cmntID, postID: req.params.postID } },
        },
        { session }
      );

      // updating posts collection with inserting an array postComments which contain all the posts commentID's .
      await db
        .collection('posts')
        .updateOne(
          { _id: ObjectID(req.params.postID) },
          { $push: { postCommentsIDs: cmntID } },
          { session }
        );
    }, transactionOptions);

    if (transactionResults) {
      res.status(200).json({ icon: 'success', title: 'Comment Successfull!' });
    } else {
      console.log('The transaction was intentionally aborted.');
    }
  } catch (e) {
    console.log(`The transaction was aborted due to an unexpected error: ${e}`);
  } finally {
    await session.endSession();
  }
};
