const minChargeAtDestinationInkWh = 20;
const minChargeAtChargingStopsInkWh = 20;

const consumptionModel = {
  vehicleWeight: 1900,
  accelerationEfficiency: 0.66,
  decelerationEfficiency: 0.91,
  uphillEfficiency: 0.74,
  downhillEfficiency: 0.73,
  constantSpeedConsumptionInkWhPerHundredkm: [ [ 100, 20.09 ] ],
  currentChargeInkWh: 100,
  maxChargeInkWh: 100,
  auxiliaryPowerInkW: 1.7
};

const chargingModes = [
  {
    "chargingConnections": [
      {
        "facilityType": "Charge_200_to_480V_Direct_Current_at_255A_120kW",
        "plugType": "Tesla_Connector"
      },
      {
        "facilityType": "Charge_380_to_480V_3_Phase_at_63A",
        "plugType": "Tesla_Connector"
      },
      {
        "facilityType": "Charge_50_to_500V_Direct_Current_at_125A_50kW",
        "plugType": "Tesla_Connector"
      },
      {
        "facilityType": "Charge_50_to_500V_Direct_Current_at_62A_25kW",
        "plugType": "Tesla_Connector"
      },
      {
        "facilityType": "Charge_50_to_500V_Direct_Current_at_62A_25kW",
        "plugType": "SAE_J1772"
      },
      {
        "facilityType": "Charge_50_to_500V_Direct_Current_at_125A_50kW",
        "plugType": "SAE_J1772"
      },
      {
        "facilityType": "Charge_380_to_480V_3_Phase_at_63A",
        "plugType": "SAE_J1772"
      },
      {
        "facilityType": "Charge_380_to_480V_3_Phase_at_32A",
        "plugType": "SAE_J1772"
      },
      {
        "facilityType": "Charge_380_to_480V_3_Phase_at_16A",
        "plugType": "SAE_J1772"
      }
    ],
    "chargingCurve":[
      {
        "chargeInkWh":50,
        "timeToChargeInSeconds":1200
      },
      {
        "chargeInkWh":80,
        "timeToChargeInSeconds":2400
      },
      {
        "chargeInkWh":100,
        "timeToChargeInSeconds":4500
      }
    ]
  },
  {
    "chargingConnections": [
      {
        "facilityType": "Charge_380_to_480V_3_Phase_at_32A",
        "plugType": "Tesla_Connector"
      },
      {
        "facilityType": "Charge_100_to_120V_1_Phase_at_16A",
        "plugType": "Tesla_Connector"
      },
      {
        "facilityType": "Charge_200_to_240V_1_Phase_at_32A",
        "plugType": "Tesla_Connector"
      },
      {
        "facilityType": "Charge_200_to_240V_1_Phase_at_16A",
        "plugType": "Tesla_Connector"
      },
      {
        "facilityType": "Charge_200_to_240V_3_Phase_at_32A",
        "plugType": "Tesla_Connector"
      },
      {
        "facilityType": "Charge_200_to_240V_1_Phase_at_12A",
        "plugType": "SAE_J1772"
      },
      {
        "facilityType": "Charge_200_to_240V_1_Phase_at_32A",
        "plugType": "SAE_J1772"
      },
      {
        "facilityType": "Charge_200_to_240V_1_Phase_at_10A",
        "plugType": "SAE_J1772"
      },
      {
        "facilityType": "Charge_200_to_240V_3_Phase_at_32A",
        "plugType": "SAE_J1772"
      },
      {
        "facilityType": "Charge_200_to_240V_1_Phase_at_16A",
        "plugType": "SAE_J1772"
      },
      {
        "facilityType": "Charge_100_to_120V_1_Phase_at_16A",
        "plugType": "SAE_J1772"
      }
    ],
    "chargingCurve": [
      {
        "chargeInkWh": 100,
        "timeToChargeInSeconds": 90000
      }
    ]
  }
];