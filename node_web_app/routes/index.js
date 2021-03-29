const express = require("express");
const router = express.Router();
const {
  ensureAuth,
  ensureGuest,
  ensureRoleNotChosen,
  ensureNotDoctor,
} = require("../middleware/auth");
const User = require("../models/User");
var spawn = require("child_process").spawn;
const http = require("http");
const io = require("../app.js");
const superagent = require("superagent");
const mongoose = require("mongoose");
const Result = require("../models/Result");
const Prescription = require("../models/Prescription");

function sortFunction(a, b) {
  if (a.percn === b.percn) {
    return 1;
  } else {
    return a.percn > b.percn ? -1 : 1;
  }
}
function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }
  var max = arr[0];
  var maxIndex = 0;
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }
  return maxIndex;
}
symptoms_array = [
  "itching",
  "skin_rash",
  "nodal_skin_eruptions",
  "continuous_sneezing",
  "shivering",
  "chills",
  "joint_pain",
  "stomach_pain",
  "acidity",
  "ulcers_on_tongue",
  "muscle_wasting",
  "vomiting",
  "burning_micturition",
  "spotting_ urination",
  "fatigue",
  "weight_gain",
  "anxiety",
  "cold_hands_and_feets",
  "mood_swings",
  "weight_loss",
  "restlessness",
  "lethargy",
  "patches_in_throat",
  "irregular_sugar_level",
  "cough",
  "high_fever",
  "sunken_eyes",
  "breathlessness",
  "sweating",
  "dehydration",
  "indigestion",
  "headache",
  "yellowish_skin",
  "dark_urine",
  "nausea",
  "loss_of_appetite",
  "pain_behind_the_eyes",
  "back_pain",
  "constipation",
  "abdominal_pain",
  "diarrhoea",
  "mild_fever",
  "yellow_urine",
  "yellowing_of_eyes",
  "acute_liver_failure",
  "fluid_overload",
  "swelling_of_stomach",
  "swelled_lymph_nodes",
  "malaise",
  "blurred_and_distorted_vision",
  "phlegm",
  "throat_irritation",
  "redness_of_eyes",
  "sinus_pressure",
  "runny_nose",
  "congestion",
  "chest_pain",
  "weakness_in_limbs",
  "fast_heart_rate",
  "pain_during_bowel_movements",
  "pain_in_anal_region",
  "bloody_stool",
  "irritation_in_anus",
  "neck_pain",
  "dizziness",
  "cramps",
  "bruising",
  "obesity",
  "swollen_legs",
  "swollen_blood_vessels",
  "puffy_face_and_eyes",
  "enlarged_thyroid",
  "brittle_nails",
  "swollen_extremeties",
  "excessive_hunger",
  "extra_marital_contacts",
  "drying_and_tingling_lips",
  "slurred_speech",
  "knee_pain",
  "hip_joint_pain",
  "muscle_weakness",
  "stiff_neck",
  "swelling_joints",
  "movement_stiffness",
  "spinning_movements",
  "loss_of_balance",
  "unsteadiness",
  "weakness_of_one_body_side",
  "loss_of_smell",
  "bladder_discomfort",
  "foul_smell_of urine",
  "continuous_feel_of_urine",
  "passage_of_gases",
  "internal_itching",
  "toxic_look_(typhos)",
  "depression",
  "irritability",
  "muscle_pain",
  "altered_sensorium",
  "red_spots_over_body",
  "belly_pain",
  "abnormal_menstruation",
  "dischromic _patches",
  "watering_from_eyes",
  "increased_appetite",
  "polyuria",
  "family_history",
  "mucoid_sputum",
  "rusty_sputum",
  "lack_of_concentration",
  "visual_disturbances",
  "receiving_blood_transfusion",
  "receiving_unsterile_injections",
  "coma",
  "stomach_bleeding",
  "distention_of_abdomen",
  "history_of_alcohol_consumption",
  "fluid_overload.1",
  "blood_in_sputum",
  "prominent_veins_on_calf",
  "palpitations",
  "painful_walking",
  "pus_filled_pimples",
  "blackheads",
  "scurring",
  "skin_peeling",
  "silver_like_dusting",
  "small_dents_in_nails",
  "inflammatory_nails",
  "blister",
  "red_sore_around_nose",
  "yellow_crust_ooze",
];
diseases_array = [
  "Fungal infection",
  "Allergy",
  "GERD",
  "Chronic cholestasis",
  "Drug Reaction",
  "Peptic ulcer diseae",
  "AIDS",
  "Diabetes ",
  "Gastroenteritis",
  "Bronchial Asthma",
  "Hypertension ",
  "Migraine",
  "Cervical spondylosis",
  "Paralysis (brain hemorrhage)",
  "Jaundice",
  "Malaria",
  "Chicken pox",
  "Dengue",
  "Typhoid",
  "hepatitis A",
  "Hepatitis B",
  "Hepatitis C",
  "Hepatitis D",
  "Hepatitis E",
  "Alcoholic hepatitis",
  "Tuberculosis",
  "Common Cold",
  "Pneumonia",
  "Dimorphic hemmorhoids(piles)",
  "Heart attack",
  "Varicose veins",
  "Hypothyroidism",
  "Hyperthyroidism",
  "Hypoglycemia",
  "Osteoarthristis",
  "Arthritis",
  "(vertigo) Paroymsal  Positional Vertigo",
  "Acne",
  "Urinary tract infection",
  "Psoriasis",
  "Impetigo",
];

router.get("/", ensureGuest, (req, res) => {
  res.redirect('/form');
  return
});

router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    if (req.user.role === "patient") {
      let allResults = await Result.find({ googleId: req.user.googleId })
        .lean()
        .then((results) => {
          let suser = {
            displayName: req.user.displayName,
            image: req.user.image,
            googleId: req.user.googleId,
            role: req.user.role,
            email: req.user.email,
          };
          var options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          };
          for (var i = 0; i < results.length; i++) {
            results[i] = {
              resultId: results[i]._id,
              maindisease: results[i].predictionMain[0],
              mainpercentage: results[i].predictionMain[1],
              createdAt: results[i].createdAt.toLocaleDateString(
                "en-US",
                options
              ),
            };
          }
          console.log(results);
          res.render("dashboard", {
            layout : 'two.hbs',
            profile: suser,
            results: results.reverse(),
            auth: req.isAuthenticated(),
            doctor: req.isAuthenticated() && req.user.role === "doctor",
            patient: req.isAuthenticated() && req.user.role === "patient",
            notDoctor: !req.isAuthenticated() || req.user.role === "patient",
          });
        })
        .catch((error) => res.json({ error: error.message }));
    } else {
      let allPres = await Prescription.find({ googleId: req.user.googleId })
        .lean()
        .then((prescriptions) => {
          let suser = {
            displayName: req.user.displayName,
            image: req.user.image,
            googleId: req.user.googleId,
            role: req.user.role,
            email: req.user.email,
          };
          res.render("doctor", {
            layout : 'two.hbs',
            profile: suser,
            prescriptions: prescriptions.reverse(),
            auth: req.isAuthenticated(),
            doctor: req.isAuthenticated() && req.user.role === "doctor",
            patient: req.isAuthenticated() && req.user.role === "patient",
            notDoctor: !req.isAuthenticated() || req.user.role === "patient",
          });
        })
        .catch((error) => res.json({ error: error.message }));
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});

router.get("/role", ensureRoleNotChosen, (req, res) => {
  try {
    res.render("role", {
      auth: req.isAuthenticated(),
      doctor: req.isAuthenticated() && req.user.role === "doctor",
      patient: req.isAuthenticated() && req.user.role === "patient",
      notDoctor: !req.isAuthenticated() || req.user.role === "patient",
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

router.get("/form", ensureNotDoctor, (req, res) => {
  try {
    if (req.isAuthenticated()){
      var loggedInProfile = {
        googleId: req.user.googleId,
        displayName: req.user.displayName,
        role: req.user.role,
        email: req.user.email,
        image: req.user.image,
      }
    }
    else{
      var loggedInProfile = {}
    }

    res.render("form", {
      layout: 'form.hbs',
      profile: loggedInProfile,
      data: symptoms_array,
      auth: req.isAuthenticated(),
      doctor: req.isAuthenticated() && req.user.role === "doctor",
      patient: req.isAuthenticated() && req.user.role === "patient",
      notDoctor: !req.isAuthenticated() || req.user.role === "patient",
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

router.post("/form", ensureNotDoctor, async (req, res) => {
  try {
    console.log(req.body);
    superagent
      .post("http://localhost:8000/polls/")
      .send(req.body)
      .then(async (response) => {
        // console.log(response)
        if (response.body.error){
          res.json({ error: "error" });
        }
        else{
          console.log(response.body);
        console.log(response.body["result"]);
        resA = response.body["result"];
        var fin = Array();
        console.log(diseases_array.length);
        console.log(resA.length);
        var maxind = indexOfMax(resA);
        console.log(maxind);
        console.log({
          disease: diseases_array[maxind],
          percentage: (resA[maxind] * 100).toFixed(2).toString() + "%",
        });
        if (req.isAuthenticated()) {
          console.log(req.user);
          let result = await Result.create(
            {
              googleId: req.user.googleId,
              symptoms: req.body["symptoms"],
              diseases: resA,
              predictionMain: [
                diseases_array[maxind],
                (resA[maxind] * 100).toFixed(2).toString() + "%",
              ],
            }
          );
          res.redirect(`/result/${result._id}`);
        } else {
          var maxperc = (resA[maxind] * 100).toFixed(2).toString() + "%";
          // res.send({ symptoms: req.body["symptoms"], diseases: resA });
          fin = Array();
          var mres = { symptoms: req.body["symptoms"], diseases: resA };
          for (var i = 0; i < diseases_array.length; i++) {
            mres.diseases[i] = {
              name: diseases_array[i],
              percn: mres.diseases[i],
              percs: (mres.diseases[i] * 100).toFixed(2).toString() + "%",
            };
          }
          for (var i = 0; i < mres.symptoms.length; i++) {
            mres.symptoms[i] = symptoms_array[mres.symptoms[i]];
          }

          mres.diseases.sort(sortFunction);
          // console.log(resA)
          res.render("result", {
            diseases: mres.diseases,
            symptoms: mres.symptoms,
            pdn: diseases_array[maxind],
            pdp: maxperc,
            showProfile: false,
            auth: req.isAuthenticated(),
            doctor: req.isAuthenticated() && req.user.role === "doctor",
            patient: req.isAuthenticated() && req.user.role === "patient",
            notDoctor: !req.isAuthenticated() || req.user.role === "patient",
          });
        }

        }

      });
  } catch (error) {
    res.json({ error: error.message });
  }
});

router.post("/role", ensureRoleNotChosen, async (req, res) => {
  // console.log(req.body.role);
  try {
    var query = { googleId: req.user.googleId };
    var newValues = { $set: { role: req.body.role } };
    console.log(query, newValues);
    let user = await User.updateOne(query, newValues);
    console.log(user);
    console.log(
      `${user.matchedCount} document(s) matched the filter, updated ${user.modifiedCount} document(s)`
    );

    res.redirect("/");
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;