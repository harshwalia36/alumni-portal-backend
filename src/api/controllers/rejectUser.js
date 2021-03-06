const { ObjectID } = require('mongodb');

module.exports = async (req, res, db) => {
  try {
    await db.collection('users').deleteOne({ _id: ObjectID(req.body.userId) });
    res.status(200).json({ icon: 'success', title: 'User successfully deleted from database!' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(500).json({ icon: 'error', title: 'Server Error!' });
  }
};
