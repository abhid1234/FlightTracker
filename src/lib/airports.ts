// Comprehensive list of major airports worldwide
export const AIRPORT_COORDS: Record<string, [number, number]> = {
    // United States & Canada
    ATL: [33.6407, -84.4277], LAX: [33.9416, -118.4085], ORD: [41.9742, -87.9073],
    DFW: [32.8998, -97.0403], DEN: [39.8561, -104.6737], JFK: [40.6413, -73.7781],
    SFO: [37.6213, -122.3790], SEA: [47.4502, -122.3088], LAS: [36.0840, -115.1537],
    MCO: [28.4312, -81.3081], EWR: [40.6895, -74.1745], MIA: [25.7959, -80.2870],
    PHX: [33.4352, -112.0101], IAH: [29.9902, -95.3368], BOS: [42.3656, -71.0096],
    MSP: [44.8848, -93.2223], DTW: [42.2162, -83.3554], PHL: [39.8744, -75.2424],
    LGA: [40.7769, -73.8740], BWI: [39.1774, -76.6684], DCA: [38.8512, -77.0402],
    SAN: [32.7336, -117.1897], TPA: [27.9755, -82.5332], PDX: [45.5898, -122.5951],
    STL: [38.7487, -90.3700], HNL: [21.3187, -157.9225], ANC: [61.1743, -149.9962],
    OGG: [20.8986, -156.4305], KOA: [19.7388, -156.0456], LIH: [21.9760, -159.3390],
    ONT: [34.0560, -117.6012], SJC: [37.3619, -121.9290], OAK: [37.7213, -122.2207],
    SNA: [33.6762, -117.8674], BUR: [34.2007, -118.3590],
    YYZ: [43.6777, -79.6248], YVR: [49.1967, -123.1815], YUL: [45.4657, -73.7455],

    // Europe
    LHR: [51.4700, -0.4543], CDG: [49.0097, 2.5479], AMS: [52.3105, 4.7683],
    FRA: [50.0379, 8.5622], MAD: [40.4839, -3.5679], BCN: [41.2974, 2.0833],
    FCO: [41.8003, 12.2389], MUC: [48.3536, 11.7750], IST: [40.9769, 28.8146],
    LGW: [51.1537, -0.1821], DUB: [53.4213, -6.2701], VIE: [48.1103, 16.5697],
    ZRH: [47.4582, 8.5555], CPH: [55.6180, 12.6508], OSL: [60.1939, 11.1004],
    ARN: [59.6519, 17.9186], HEL: [60.3172, 24.9633], ATH: [37.9364, 23.9445],
    LIS: [38.7813, -9.1359], BRU: [50.9010, 4.4856], PRG: [50.1008, 14.2600],
    WAW: [52.1657, 20.9671], BUD: [47.4298, 19.2611], OTP: [44.5711, 26.0850],

    // Middle East
    DXB: [25.2532, 55.3657], DOH: [25.2731, 51.6080], AUH: [24.4330, 54.6511],
    CAI: [30.1219, 31.4056], TLV: [32.0114, 34.8867], AMM: [31.7226, 35.9932],
    RUH: [24.9578, 46.6988], JED: [21.6796, 39.1565], KWI: [29.2267, 47.9689],

    // Asia - East
    HND: [35.5494, 139.7798], NRT: [35.7719, 140.3929], KIX: [34.4273, 135.2444],
    ICN: [37.4602, 126.4407], PVG: [31.1443, 121.8083], PEK: [40.0799, 116.6031],
    CAN: [23.3924, 113.2988], HKG: [22.3080, 113.9185], TPE: [25.0797, 121.2342],
    MNL: [14.5086, 121.0194], CGK: [6.1256, 106.6559], SIN: [1.3644, 103.9915],

    // Asia - South & Southeast
    BKK: [13.6900, 100.7501], KUL: [2.7456, 101.7072], SGN: [10.8188, 106.6519],
    HAN: [21.2212, 105.8072], RGN: [16.9073, 96.1332], CMB: [7.1808, 79.8841],

    // India
    DEL: [28.5562, 77.1000], BOM: [19.0896, 72.8656], BLR: [13.1986, 77.7066],
    MAA: [12.9941, 80.1709], HYD: [17.2403, 78.4294], CCU: [22.6547, 88.4467],
    AMD: [23.0732, 72.6347], COK: [10.1518, 76.3930], GOI: [15.3803, 73.8314],
    PNQ: [18.5822, 73.9197], JAI: [26.8242, 75.8122], TRV: [8.4821, 76.9182],

    // Australia & New Zealand
    SYD: [-33.9399, 151.1753], MEL: [-37.6690, 144.8410], BNE: [-27.3842, 153.1175],
    PER: [-31.9403, 115.9672], AKL: [-37.0082, 174.7850], CHC: [-43.4894, 172.5320],

    // South America
    GRU: [-23.4356, -46.4731], GIG: [-22.8099, -43.2505], EZE: [-34.8222, -58.5358],
    SCL: [-33.3930, -70.7858], BOG: [4.7016, -74.1469], LIM: [-12.0219, -77.1143],

    // Africa
    JNB: [-26.1392, 28.2460], CPT: [-33.9715, 18.6021], ADD: [8.9779, 38.7993],
    NBO: [-1.3192, 36.9278], LOS: [6.5774, 3.3212],

    // Default fallback
    DEFAULT: [0, 0],
};

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}

/**
 * Calculates the estimated Carbon Footprint for a flight.
 * Returns null if coordinates are not available for either airport.
 * @param originCode IATA code of origin
 * @param destCode IATA code of destination
 * @returns Object with distance (km) and co2 (kg)
 */
export function calculateFlightEmissions(originCode: string, destCode: string) {
    const origin = AIRPORT_COORDS[originCode];
    const dest = AIRPORT_COORDS[destCode];

    if (!origin || !dest || origin === AIRPORT_COORDS.DEFAULT || dest === AIRPORT_COORDS.DEFAULT) {
        return null;
    }

    const distanceKm = getDistanceFromLatLonInKm(origin[0], origin[1], dest[0], dest[1]);

    // Emission Factor Logic
    // Short haul (< 1500 km) -> ~0.150 kg/km (less efficient due to takeoff/landing)
    // Medium haul (1500-4000 km) -> ~0.110 kg/km
    // Long haul (> 4000 km) -> ~0.100 kg/km
    
    let factor = 0.115; // Default average
    if (distanceKm < 1500) factor = 0.150;
    else if (distanceKm > 4000) factor = 0.100;

    const co2Kg = Math.round(distanceKm * factor);

    return {
        distanceKm: Math.round(distanceKm),
        co2Kg
    };
}
