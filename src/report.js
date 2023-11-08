const { getTrips } = require('api');

/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {any} Driver report data
 */
 
// Define an asynchronous function named driverReport
async function driverReport() {
  try {
    // Get the list of trips asynchronously
    const trips = await getTrips();

    // Create an object to store the driver report
    const driversReport = {};

    // Process each trip in the obtained list
    for (const trip of trips) {
      // Extract driver ID from the current trip
      const driverID = trip.driverID;

      // Check if the driver's report already exists
      if (!driversReport[driverID]) {
        // If not, initialize the driver's information
        const driverDetail = await getDriver(driverID);
        driversReport[driverID] = {
          fullName: driverDetail.name,
          id: driverID,
          phone: driverDetail.phone,
          noOfTrips: 0,
          noOfVehicles: 0,
          vehicles: [],
          noOfCashTrips: 0,
          noOfNonCashTrips: 0,
          totalAmountEarned: 0,
          totalCashAmount: 0,
          totalNonCashAmount: 0,
          trips: [],
        };
      }

      // Update driver's trip information
      const isCash = trip.isCash === true;
      driversReport[driverID].noOfTrips++;
      driversReport[driverID].totalAmountEarned += trip.billAmount;

      // Update cash and non-cash trip counts and amounts
      if (isCash) {
        driversReport[driverID].noOfCashTrips++;
        driversReport[driverID].totalCashAmount += trip.billedAmount;
      } else {
        driversReport[driverID].noOfNonCashTrips++;
        driversReport[driverID].totalNonCashAmount += trip.billedAmount;
      }

      // Populate the trip's details in the driver's report
      driversReport[driverID].trips.push({
        user: trip.user.name,
        created: trip.created,
        pickup: trip.pickup.address,
        destination: trip.destination.address,
        billed: trip.billedAmount,
        isCash,
      });
    }

    // Process driver and vehicle information in parallel
    const driverIDs = Object.keys(driversReport);

    // Create an array of promises for driver information retrieval
    const driverInfoPromises = driverIDs.map(async (driverID) => {
      // Get detailed driver information
      const driverInfo = await getDriver(driverID);

      // Update the number of vehicles for the driver
      driversReport[driverID].noOfVehicles = driverInfo.vehicleID.length;

      // Create an array of promises for vehicle information retrieval
      const vehicleInfoPromises = driverInfo.vehicleID.map(async (vehicleID) => {
        // Get detailed vehicle information
        const vehicleInfo = await getVehicle(vehicleID);
        return {
          plate: vehicleInfo.plate,
          manufacturer: vehicleInfo.manufacturer,
        };
      });

      // Wait for all vehicle information promises to resolve
      const vehicleInfo = await Promise.all(vehicleInfoPromises);

      // Update the driver's report with vehicle information
      driversReport[driverID].vehicles = vehicleInfo;
    });

    // Wait for all driver information promises to resolve
    await Promise.all(driverInfoPromises);

    // Return the driver report as an array of driver objects
    return Object.values(driversReport);
  } catch (error) {
    // If any error occurs, throw the error
    throw error;
  }
}

 
module.exports = driverReport;