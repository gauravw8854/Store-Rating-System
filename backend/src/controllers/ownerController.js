const prisma = require("../lib/prisma");

exports.dashboard = async (req, res, next) => {
  try {
    const store = await prisma.store.findUnique({
      where: { ownerId: req.user.id },
      include: {
        ratings: {
          orderBy: { updatedAt: "desc" },
          include: { user: { select: { id: true, name: true, email: true } } }
        }
      }
    });
    if (!store) return res.status(404).json({ message: "No store is linked to this owner account." });
    const count = store.ratings.length;
    const averageRating = count
      ? Number((store.ratings.reduce((sum, item) => sum + item.rating, 0) / count).toFixed(2))
      : 0;
    res.json({
      store: { id: store.id, name: store.name, address: store.address },
      totalRatings: count,
      averageRating,
      ratings: store.ratings.map((r) => ({
        id: r.id, rating: r.rating, updatedAt: r.updatedAt, user: r.user
      }))
    });
  } catch (err) { next(err); }
};
