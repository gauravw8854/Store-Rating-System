const prisma = require("../lib/prisma");

exports.listStores = async (req, res, next) => {
  try {
    const { search = "", sortBy = "name", order = "asc", page = "1", limit = "10" } = req.query;
    const allowedSort = ["name", "email", "address", "createdAt"];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : "name";
    const safeOrder = order === "desc" ? "desc" : "asc";
    const take = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);

    const where = search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } }
      ]
    } : {};

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where, orderBy: { [safeSort]: safeOrder },
        skip: (currentPage - 1) * take, take,
        include: {
          _count: { select: { ratings: true } },
          ratings: { select: { rating: true, userId: true } }
        }
      }),
      prisma.store.count({ where })
    ]);

    const result = stores.map((store) => {
      const { ratings, ...rest } = store;
      const averageRating = ratings.length
        ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2))
        : 0;
      return {
        ...rest,
        averageRating,
        userRating: ratings.find((r) => r.userId === req.user.id)?.rating ?? null
      };
    });

    res.json({ stores: result, pagination: { page: currentPage, limit: take, total, pages: Math.ceil(total / take) } });
  } catch (err) { next(err); }
};

exports.createStore = async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;
    let owner = null;
    if (ownerId) {
      owner = await prisma.user.findUnique({ where: { id: Number(ownerId) } });
      if (!owner || owner.role !== "STORE_OWNER") {
        return res.status(400).json({ message: "ownerId must belong to a STORE_OWNER account." });
      }
      const existingStore = await prisma.store.findUnique({ where: { ownerId: owner.id } });
      if (existingStore) return res.status(409).json({ message: "This owner already has a store." });
    }
    const store = await prisma.store.create({
      data: { name, email, address, ownerId: owner ? owner.id : null }
    });
    res.status(201).json({ message: "Store created.", store });
  } catch (err) { next(err); }
};
