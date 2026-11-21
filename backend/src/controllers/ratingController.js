const prisma = require("../lib/prisma");

exports.upsertRating = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const storeId = Number(req.body.storeId);
    const rating = Number(req.body.rating);

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return res.status(404).json({ message: "Store not found." });

    const saved = await prisma.rating.upsert({
      where: { userId_storeId: { userId, storeId } },
      update: { rating },
      create: { userId, storeId, rating }
    });
    res.json({ message: "Rating saved.", rating: saved });
  } catch (err) { next(err); }
};
