const express = require("express");
const router = express.Router();
const pool = require("../db");

const PAGE_SIZE = 20;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_CATEGORY_LENGTH = 80;

function isValidDate(value) {
    return value && !Number.isNaN(Date.parse(value));
}

function normalizeCategory(value) {
    if (!value) {
        return null;
    }

    const category = String(value).trim();

    if (!category || category.length > MAX_CATEGORY_LENGTH) {
        return null;
    }

    return category;
}

function buildPage(rows) {
    const products = rows.slice(0, PAGE_SIZE);
    const hasNextPage = rows.length > PAGE_SIZE;
    const last = products[products.length - 1];

    return {
        products,
        next_cursor: hasNextPage && last
            ? {
                created_at: last.created_at,
                id: last.id
            }
            : null
    };
}

router.get("/categories", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT category
            FROM products
            WHERE category IS NOT NULL
            ORDER BY category ASC
        `);

        res.json({
            categories: result.rows.map((row) => row.category)
        });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

router.get("/", async (req, res) => {
    try {
        const {
            snapshot,
            cursor_time,
            cursor_id,
            category
        } = req.query;

        let query;
        let params;
        let snapshotTime = snapshot;
        const selectedCategory = normalizeCategory(category);

        if (category && !selectedCategory) {
            return res.status(400).json({ error: "Invalid category" });
        }
        
        if (!snapshot) {
            snapshotTime = new Date().toISOString();

            if (selectedCategory) {
                query = `
                    SELECT *
                    FROM products
                    WHERE category = $1
                      AND created_at <= $2::timestamp
                    ORDER BY created_at DESC, id DESC
                    LIMIT $3
                `;

                params = [selectedCategory, snapshotTime, PAGE_SIZE + 1];
            } else {
                query = `
                    SELECT *
                    FROM products
                    WHERE created_at <= $1::timestamp
                    ORDER BY created_at DESC, id DESC
                    LIMIT $2
                `;

                params = [snapshotTime, PAGE_SIZE + 1];
            }
        } else {
            if (!isValidDate(snapshot)) {
                return res.status(400).json({ error: "Invalid snapshot" });
            }

            if (!isValidDate(cursor_time) || !UUID_REGEX.test(cursor_id || "")) {
                return res.status(400).json({ error: "Invalid cursor" });
            }

            if (selectedCategory) {
                query = `
                    SELECT *
                    FROM products
                    WHERE category = $1
                      AND created_at <= $2::timestamp
                      AND (created_at, id) < ($3::timestamp, $4::uuid)
                    ORDER BY created_at DESC, id DESC
                    LIMIT $5
                `;

                params = [selectedCategory, snapshotTime, cursor_time, cursor_id, PAGE_SIZE + 1];
            } else {
                query = `
                    SELECT *
                    FROM products
                    WHERE created_at <= $1::timestamp
                      AND (created_at, id) < ($2::timestamp, $3::uuid)
                    ORDER BY created_at DESC, id DESC
                    LIMIT $4
                `;

                params = [snapshotTime, cursor_time, cursor_id, PAGE_SIZE + 1];
            }
        }

        const result = await pool.query(query, params);
        const page = buildPage(result.rows);

        res.json({
            snapshot_time: snapshotTime,
            next_cursor: page.next_cursor,
            products: page.products
        });

    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

module.exports = router;
