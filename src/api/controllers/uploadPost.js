module.exports = async (req, res, db) => {
  const { text, type } = req.body;
  const user = await db.collection('users').findOne({ email: req.user.email });
  const ID = user._id;
  await db.collection('posts').insertOne({ ID, text, type });

  db.collection('posts')
    .find()
    .sort({ _id: -1 })
    .toArray(async (err, collection) => {
      if (err) throw err;
      await db
        .collection('users')
        .updateOne({ email: req.user.email }, { $push: { Posts: collection[0]._id } });
    });
  res.status(200).json('success');
};
