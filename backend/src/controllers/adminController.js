const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

exports.dashboard = async (_req, res, next) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(), prisma.store.count(), prisma.rating.count()
    ]);
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) { next(err); }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, address, password, role = "USER" } = req.body;
    if (!["ADMIN", "USER", "STORE_OWNER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, address, passwordHash, role },
      select: { id: true, name: true, email: true, address: true, role: true, createdAt: true }
    });
    res.status(201).json({ message: "User created.", user });
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ message: "Email is already registered." });
    next(err);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const { name = "", email = "", address = "", role = "", sortBy = "name", order = "asc" } = req.query;
    const allowed = ["name", "email", "address", "role", "createdAt"];
    const safeSort = allowed.includes(sortBy) ? sortBy : "name";
    const where = {
      ...(name ? { name: { contains: name, mode: "insensitive" } } : {}),
      ...(email ? { email: { contains: email, mode: "insensitive" } } : {}),
      ...(address ? { address: { contains: address, mode: "insensitive" } } : {}),
      ...(role && ["ADMIN", "USER", "STORE_OWNER"].includes(role) ? { role } : {})
    };
    const users = await prisma.user.findMany({
      where, orderBy: { [safeSort]: order === "desc" ? "desc" : "asc" },
      select: {
        id: true, name: true, email: true, address: true, role: true, createdAt: true,
        ownedStore: { select: { id: true, name: true, ratings: { select: { rating: true } } } }
      }
    });
    res.json({ users: users.map((u) => ({
      ...u,
      storeAverageRating: u.ownedStore?.ratings.length
        ? Number((u.ownedStore.ratings.reduce((s, r) => s + r.rating, 0) / u.ownedStore.ratings.length).toFixed(2))
        : null
    })) });
  } catch (err) { next(err); }
};

exports.userDetails = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      select: {
        id: true, name: true, email: true, address: true, role: true, createdAt: true,
        ownedStore: { select: { id: true, name: true, ratings: { select: { rating: true } } } }
      }
    });
    if (!user) return res.status(404).json({ message: "User not found." });
    const ratings = user.ownedStore?.ratings || [];
    res.json({
      user,
      storeAverageRating: ratings.length
        ? Number((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(2))
        : null
    });
  } catch (err) { next(err); }
};

exports.listStores = async (req, res, next) => {
  try {
    const { name = "", email = "", address = "", sortBy = "name", order = "asc" } = req.query;
    const allowed = ["name", "email", "address", "createdAt"];
    const safeSort = allowed.includes(sortBy) ? sortBy : "name";
    const where = {
      ...(name ? { name: { contains: name, mode: "insensitive" } } : {}),
      ...(email ? { email: { contains: email, mode: "insensitive" } } : {}),
      ...(address ? { address: { contains: address, mode: "insensitive" } } : {})
    };
    const stores = await prisma.store.findMany({
      where, orderBy: { [safeSort]: order === "desc" ? "desc" : "asc" },
      include: { owner: { select: { id: true, name: true, email: true } }, ratings: { select: { rating: true } } }
    });
    res.json({ stores: stores.map((s) => {
      const { ratings, ...rest } = s;
      return { ...rest, averageRating: ratings.length ? Number((ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(2)) : 0 };
    }) });
  } catch (err) { next(err); }
};
