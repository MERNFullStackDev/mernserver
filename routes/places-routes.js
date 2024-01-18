const express = require("express");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload");
const placesController = require("../controllers/places-controller");
const checkAuth = require('../middleware/check-auth');

const router = express.Router();
router.get("/:pid", placesController.getPlacesByPlaceId);
router.get("/user/:uid", placesController.getPlacesByUserId);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  [check("title").notEmpty(), check("description").isLength({ min: 5 })],
  placesController.createPlace
);
router.patch(
  "/:pid",
  [check("title").notEmpty(), check("description").isLength({ min: 5 })],
  placesController.updatePlace
);
router.delete("/:pid", placesController.deletePlace);

module.exports = router;
