#!/usr/bin/env python3
"""
Test script for the Asteroid Impact Calculator
This script tests the calculation functions with known values.
"""

import sys
import os

# Add the Impact Radius directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'Impact Radius'))

from impact import calculate_impact_radius

def test_calculations():
    """Test the impact calculator with known values."""
    print("Testing Asteroid Impact Calculator")
    print("=" * 50)
    
    # Test case 1: Small iron asteroid
    print("Test 1: Small Iron Asteroid")
    print("-" * 30)
    result1 = calculate_impact_radius(7800, 17000, 50)
    print(f"Input: density=7800 kg/m³, speed=17000 m/s, diameter=50m")
    print(f"Kinetic Energy: {result1['kinetic_energy_joules']:.2e} J")
    print(f"Severe Radius: {result1['severe_radius_km']:.2f} km")
    print(f"Moderate Radius: {result1['moderate_radius_km']:.2f} km")
    print(f"Light Radius: {result1['light_radius_km']:.2f} km")
    print(f"Classification: {result1['damage_classification']}")
    print()
    
    # Test case 2: Large stony asteroid
    print("Test 2: Large Stony Asteroid")
    print("-" * 30)
    result2 = calculate_impact_radius(3000, 20000, 200)
    print(f"Input: density=3000 kg/m³, speed=20000 m/s, diameter=200m")
    print(f"Kinetic Energy: {result2['kinetic_energy_joules']:.2e} J")
    print(f"Severe Radius: {result2['severe_radius_km']:.2f} km")
    print(f"Moderate Radius: {result2['moderate_radius_km']:.2f} km")
    print(f"Light Radius: {result2['light_radius_km']:.2f} km")
    print(f"Classification: {result2['damage_classification']}")
    print()
    
    # Test case 3: Very small asteroid
    print("Test 3: Very Small Asteroid")
    print("-" * 30)
    result3 = calculate_impact_radius(2000, 15000, 10)
    print(f"Input: density=2000 kg/m³, speed=15000 m/s, diameter=10m")
    print(f"Kinetic Energy: {result3['kinetic_energy_joules']:.2e} J")
    print(f"Severe Radius: {result3['severe_radius_km']:.2f} km")
    print(f"Moderate Radius: {result3['moderate_radius_km']:.2f} km")
    print(f"Light Radius: {result3['light_radius_km']:.2f} km")
    print(f"Classification: {result3['damage_classification']}")
    print()
    
    # Test error handling
    print("Test 4: Error Handling")
    print("-" * 30)
    try:
        calculate_impact_radius(-1000, 17000, 50)  # Negative density
        print("ERROR: Should have caught negative density")
    except ValueError as e:
        print(f"SUCCESS: Correctly caught error: {e}")
    
    try:
        calculate_impact_radius(7800, "invalid", 50)  # Invalid speed
        print("ERROR: Should have caught invalid speed")
    except ValueError as e:
        print(f"SUCCESS: Correctly caught error: {e}")
    
    print()
    print("All tests completed!")

if __name__ == "__main__":
    test_calculations()
