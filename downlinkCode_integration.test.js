/* This code is free software:
 * you can redistribute it and/or modify it under the terms of a Creative
 * Commons Attribution-NonCommercial 4.0 International License
 * (http://creativecommons.org/licenses/by-nc/4.0/)
 *
 * Copyright (c) 2024 March by Klaasjan Wagenaar, Tristan Bosveld and Richard Kroesen
 */

const { decodeUplink, SensorTypes } = require('./decoder_cayenneLPP_extreme');

describe('Decode Downlink with Multiple Sensor Types', () => {
    it('correctly decodes a mix of sensor types', () => {
        function int32ToBytes(value) {
            return [
                value & 0xFF,
                (value >> 8) & 0xFF,
                (value >> 16) & 0xFF,
                (value >> 24) & 0xFF
            ];
        }

        const input = {
            fPort: 1,
            bytes: [
                SensorTypes.DIG_IN.type, 1, 1, // DIG_IN, channel 1, value 1 (digital input ON)
                SensorTypes.TEMP_SENS.type, 2, 0x2C, 0x01, // TEMP_SENS, channel 2, value 300 (30.0°C after division)
                SensorTypes.GPS_LOC.type, 3,
                ...int32ToBytes(515074), // Latitude 51.5074 (scaled)
                ...int32ToBytes(-1278), // Longitude -0.1278 (scaled)
                ...int32ToBytes(3000), // Altitude 30.0 (scaled)
            ]
        };

        const expected = {
            decoder_version: 1,
            data: {
                digital_1: 1, // Digital input ON
                temperature_2: 30.0, // 30.0°C
                gps_3: {
                    x: 51.5074, // Latitude
                    y: -0.1279, // Longitude
                    z: 30.0     // Altitude
                }
            },
            warnings: [],
            errors: []
        };

        const result = decodeUplink(input);

        expect(result).toEqual(expected);
    });

    it('reports errors for unrecognized sensor types', () => {
        function int32ToBytes(value) {
            return [
                value & 0xFF,
                (value >> 8) & 0xFF,
                (value >> 16) & 0xFF,
                (value >> 24) & 0xFF
            ];
        }
    
        const input = {
            fPort: 1,
            bytes: [
                SensorTypes.DIG_IN.type, 1, 1, // DIG_IN, channel 1, value 1 (digital input ON)
                SensorTypes.TEMP_SENS.type, 2, 0x2C,0x01, // TEMP_SENS, channel 2, value 300 (30.0°C after division)
                0xC8, 4, 0x01, // Undefined sensor type with random data
                SensorTypes.GPS_LOC.type, 3,
                ...int32ToBytes(515074), 
                ...int32ToBytes(-1278),           // Longitude -0.1278 (scaled)
                ...int32ToBytes(3000)             // Altitude 30.0 (scaled)
            ]
        };
    
        // Adjusting expectations to include errors
        const expected = {
            decoder_version: 1,
            data: {
                "digital_1": 1,
                errors: ["Unknown type: 200"],
                "temperature_2": 30,
            },
            warnings: [],
            errors: []
        };
    
        const result = decodeUplink(input);
    
        expect(result).toEqual(expected);
    });

});
