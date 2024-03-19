# TTN-Decoder
This repository contains a JavaScript endoded memory optimized and refactored CayenneLPP library. The decoding happens on TheThingsNetwork and this is the target platform for which the decoder is created. 

The objective of the decoder is to enable suitable webbased applications, user-interfaces or dashboards for generic IoT applications. Whether the user wants to create a data logger, telemetry systems or device remote-monitoring.

## 1 Features
- *Wide Range of Sensor Support*: Decodes data from various sensors such as digital inputs/outputs, analog inputs, illumination, presence, temperature, humidity, accelerometers, barometers, gyroscopes, and GPS location.
- *High Precision (configurable)*: Utilizes precision scaling for accurate data interpretation, particularly critical for GPS coordinates and altitude measurements.
- *Endian-Aware*: Ensures correct handling of byte order, vital for interpreting multi-byte sensor data correctly.
- *Unit Tested*: the quality of the decoder is verified by unit tests created with the [Jest Framework](https://jestjs.io/).

## 2 Decoder Abstract Design
Here you can find the process' design and description without all the details.
### 2.1 Payload Structure
The encoder and decoder have a consistent payload structure. The DataType is the key of this process, which creates a global reference ot the to be expected datasize (in bytes), precision (in decimals), signedness and unit representation.  
```
[Sensor Type] [Channel] [Data Bytes...]
``` 
### 2.2 Sensor Data Types
The sensor data format has a direct (copy) relationship with the encoder. Data Types conform to the IPSO Alliance Smart Objects Guidelines, which identifies each data type with an “Object ID”. However, as shown below, a conversion is made to fit the Object ID into a single byte.
```
LPP_DATA_TYPE = IPSO_OBJECT_ID - 3200
```

| Sensor Type | Type ID | Precision | Signed | Byte Length |
|-------------|---------|-----------|--------|-------------|
| DIG_IN      | 0       | 1         | No     | 1           |
| DIG_OUT     | 1       | 1         | No     | 1           |
| ANL_IN      | 2       | 100       | Yes    | 2           |
| ANL_OUT     | 3       | 100       | Yes    | 2           |
| ILLUM_SENS  | 101     | 1         | No     | 2           |
| PRSNC_SENS  | 102     | 1         | No     | 1           |
| TEMP_SENS   | 103     | 10        | Yes    | 2           |
| HUM_SENS    | 104     | 10        | No     | 2           |
| ACCRM_SENS  | 113     | 1000      | Yes    | 6           |
| BARO_SENS   | 115     | 10        | No     | 2           |
| GYRO_SENS   | 134     | 100       | Yes    | 6           |
| GPS_LOC     | 136     | 10000     | Yes    | 12          |

### 2.3 Example - Byte String Overview
Incoming bytes series: 
```plaintext
6701030102056402
```

- **Byte(s):** `0x67, 0x01`  
  **Decimal:** `103, 1`  
  **Description:** TEMP_SENS sensor type with channel 1. 

- **Byte(s):** `0x03, 0x01`  
  **Decimal:** `259` In little endian, so 0x03 + 0x01. 
  **Result:** `25.9f` Celsius, Resolution adjusted value. 
  **Description:** Temperature reading (scaled-up with resolution factor).

- **Byte(s):** `0x02, 0x05`    
  **Decimal:** `612`  
**Result:** `6.12f` Decimal, Resolution adjusted value. 
  **Description:** Analog sensor type with channel 5.
  

### 2.4 Decoded Value
In the decoded section of the Event details on TTN we get the following added: 
```JSON
{
  "analog_5": 6.12,
  "temperature_1": 25.9
}
```

## 3 Getting Started
In general this decoder is used on TheThingsNetwork, however it could also be run natively for development or testing.
### 3.1 Prerequisites
- **NodeJS**: for running it native on your own device. 
- **Jest**: for unit testing ensure you installed Jest through your packages manager like npm. 
- **TheThingsNetwork application**: for deployment or target device testing

## 4 Testing
This section provides a summary of the test cases for the Decoder package. Each test verifies the correct decoding of sensor data based on the input provided.

### 4.1 Test Overview
| Test ID | Sensor Type  | Scenario                             | Expected Outcome                                  |
|---------|--------------|--------------------------------------|---------------------------------------------------|
| #1      | DIG_IN       | Decoding digital low sensor data     | `digital_5: 0`                                    |
| #2      | DIG_OUT      | Decoding digital high sensor data    | `digital_2: 1`                                    |
| #3      | ANL_IN       | Decoding analog input sensor data    | `analog_1: 2.68`                                  |
| #4      | ANL_IN       | Decoding negative analog input data  | `analog_1: -0.12`                                 |
| #5      | ILLUM_SENS   | Decoding illumination sensor data    | `illumination_1: 100`                             |
| #6      | PRSNC_SENS   | Decoding presence sensor data        | `presence_2: 1`                                   |
| #7      | TEMP_SENS    | Decoding negative temperature data   | `temperature_3: -1.2`                             |
| #8      | HUM_SENS     | Decoding humidity sensor data        | `humidity_1: 5.0`                                 |
| #9      | ACCRM_SENS   | Decoding accelerometer sensor data   | `accelerometer_1: {x, y, z}` based on precision   |
| #10     | BARO_SENS    | Decoding barometer sensor data       | `barometer_1` value based on 0.1 hPa precision    |
| #11     | GYRO_SENS    | Decoding gyroscope sensor data       | `gyroscope_1: {x, y, z}` based on precision       |
| #12     | GPS_LOC      | Decoding GPS location sensor data    | `gps_6: {latitude, longitude, altitude}` based on precision |

Each test case inputs a byte array representing the encoded sensor data and checks if the `decodeUplink` function correctly decodes this data into the expected format and values. Precision scaling factors are applied where necessary to ensure accurate representation of sensor readings.

### 4.2 Running Unit Test
If Jest package is installed the test can be run by performin the following command in the terminal: 
```bash
npm test
```

## 4 License
The TheThingsNetwork decoder is free: You can redistribute it and/or modify it under the terms of a Creative Commons Attribution-NonCommercial 4.0 International License (http://creativecommons.org/licenses/by-nc/4.0/) by Richard Kroesen, Klaasjan Wagenaar and Tristan Bosveld.

<a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">Creative Commons Attribution-NonCommercial 4.0 International License</a>.