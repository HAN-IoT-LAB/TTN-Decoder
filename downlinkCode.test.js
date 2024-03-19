/* This code is free software:
 * you can redistribute it and/or modify it under the terms of a Creative
 * Commons Attribution-NonCommercial 4.0 International License
 * (http://creativecommons.org/licenses/by-nc/4.0/)
 *
 * Copyright (c) 2024 March by Klaasjan Wagenaar, Tristan Bosveld and Richard Kroesen
 */

const { decodeUplink, SensorTypes } = require('./decoder_cayenneLPP_extreme');

describe('decodeDownlink', () => {

    /* TEST #1 for DIG_IN */
    it('correctly decodes DIG_IN sensor data', () => {
        const input = {
            bytes: [
                SensorTypes.DIG_IN.type,
                5,  // Channel
                0   // Data (digital low)
            ]
        };
        const expected = {
            data: {
                digital_5: 0
            },
            warnings: [],
            errors: []
        };

        const result = decodeUplink(input);

        expect(result).toEqual(expected);
    });

    /* TEST #2 for DIG_OUT */
    it('correctly decodes DIG_OUT sensor data', () => {
        const input = {
            bytes: [
                SensorTypes.DIG_OUT.type, // Assuming SensorTypes is structured as shown previously
                2,  // Channel
                1   // Data (digital high)
            ]
        };
        const expected = {
            data: {
                digital_2: 1
            },
            warnings: [],
            errors: []
        };

        const result = decodeUplink(input);

        expect(result).toEqual(expected);
    });

    /* TEST #3  */
    it('correctly decodes ANL_IN sensor data', () => {
        const input = {
            bytes: [
                SensorTypes.ANL_IN.type, 
                1,  // Channel
                /* Decimal value of 2,68 represented: */
                12,  // LSB
                1    // MSB
            ]
        };
        const expected = {
            data: {
                analog_1: 2.68
            },
            warnings: [],
            errors: []
        };

        const result = decodeUplink(input);

        expect(result).toEqual(expected);
    });

    /* TEST #4 Negative Values */
    it('correctly decodes ANL_IN sensor negative data', () => {
        const input = {
            bytes: [
                SensorTypes.ANL_IN.type, 
                1,  // Channel
                /* Decimal value of -12 represented as two's complement: */
                244,
                255 
            ]
        };
        const expected = {
            data: {
                analog_1: -0.12
            },
            warnings: [],
            errors: []
        };

        const result = decodeUplink(input);

        expect(result).toEqual(expected);
    });

    /* Test #5 for ILLUM_SENS sensor data */
    it('correctly decodes ILLUM_SENS sensor data', () => {
        const input = {
            bytes: [
                SensorTypes.ILLUM_SENS.type, 
                1,  // Channel
                100, // LSB
                0,  // MSB
            ]
        };
        const expected = {
            data: {
                illumination_1: 100
            },
            warnings: [],
            errors: []
        };

        const result = decodeUplink(input);

        expect(result).toEqual(expected);
    });
    
    /* Test #6 for PRSNC_SENS sensor data */
    it('correctly decodes PRSNC_SENS sensor data', () => {
        const input = {
            bytes: [
                SensorTypes.PRSNC_SENS.type, 
                2,  // Channel
                1   // Presence detected
            ]
        };
        const expected = {
            data: {
                presence_2: 1
            },
            warnings: [],
            errors: []
        };

        const result = decodeUplink(input);

        expect(result).toEqual(expected);
    });

    /* Test #7 for TEMP_SENS sensor data (negative value) */
    it('correctly decodes TEMP_SENS sensor negative data', () => {
        const input = {
            bytes: [
                SensorTypes.TEMP_SENS.type, 
                3,       // Channel
                244,      // LSB (244), represents -12 in 2's complement with 0.1°C precision
                255,        // MSB (-1 if interpreted as signed)
            ]
        };
        const expectedValue = -1.2;
        const expected = {
            data: {
                temperature_3: expectedValue
            },
            warnings: [],
            errors: []
        };

        const result = decodeUplink(input);

        expect(result).toEqual(expected);
    });

    /* Test #8 for HUM_SENS sensor data */
    it('correctly decodes HUM_SENS sensor data', () => {
        const input = {
            bytes: [
                SensorTypes.HUM_SENS.type,
                1,  // Channel
                50 
            ]
        };
        const expected = {
            data: {
                humidity_1: 5.0
            },
            warnings: [],
            errors: []
        };

        const result = decodeUplink(input);

        expect(result).toEqual(expected);
    });

    /* Test #9 for ACCRM_SENS sensor data */
    it('correctly decodes ACCRM_SENS sensor data', () => {
        const input = {
            bytes: [
                SensorTypes.ACCRM_SENS.type,
                1,  // Channel
                // Assuming 2 bytes per axis, with a total of 6 bytes for x, y, z
                1, 0, // X-axis
                2, 0, // Y-axis
                3, 0  // Z-axis
            ]
        };
        const expected = {
            data: {
                accelerometer_1: {
                    x: 1 / SensorTypes.ACCRM_SENS.precision,
                    y: 2 / SensorTypes.ACCRM_SENS.precision,
                    z: 3 / SensorTypes.ACCRM_SENS.precision
                }
            },
            warnings: [],
            errors: []
        };

        const result = decodeUplink(input);

        expect(result).toEqual(expected);
    });

    /* Test #10 for BARO_SENS sensor data */
    it('correctly decodes BARO_SENS sensor data', () => {
        const input = {
            bytes: [
                SensorTypes.BARO_SENS.type,
                1,   // Channel
                144,  // LSB, example value
                1,   // MSB
            ]
        };
        const expected = {
            data: {
                barometer_1: ((1 << 8) + 144) / SensorTypes.BARO_SENS.precision // Assuming 0.1 hPa precision
            },
            warnings: [],
            errors: []
        };

        const result = decodeUplink(input);

        expect(result).toEqual(expected);
    });

    /* Test #11 for GYRO_SENS sensor data */
    it('correctly decodes GYRO_SENS sensor data', () => {
        const input = {
            bytes: [
                SensorTypes.GYRO_SENS.type,
                1,  // Channel
                // Example gyro data for x, y, z axes
                100, 0, // X-axis
                150, 0, // Y-axis
                200, 0  // Z-axis
            ]
        };
        const expected = {
            data: {
                gyroscope_1: {
                    x: 100 / SensorTypes.GYRO_SENS.precision,
                    y: 150 / SensorTypes.GYRO_SENS.precision,
                    z: 200 / SensorTypes.GYRO_SENS.precision
                }
            },
            warnings: [],
            errors: []
        };

        const result = decodeUplink(input);

        expect(result).toEqual(expected);
    });

    /* Test #12 for GPS_LOC sensor data */
    it('correctly decodes GPS_LOC sensor data', () => {
        
        function int32ToBytes(value) {
            return [
                value & 0xFF,
                (value >> 8) & 0xFF,
                (value >> 16) & 0xFF,
                (value >> 24) & 0xFF
            ];
        }

        const LAT_LON_PRECISION = 10000;
        const ALTITUDE_PRECISION = 100; 
        const input = {
            bytes: [
                SensorTypes.GPS_LOC.type,
                6,
                ...int32ToBytes(515074),  // Latitude (51.5074 scaled by 0.0001)
                ...int32ToBytes(-1278),   // Longitude (-0.1278 scaled by 0.0001)
                ...int32ToBytes(3000)     // Altitude (30.0 scaled by 0.01)
            ]
        };

        const expected = {
            data: {
                gps_6: { // Assuming channel 6 for GPS
                    x: 515074/LAT_LON_PRECISION,  // Latitude
                    y: -1279/LAT_LON_PRECISION,  // Longitude
                    z: 3000/ALTITUDE_PRECISION    // Altitude
                }
            },
            warnings: [],
            errors: []
        };

        const result = decodeUplink(input);

        expect(result).toEqual(expected);
    });
});
