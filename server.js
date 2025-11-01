"use strict";
const express = require("express");
const app = express();

const multer = require("multer");
app.use(multer().none());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));


require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

//http://localhost:3000/jokebook/categories
app.get("/jokebook/categories", async function (req, res) {
    const queryText = "SELECT DISTINCT category FROM jokes";
    try {
        const result = await pool.query(queryText);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Server error");
        return;
    }
});

///http://localhost:3000/jokebook/category/:category
//http://localhost:3000/jokebook/category/funnyJoke?limit=2
//http://localhost:3000/jokebook/category/lameJoke?limit=2
app.get("/jokebook/category/:category", async function (req, res) {
    let category = req.params.category;
    let limit = req.query.limit;
    if (category) {
        let queryText = "SELECT setup, delivery FROM jokes WHERE category = $1";
        let values = [category];

        if (limit) {
            queryText += " LIMIT $2";   // add LIMIT only if user passed it
            values.push(limit);
        }
        try {
            const result = await pool.query(queryText, values);
            // check if no jokes found for the category
            if (result.rows.length === 0) {

                return res.send("Category:  " + category + " not available");
            }
            res.json(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).send("Server error");
            return;
        }
    }
    else {
        res.status(400).send("Missing required id param!");
    }
});

//http://localhost:3000/jokebook/random
app.get("/jokebook/random", async function (req, res) {
    const queryText = "SELECT category, setup, delivery FROM jokes ORDER BY RANDOM() LIMIT 1";
    try {
        const result = await pool.query(queryText);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Server error");
        return;
    }
});

//http://localhost:3000/jokebook/joke/add
app.post("/jokebook/joke/add", async function (req, res) {
    let category = req.body.category;
    let setup = req.body.setup;
    let delivery = req.body.delivery;

    if (category && setup && delivery) {
        let queryText = "INSERT INTO jokes (category, setup, delivery) VALUES ($1, $2, $3) RETURNING *";
        let values = [category, setup, delivery];
        try {
            const result = await pool.query(queryText, values);
            res.json(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).send("Server error");
            return;
        }
    }
    else {
        res.status(400).send("Missing required param!");

    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("Server listening on port: " + PORT + "!");
});