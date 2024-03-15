/* This code is free software:
 * you can redistribute it and/or modify it under the terms of a Creative
 * Commons Attribution-NonCommercial 4.0 International License
 * (http://creativecommons.org/licenses/by-nc/4.0/)
 *
 * Copyright (c) 2024 March by Klaasjan Wagenaar, Tristan Bosveld and Richard Kroesen
 */

const SensorTypes = {
    DIG_IN:     { type: 0, precision: 1, signed: false, bytes: 1 },
    DIG_OUT:    { type: 1, precision: 1, signed: false, bytes: 1 },
    ANL_IN:     { type: 2, precision: 100, signed: true, bytes: 2 },
    ANL_OUT:    { type: 3, precision: 100, signed: true, bytes: 2 },
    ILLUM_SENS: { type: 101, precision: 1, signed: false, bytes: 2 },
    PRSNC_SENS: { type: 102, precision: 1, signed: false, bytes: 1 },
    TEMP_SENS:  { type: 103, precision: 10, signed: true, bytes: 2 },
    HUM_SENS:   { type: 104, precision: 10, signed: false, bytes: 1 },
    ACCRM_SENS: { type: 113, precision: 1000, signed: true, bytes: 6 },
    BARO_SENS:  { type: 115, precision: 10, signed: false, bytes: 2 },
    GYRO_SENS:  { type: 134, precision: 100, signed: true, bytes: 6 },
    GPS_LOC:    { type: 136, precision: 10000, signed: true, bytes: 12 }
};

function encodeDownlink(input) {
    return {
        bytes: [],
        fPort: 1,
        warnings: [],
        errors: []
    };
}

/**
 * @brief Decodes downlink data from a byte array based on predefined sensor types.
 * 
 * This function iterates through a given array of bytes, decoding each segment according to the 
 * sensor type and channel specified. It utilizes a nested `decodeValue` function to handle the 
 * conversion of byte segments into their corresponding sensor values, considering the signedness, 
 * precision, and byte length for each sensor type. 
 * 
 * @param input Object with a 'bytes' array of encoded sensor data. Each segment includes a sensor type 
 * identifier, channel number, and data bytes.
 * 
 * @return Object with 'data', 'warnings', and 'errors'. 'Data' maps sensor readings to keys based on sensor 
 * type and channel. 'Warnings' and 'errors' are arrays with respective messages encountered during decoding.
 */
function decodeDownlink(input) {
    let bytes = input.bytes;
    let decoded = {};
    for (let i = 0; i < bytes.length;) {
        let type = bytes[i++];
        let channel = bytes[i++];

        function decodeValue(isSigned, precision, byteLength) {
            let value = 0;
            for (let byteIndex = 0; byteIndex < byteLength; byteIndex++) {
                value = (value << 8) | bytes[i++];
            }
            if (isSigned) {
                const signBitPosition = byteLength * 8 - 1;
                // Check if the sign bit is set
                if (value & (1 << signBitPosition)) {
                    // Perform sign extension
                    const mask = -1 ^ ((1 << signBitPosition) - 1);
                    value = value | mask;
                }
            }
            return value / precision;
        }

        switch (type) {
            case SensorTypes.DIG_IN.type:
                decoded['digital_' + channel] = decodeValue(SensorTypes.DIG_IN.signed, 
                    SensorTypes.DIG_IN.precision, 
                    SensorTypes.DIG_IN.bytes);
                break;
            case SensorTypes.DIG_OUT.type:
                decoded['digital_' + channel] = decodeValue(SensorTypes.DIG_OUT.signed, 
                    SensorTypes.DIG_OUT.precision, 
                    SensorTypes.DIG_OUT.bytes);
                break;
            case SensorTypes.ANL_IN.type:
                decoded['analog_' + channel] = decodeValue(SensorTypes.ANL_IN.signed, 
                    SensorTypes.ANL_IN.precision, 
                    SensorTypes.ANL_IN.bytes);
                break;
            case SensorTypes.ANL_OUT.type:
                decoded['analog_' + channel] = decodeValue(SensorTypes.ANL_OUT.signed, 
                    SensorTypes.ANL_OUT.precision, 
                    SensorTypes.ANL_OUT.bytes);
                break;
            case SensorTypes.ILLUM_SENS.type:
                decoded['illumination_' + channel] = decodeValue(SensorTypes.ILLUM_SENS.signed, 
                    SensorTypes.ILLUM_SENS.precision, 
                    SensorTypes.ILLUM_SENS.bytes);
                break;
            case SensorTypes.PRSNC_SENS.type:
                decoded['presence_' + channel] = decodeValue(SensorTypes.PRSNC_SENS.signed, 
                    SensorTypes.PRSNC_SENS.precision, 
                    SensorTypes.PRSNC_SENS.bytes);
                break;
            case SensorTypes.TEMP_SENS.type:
                decoded['temperature_' + channel] = decodeValue(SensorTypes.TEMP_SENS.signed, 
                    SensorTypes.TEMP_SENS.precision, 
                    SensorTypes.TEMP_SENS.bytes);
                break;
            case SensorTypes.HUM_SENS.type:
                decoded['humidity_' + channel] = decodeValue(SensorTypes.HUM_SENS.signed, 
                    SensorTypes.HUM_SENS.precision, 
                    SensorTypes.HUM_SENS.bytes);
                break;
            case SensorTypes.ACCRM_SENS.type:
                decoded['accelerometer_' + channel] = {
                    x: decodeValue(SensorTypes.ACCRM_SENS.signed, SensorTypes.ACCRM_SENS.precision, SensorTypes.ACCRM_SENS.bytes/3),
                    y: decodeValue(SensorTypes.ACCRM_SENS.signed, SensorTypes.ACCRM_SENS.precision, SensorTypes.ACCRM_SENS.bytes/3),
                    z: decodeValue(SensorTypes.ACCRM_SENS.signed, SensorTypes.ACCRM_SENS.precision, SensorTypes.ACCRM_SENS.bytes/3)
                };
                break;
            case SensorTypes.BARO_SENS.type:
                decoded['barometer_' + channel] = decodeValue(SensorTypes.BARO_SENS.signed, 
                    SensorTypes.BARO_SENS.precision, 
                    SensorTypes.BARO_SENS.bytes);
                break;
            case SensorTypes.GYRO_SENS.type:
                decoded['gyroscope_' + channel] = {
                    x: decodeValue(SensorTypes.GYRO_SENS.signed, SensorTypes.GYRO_SENS.precision, SensorTypes.GYRO_SENS.bytes/3),
                    y: decodeValue(SensorTypes.GYRO_SENS.signed, SensorTypes.GYRO_SENS.precision, SensorTypes.GYRO_SENS.bytes/3),
                    z: decodeValue(SensorTypes.GYRO_SENS.signed, SensorTypes.GYRO_SENS.precision, SensorTypes.GYRO_SENS.bytes/3)
                };
                break;
            case SensorTypes.GPS_LOC.type:
                decoded['gps_' + channel] = {
                    x: decodeValue(SensorTypes.GPS_LOC.signed, SensorTypes.GPS_LOC.precision, SensorTypes.GPS_LOC.bytes/3),
                    y: decodeValue(SensorTypes.GPS_LOC.signed, SensorTypes.GPS_LOC.precision, SensorTypes.GPS_LOC.bytes/3),
                    z: decodeValue(SensorTypes.GPS_LOC.signed, 
                        (SensorTypes.GPS_LOC.precision /100), SensorTypes.GPS_LOC.bytes/3)
                };
                break;
            default: // Unknown data type
                decoded.errors = ["Unknown type: " + type];
                i = bytes.length; // Skip the rest of the payload
                break;
        }
    }
    return {
        data: decoded,
        warnings: [],
        errors: []
    };
}

module.exports = { SensorTypes, encodeDownlink, decodeDownlink };