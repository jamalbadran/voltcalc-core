"""
VoltCalc Core - Open Source Electrical Engineering Calculation Engine
Designed for vocational students, engineers, and electrical technicians.
"""

import math


class ElectricalCalculator:
    # Resistivity in ohm-mm²/m at 20°C
    RESISTIVITY = {
        "copper": 0.0175,
        "aluminum": 0.0282
    }

    # Standard metric conductor cross-sections (mm²)
    STANDARD_CABLE_SIZES = [1.5, 2.5, 4.0, 6.0, 10.0, 16.0, 25.0, 35.0, 50.0, 70.0, 95.0, 120.0, 150.0, 185.0, 240.0]

    @staticmethod
    def calculate_voltage_drop(voltage: float, current: float, length_m: float, 
                               cable_size_mm2: float, system_type: str = "single_phase", 
                               conductor: str = "copper") -> dict:
        """
        Calculates voltage drop in volts and percentage.
        system_type: 'single_phase' (2-wire) or 'three_phase' (3/4-wire)
        """
        rho = ElectricalCalculator.RESISTIVITY.get(conductor.lower(), 0.0175)
        
        # Line resistance R = rho * (L / A)
        r_line = rho * (length_m / cable_size_mm2)

        if system_type == "single_phase":
            # 2 * I * R
            v_drop = 2 * current * r_line
        elif system_type == "three_phase":
            # sqrt(3) * I * R
            v_drop = math.sqrt(3) * current * r_line
        else:
            raise ValueError("system_type must be 'single_phase' or 'three_phase'")

        drop_percentage = (v_drop / voltage) * 100

        return {
            "voltage_drop_volts": round(v_drop, 2),
            "drop_percentage": round(drop_percentage, 2),
            "is_acceptable_standard": drop_percentage <= 3.0,  # Standard 3% limit for general loads
            "system_type": system_type,
            "conductor_material": conductor
        }

    @staticmethod
    def recommend_cable_size(voltage: float, current: float, length_m: float, 
                             max_drop_percent: float = 3.0, system_type: str = "single_phase", 
                             conductor: str = "copper") -> dict:
        """
        Determines the minimum required standard cable size based on maximum allowed voltage drop.
        """
        for size in ElectricalCalculator.STANDARD_CABLE_SIZES:
            result = ElectricalCalculator.calculate_voltage_drop(
                voltage, current, length_m, size, system_type, conductor
            )
            if result["drop_percentage"] <= max_drop_percent:
                return {
                    "recommended_size_mm2": size,
                    "actual_voltage_drop_v": result["voltage_drop_volts"],
                    "actual_drop_percentage": result["drop_percentage"],
                    "max_allowed_drop_percentage": max_drop_percent
                }

        return {
            "recommended_size_mm2": None,
            "error": "Exceeds standard residential/commercial sizes. Requires parallel conductors or custom sizing."
        }

    @staticmethod
    def calculate_power_factor_correction(active_power_kw: float, current_pf: float, target_pf: float = 0.95) -> dict:
        """
        Calculates required capacitor bank rating (kVAR) to improve power factor.
        """
        if current_pf >= target_pf:
            return {"required_kvar": 0.0, "message": "Power factor is already at or above target."}

        theta1 = math.acos(current_pf)
        theta2 = math.acos(target_pf)

        # Q_c = P * (tan(theta1) - tan(theta2))
        kvar_required = active_power_kw * (math.tan(theta1) - math.tan(theta2))

        return {
            "active_power_kw": active_power_kw,
            "initial_pf": current_pf,
            "target_pf": target_pf,
            "required_kvar": round(kvar_required, 2)
        }


if __name__ == "__main__":
    calc = ElectricalCalculator()
    print("=== VoltCalc Core Engine Demonstration ===")
    
    # 1. Voltage Drop Simulation
    v_drop = calc.calculate_voltage_drop(voltage=230, current=25, length_m=45, cable_size_mm2=4.0, system_type="single_phase")
    print(f"\n[Voltage Drop Test] 230V, 25A, 45m (4mm² Copper):")
    print(f"Drop: {v_drop['voltage_drop_volts']}V ({v_drop['drop_percentage']}%) | Compliant: {v_drop['is_acceptable_standard']}")

    # 2. Sizing Recommendation
    rec = calc.recommend_cable_size(voltage=400, current=80, length_m=120, max_drop_percent=2.5, system_type="three_phase")
    print(f"\n[Cable Sizing Test] 400V 3-Phase, 80A, 120m:")
    print(f"Recommended Size: {rec['recommended_size_mm2']} mm² (Drop: {rec['actual_drop_percentage']}%)")

    # 3. Power Factor Correction
    pfc = calc.calculate_power_factor_correction(active_power_kw=50, current_pf=0.72, target_pf=0.95)
    print(f"\n[PFC Calculation] 50kW Load (PF 0.72 -> 0.95):")
    print(f"Required Capacitor Rating: {pfc['required_kvar']} kVAR\n")