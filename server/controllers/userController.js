import User from "../models/User.js";

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({
      walletAddress: req.params.walletAddress,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUsersByName = async (req, res) => {
  try {
    const namePrefix = req.params.name;
    const users = await User.find({
      name: { $regex: `^${namePrefix}`, $options: "i" },
    });
    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found with the given name prefix" });
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating user", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { walletAddress: req.params.walletAddress },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating user", error: error.message });
  }
};

export const addNftToUser = async (req, res) => {
  const { walletAddress, nftAddress } = req.body;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { walletAddress },
      { $push: { mintedNfts: nftAddress } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating user", error: error.message });
  }
};
