 const mongoose = require("mongoose");
 
// -------------------------------------------------------------
// WHAT IS A SCHEMA?
// A Schema is a blueprint that defines the structure of a
// document inside a MongoDB collection. It tells Mongoose:
//   - What fields exist
//   - What data type each field holds (String, Number, Date…)
//   - What rules apply (required, unique, trim, lowercase…)
//
// Think of it like a "form template" — every user document
// saved to the database must follow this exact shape.
// -------------------------------------------------------------
const userSchema = new mongoose.Schema(
  {
    // -----------------------------------------------------------
    // FIELD: name
    // Stores the full name of the user.
    //
    // required: true  → MongoDB will reject a document that
    //                   is missing this field entirely.
    // trim: true      → Automatically strips leading/trailing
    //                   whitespace (e.g. "  Ishaan  " → "Ishaan").
    // -----------------------------------------------------------
    name: {
      type: String,
      required: true,
      trim: true,
    },
 
    // -----------------------------------------------------------
    // FIELD: email
    // Stores the user's email address.
    //
    // required: true  → Every user must provide an email.
    //
    // unique: true    → WHY IS EMAIL UNIQUE?
    //                   No two users can share the same email
    //                   address. The email acts as a natural
    //                   identifier for a user account. Making it
    //                   unique prevents duplicate accounts and
    //                   ensures every email maps to exactly one
    //                   user in the system.
    //                   MongoDB enforces this via a unique index.
    //
    // lowercase: true → Converts the email to lowercase before
    //                   saving ("Ishaan@Example.COM" becomes
    //                   "ishaan@example.com"). This prevents
    //                   duplicate entries that differ only in
    //                   letter casing.
    //
    // trim: true      → Strips accidental whitespace before
    //                   saving to the database.
    // -----------------------------------------------------------
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
 
    // -----------------------------------------------------------
    // FIELD: password
    // Stores the user's password.
    //
    // required: true  → A user document cannot be saved without
    //                   a password field present.
    //
    // NOTE: This field stores the password value as provided.
    //       Password hashing is handled separately outside this
    //       model (not part of Day 3 scope).
    // -----------------------------------------------------------
    password: {
      type: String,
      required: true,
    },
  },
 
  // -------------------------------------------------------------
  // SCHEMA OPTIONS: timestamps
  //
  // WHY USE TIMESTAMPS?
  // When { timestamps: true } is enabled, Mongoose automatically
  // adds and manages two special fields on every document:
  //
  //   createdAt → Set once when the document is first created.
  //               Useful for knowing when a user registered.
  //
  //   updatedAt → Automatically updated every time the document
  //               is modified. Useful for auditing changes or
  //               sorting by most recently active users.
  //
  // You never need to set these manually — Mongoose handles them.
  // -------------------------------------------------------------
  {
    timestamps: true,
  }
);
 
// ---------------------------------------------------------------
// WHAT IS A MODEL?
// A Model is a class that Mongoose creates from your Schema.
// It provides the actual interface to interact with the MongoDB
// collection — you use the Model to CREATE, READ, UPDATE, and
// DELETE (CRUD) documents.
//
// mongoose.model("User", userSchema) does two things:
//   1. Registers a model named "User"
//   2. Links it to the MongoDB collection called "users"
//      (Mongoose automatically lowercases and pluralises the name)
//
// Convention: Model name is PascalCase ("User"),
//             the collection name becomes "users" in MongoDB.
// ---------------------------------------------------------------
const User = mongoose.model("User", userSchema);
 
module.exports = User;