const TYPE = {
  DIG_IN: 0,
  DIG_OUT: 1,
  ANL_IN: 2,
  ANL_OUT: 3,
  ILLUM_SENS: 101,
  PRSNC_SENS: 102,
  TEMP_SENS: 103,
  HUM_SENS: 104,
  ACCRM_SENS: 113,
  BARO_SENS: 115,
  GYRO_SENS: 134,
  GPS_LOC: 136
};

function encodeDownlink(input) {
  return {
    bytes: [],
    fPort: 1,
    warnings: [],
    errors: []
  };
}

function decodeDownlink(input) {
  var i = 0;
  while (i < bytes.length) {
    var d_channel   = bytes[i++];
    var d_type = bytes[i++];
    var d_value = 0;
    
    switch (d_type) {
      case DIG_IN:
          d_value = {
             
          };
          break;
      case DIG_OUT:
          d_value = {
             
          };
          break;
      case ANL_IN:
          d_value = {
             
          };
          break;
      case ANL_OUT:
          d_value = {
             
          };
          break;
      case ILLUM_SENS:
          d_value = {
             
          };
          break;
      case PRSNC_SENS:
          d_value = {
             
          };
          break;
      case TEMP_SENS :
          d_value = {
             
          };
          break;
      case HUM_SENS :
          d_value = {
             
          };
          break;
      case ACCRM_SENS :
          d_value = {
             
          };
          break;
      case BARO_SENS :
          d_value = {
             
          };
          break;
      case GYRO_SENS :
          d_value = {
             
          };
          break;
      case GPS_LOC :
          d_value = {
             
          };
          break;
         
      default:
        return {
          errors: ["unknown Sensor type"],
        };
    }
    return {
      warnings: [],
      errors: []
    }
  }
}


