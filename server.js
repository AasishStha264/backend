const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files first
app.use(express.static('public')); // Moved before routes

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'buildroads',
  password: '123',
  port: 5432
});

// Default route
app.get('/', (req, res) => {
  res.send('✅ GeoAnalyzer API is running.<br>Available routes:<br>/api/roads<br>/api/buildings<br>/api/hospitaa');
});

// Fetch all roads as GeoJSON
app.get('/api/roads', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, ST_AsGeoJSON(geom)::jsonb AS geometry
      FROM public.roads
    `);
    const geojson = {
      type: 'FeatureCollection',
      features: result.rows.map(row => ({
        type: 'Feature',
        geometry: row.geometry,
        properties: { id: row.id }
      }))
    };
    res.json(geojson);
  } catch (err) {
    console.error('❌ Error fetching roads:', err);
    res.status(500).send('Error fetching roads');
  }
});

// Fetch all buildings as GeoJSON
app.get('/api/buildings', async (req, res) => {
  console.log('✅ Accessing /api/buildings endpoint');
  try {
    const result = await pool.query(`
      SELECT id, ST_AsGeoJSON(geom)::jsonb AS geometry
      FROM public.buildings
    `);
    const geojson = {
      type: 'FeatureCollection',
      features: result.rows.map(row => ({
        type: 'Feature',
        geometry: row.geometry,
        properties: { id: row.id }
      }))
    };
    res.json(geojson);
  } catch (err) {
    console.error('❌ Error fetching buildings:', err);
    res.status(500).send('Error fetching buildings');
  }
});

// Fetch all hospitals as GeoJSON
app.get('/api/hospitaa', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, ST_AsGeoJSON(geometry)::jsonb AS geometry, name, type
      FROM public.hospitaa
      WHERE geometry IS NOT NULL
      LIMIT 100
    `);
    const geojson = {
      type: 'FeatureCollection',
      features: result.rows.map(row => ({
        type: 'Feature',
        geometry: row.geometry,
        properties: {
          id: row.id,
          name: row.name,
          type: row.type
        }
      }))
    };
    res.json(geojson);
  } catch (err) {
    console.error('❌ Error fetching hospitals:', err.message);
    res.status(500).send('Error fetching hospitals');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});