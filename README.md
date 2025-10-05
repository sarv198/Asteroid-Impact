# 🌍 Asteroid Impact Calculator

An interactive asteroid impact radius calculator with both Python command-line and React web interfaces. Calculate the damage radius and visualize impact zones on Earth.

## Features

- **Impact Radius Calculation**: Calculate severe, moderate, and light damage radii
- **Kinetic Energy Computation**: Determine the kinetic energy of the impact
- **Damage Classification**: Automatic classification based on impact severity
- **Interactive Map**: Visualize impact zones on a world map (React version)
- **Multiple Interfaces**: Both command-line (Python) and web (React) versions

## Project Structure

```
Asteroid-Impact/
├── Impact Radius/
│   ├── impact.py          # Core calculation logic (Python)
│   ├── impact.js          # JavaScript calculation logic
│   └── impact.jsx         # React component (legacy)
├── src/
│   ├── App.jsx            # Main React app component
│   ├── App.css            # App styling
│   ├── index.js           # React entry point
│   ├── index.css          # Global styles
│   ├── ImpactCalculator.js # JavaScript calculation module
│   └── ImpactSimulator.jsx # Interactive map component
├── public/
│   └── index.html         # HTML template
├── main.py                # Python CLI entry point
├── package.json           # Node.js dependencies
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Installation & Usage

### Python Version (Command Line)

1. **Install Python** (3.7 or higher)

2. **Run the calculator**:
   ```bash
   python main.py
   ```

3. **Follow the prompts** to enter asteroid parameters:
   - Density (kg/m³) - default: 7800 (iron)
   - Speed (m/s) - default: 17000
   - Diameter (meters) - default: 50

### React Version (Web Interface)

1. **Install Node.js** (14 or higher)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** to `http://localhost:3000`

5. **Use the interface**:
   - Adjust asteroid parameters in the left panel
   - Click anywhere on the map to set impact location
   - View damage radii as colored circles on the map

## Calculation Details

The calculator uses the following formula for kinetic energy:
```
E = (π / 12) × density × diameter³ × speed²
```

Impact radii are calculated using damage coefficients:
- **Severe Damage**: R = 1.8×10⁻⁴ × E^(1/3)
- **Moderate Damage**: R = 4.0×10⁻⁴ × E^(1/3)  
- **Light Damage**: R = 8.0×10⁻⁴ × E^(1/3)

### Damage Classification
- **Severe**: Severe damage radius > 5 km
- **Moderate**: Moderate damage radius > 2 km
- **Light**: All other cases

## Example Output

```
============================================================
ASTEROID IMPACT ANALYSIS
============================================================
Input Parameters:
  Density:    7,800 kg/m³
  Speed:      17,000 m/s
  Diameter:   50 m

Calculated Results:
  Kinetic Energy: 1.47e+15 Joules

Impact Radii:
  Severe Damage:   2.34 km
  Moderate Damage: 5.20 km
  Light Damage:    10.40 km

Overall Classification: Moderate
============================================================
```

## Dependencies

### Python
- No external dependencies required (uses only built-in `math` module)

### React
- `react` (^18.2.0)
- `react-dom` (^18.2.0)
- `react-scripts` (5.0.1)
- `react-leaflet` (^4.2.1)
- `leaflet` (^1.9.4)

## Technical Notes

- The React version includes a Leaflet map for visualization
- Map markers and circles are automatically positioned based on impact location
- The calculator handles input validation and error cases
- Both versions use the same core calculation algorithms

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the calculator.

## License

MIT License - feel free to use this code for educational or research purposes.
