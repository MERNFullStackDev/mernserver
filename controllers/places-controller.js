const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Place = require("../models/place");
const Utils = require("../utils/utils");
const User = require("../models/user");
const fs = require('fs');


const HttpError = require("../models/http-error");

const getPlacesByPlaceId = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong while fetching data",
      500
    );
    return next(error);
  }
  if (!place) {
    const error = new HttpError(
      "Unable to find places with provided place id",
      404
    );
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Fetching Places get failed, try after sometime",
      500
    );
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError("Unable to find places with provided User id", 404)
    );
  }
  res.json({
    places: places.map((placeObj) => {
      return placeObj.toObject({ getters: true });
    }),
  });
};

const createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Please check your Input data", 422));
  }
  const { title, description, address} = req.body;

  const createPlace = new Place({
    title,
    description,
    address,
    location: Utils.getCoordinates(),
    image:req.file.path,
    creator:req.userData.userId
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError('Failed while checking existing user, try after some time.',500);
    return next(error);
  }
if(!user){
  const error = new HttpError('We could not find user with provided user id.',404);
    return next(error);
}
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    createPlace.save({session:sess});
    user.places.push(createPlace);
    await user.save();
    await sess.commitTransaction();

  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createPlace });
};

const updatePlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Please check your Input data", 422));
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong while updating data, please try again later",
      500
    );
    return next(error);
  }
  if(place.creator.toString() !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this place.',401);
    return next(error);
  }
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError("Something went wrong while saving data", 500);
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  
  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      "Something went wrong while deleting place",
      500
    );
    return next(error);
  }

  if(!place){
      const error = new HttpError('Place could not be found',404);
      return next(error);
  }

if(place.creator.id !== req.userData.userId){
  const error = new HttpError('You are not allowed to delete this place.',401);
  return next(error);
}

  const imagePath = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({session:sess});
    place.creator.places.pull(place);
    await place.creator.save({session:sess});
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong while deleting place",
      500
    );
    return next(error);
  }
    fs.unlink(imagePath, err =>{
      console.log(err);
    });

  res.status(200).json({ message: "Place Deleted Successfully." });
};

exports.getPlacesByPlaceId = getPlacesByPlaceId;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
