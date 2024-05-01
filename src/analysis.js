const { getTrips, getDriver} = require('api');
 
/**
* This function should return the data for drivers in the specified format
*
* Question 4
*
* @returns {any} Driver report data
*/
async function analysis() {
  
  try {
    const trips = await getTrips();
    

    const cashTrips = trips.filter((obj) => {
      return obj.isCash === true;
    });
    //identify number of non cash trips
    const nonCashTrips = trips.filter((obj) => {
      return obj.isCash === false;
    });
    //sum of total billed
    const sumTotalBilled = trips.reduce((accumulator, obj) => {
      if (typeof obj.billedAmount === "string") {
        return accumulator + parseFloat(obj.billedAmount.replaceAll(",", ""));
      } else if (typeof obj.billedAmount === "number") {
        return accumulator + obj.billedAmount;
      } else {
        return accumulator;
      }
    }, 0);
    //sum of total cash billed
    const sumTotalCashBilled = trips.reduce((accumulator, obj) => {
      if (obj.isCash === true && typeof obj.billedAmount === "string") {
        return accumulator + parseFloat(obj.billedAmount.replaceAll(",", ""));
      } else if (obj.isCash === true && typeof obj.billedAmount === "number") {
        return accumulator + obj.billedAmount;
      } else {
        return accumulator;
      }
    }, 0);
    // sum of total non cash billed
    const sumNonTotalCashBilled = trips.reduce((accumulator, obj) => {
      if (obj.isCash === false && typeof obj.billedAmount === "string") {
        return accumulator + parseFloat(obj.billedAmount.replaceAll(",", ""));
      } else if (obj.isCash === false && typeof obj.billedAmount === "number") {
        return accumulator + obj.billedAmount;
      } else {
        return accumulator;
      }
    }, 0);
 
    // map all the driver ids into new array
    const driverIds = trips.map((obj) => {
      return obj.driverID;
    });
 
    // create unique set of drivers ids
    const driverUnique = [...new Set(driverIds)];
 
    let driverCont = [];
 
    //fetch unique driver data from drivers list
 
    driverUnique.forEach((driver) => {
      let driverInfo = getDriver(driver);
      driverCont.push(driverInfo);
    });
 
    //settle all promisies to remove error code
    let driverContainer = await Promise.allSettled(driverCont);
    // after settling promise, the container is mutated and shows a property of status and the rest of the driver's info falls into a property called value
 
    // filter out only drivers with fulfilled promises and map/extract the values of the driver info
 
    const fulfilledDrivers = driverContainer
      .filter((result) => result.status == "fulfilled")
      .map((result) => result.value);
 
    // get count of drivers with multiple vehicles, reducing passing in the conditions of length of vehicle array
    const multiVehicles = fulfilledDrivers.reduce((acc, obj) => {
      if (obj.vehicleID.length > 1) {
        return (acc += 1);
      } else {
        return acc;
      }
    }, 0);
 
    // Get count of all occurences of the driver's trips as an object
    let count = {};
 
    // identify Driver ID with the highest number of occurences => trips
    driverIds.forEach(function (i) {
      count[i] = (count[i] || 0) + 1;
    });
 
    //convert to array to sort in descending order
    const countEntries = Object.entries(count)
 
    const sortedEntries = countEntries.sort((a,b) => b[1] -a[1])
 
   const maxDriverID = sortedEntries[0][0]
   const maxDriverTrips = sortedEntries[0][1]
 
    //extract driver information of driver with the most no of trips
    const maxDriverDetails = await getDriver(maxDriverID);
 
    //extract total amount earned from trips
    const maxDriverBilled = trips.reduce((accumulator, obj) => {
      if (obj.driverID == maxDriverID && typeof obj.billedAmount === "string") {
        return accumulator + parseFloat(obj.billedAmount.replaceAll(",", ""));
      } else if (
        obj.driverID == maxDriverID &&
        typeof obj.billedAmount === "number"
      ) {
        return accumulator + obj.billedAmount;
      } else {
        return accumulator;
      }
    }, 0);
 
    const driverTotalContainer = [];
    // Loop through unique drivers and filter the trips of each unique driver into an array of trips
 
    for (const key of driverUnique) {
      //filter out the trips whose driver ID match the driverIDs in the unique ID list
      const tripsPerDriver = trips.filter((trip) => trip.driverID == key);
 
      //Calculate the total billed amount and number of trips for this driver
      const totalAmountEarned = tripsPerDriver.reduce((accumulator, obj) => {
        if (typeof obj.billedAmount === "string") {
          return accumulator + parseFloat(obj.billedAmount.replaceAll(",", ""));
        } else if (typeof obj.billedAmount === "number") {
          return accumulator + obj.billedAmount;
        } else {
          return accumulator;
        }
      }, 0);
 
      const noOfTrips = tripsPerDriver.reduce((trip) => {
        return tripsPerDriver.length;
      }, 0);
 
      // push unique driver ids, total amount earned and no of trips
      driverTotalContainer.push({
        driverID: key,
        totalAmount: totalAmountEarned,
        noOfTrips: noOfTrips,
      });
    }
 
    driverTotalContainer.sort((a, b) => b.totalAmount - a.totalAmount);
 
    // after sorting in desecending order, the highest earning driver is the driver in index 0
    const highestDriver = driverTotalContainer[0].driverID;
 
    // Retrieve the information of the highest-earning driver
    const highestDriverInfo = await getDriver(highestDriver);
 
    const output = {
      noOfCashTrips: cashTrips.length,
      noOfNonCashTrips: nonCashTrips.length,
      billedTotal: parseFloat(sumTotalBilled.toFixed(2)),
      cashBilledTotal: sumTotalCashBilled,
      nonCashBilledTotal: parseFloat(sumNonTotalCashBilled.toFixed(2)),
      noOfDriversWithMoreThanOneVehicle: multiVehicles,
      mostTripsByDriver: {
        name: maxDriverDetails.name,
        email: maxDriverDetails.email,
        phone: maxDriverDetails.phone,
        noOfTrips: maxDriverTrips,
        totalAmountEarned: maxDriverBilled,
      },
      highestEarningDriver: {
        name: highestDriverInfo.name,
        email: highestDriverInfo.email,
        phone: highestDriverInfo.phone,
        noOfTrips: driverTotalContainer[0].noOfTrips,
        totalAmountEarned: driverTotalContainer[0].totalAmount,
      },
    };
    return output;
    //console.log(output);
 
  } catch (error) {
    console.error("the data is not available");
  }
}
 

module.exports = analysis;
 






















































//identify number of cash trips

    // let cashTrips = 0;
    // let nonCashTrips = 0;
    // let sumOfCashTrips = 0;
    // let sumOfNonCashTrips = 0;
    // let sumOfTrips = 0;

    // for (const trip of trips) {
    //   if (trip.isCash) {
    //     cashTrips++;
    //     sumOfCashTrips += trip.amount;
    //   }

    //   if (!trip.isCash) {
    //     nonCashTrips++;
    //     sumOfNonCashTrips += trip.amount;
    //   }

    //   sumOfTrips += trip.amount;
    // }