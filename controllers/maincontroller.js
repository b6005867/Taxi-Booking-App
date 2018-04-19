var app = angular.module('myApp',[]);
app.controller('mainController',function($scope,$http){

    //initialise arrays for data
    $scope.taxis = [];
    $scope.bookings = [];
    $scope.routes = [];
    $scope.quote = [];

    //this array contains the options in the drop-down box for specifying the taxi capacity
    $scope.capacityOptions = [ 3, 5, 7 ];

    //grab the data from the REST Servises
    //taxi Data
    $http.get("http://webteach_net.hallam.shu.ac.uk/acesjas/api/vehicle")
    .then(function(response) {
        $scope.taxis = response.data;
    });
    //Bookings Data
    $http.get("http://webteach_net.hallam.shu.ac.uk/acesjas/api/booking")
    .then(function(response) {
        $scope.bookings = response.data;
    });
    //Routes Data
    $http.get("http://webteach_net.hallam.shu.ac.uk/acesjas/api/route")
    .then(function(response) {
        $scope.routes = response.data;
    });

    //quotes gotten from http://quotesondesign.com/
    $http.get("http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1")
    .then(function(response) {
        $scope.quote = response.data;
    });

    //###################################### data functions ##########################################################################################################################

    //this function refreshes the data when run (useful for updating deleting an so on)
    $scope.refreshData = function(){ 
        $http.get("http://webteach_net.hallam.shu.ac.uk/acesjas/api/vehicle")
        .then(function(response) {
            $scope.taxis = response.data;
        });
        //Bookings Data
        $http.get("http://webteach_net.hallam.shu.ac.uk/acesjas/api/booking")
        .then(function(response) {
            $scope.bookings = response.data;
        });
        //Routes Data
        $http.get("http://webteach_net.hallam.shu.ac.uk/acesjas/api/route")
        .then(function(response) {
            $scope.routes = response.data;
        });
        //Quote
        $http.get("http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1")
        .then(function(response) {
            $scope.quote = response.data;
        });
    };

    //only returns array lenght (useful for the blue pill number as simply putting in array.lenght doesn't work)
    $scope.returnArrayLenght = function(array) {
        var j = 0;
        for (let i = 0; i < array.length; i++) {
            j = j+1;
        }
        return j;
    };

    //clever way of stripping down html characters and tags from string :D (useful for the quotes)
    $scope.decodeHTML = function(html) {
        var div = document.createElement("div");
        div.innerHTML = html;
        var text = div.innerText
        return text;
    };


    //clean the data (eg remove rows with non-existent vehicle ids etc.)
    $scope.cleanData = function() {
        $scope.pass = 0;

        //if any taxi field is null remove the row
        for (let i = 0; i < $scope.taxis.length; i++) {
            if ($scope.taxis[i].Capacity == null|| $scope.taxis[i].Driver == null || $scope.taxis[i].Id == null || $scope.taxis[i].Make == null || $scope.taxis[i].Model == null || $scope.taxis[i].Registration == null) {
                $scope.taxis.splice(i,1);
            }
        }

        //if any booking field is null remove the row
        for (let i = 0; i < $scope.bookings.length; i++) {
            if ($scope.bookings[i].CurrentPassenger == null || $scope.bookings[i].DropOffLocation == null || $scope.bookings[i].Id == null || $scope.bookings[i].PassengerName == null || $scope.bookings[i].PickupLocation == null || $scope.bookings[i].VehicleId == null) {
                $scope.bookings.splice(i,1);
            }
        }

        for (let i = 0; i < $scope.bookings.length; i++) {
            $scope.pass = 0;
            //if the taxi Id is non-existent
            for (let j = 0; j < $scope.taxis.length; j++) {
                if ($scope.bookings[i].VehicleId == $scope.taxis[j].Id) {
                    $scope.pass = 1;
                }
            }
            //if there is anything wrong with the data
            if ($scope.pass == 0) {
                $scope.bookings.splice(i,1);
            }
        }
    };

    //resets a form (useful for cancelling and clicking x when on a form)
    //1=taxi form, 2=route form, 3=booking form
    $scope.emptyForm = function(x) {
        if (x == 1) {
            document.getElementById("addTaxiForm").reset();
        }
        if (x == 2) {
            document.getElementById("addRouteForm").reset();
        }
        if (x == 3) {
            document.getElementById("addBookingForm").reset();
        }

    };



    //###################################### login functions ##########################################################################################################################

    $scope.loggedIn = 0;    //useful for displaying and hiding the login form
    $scope.loginFailed = 0; //useful for displaying error message and hiding it after

    //show the cards and buttons specific to managers
    $scope.loginAsManager = function() {
        $scope.activeTaxis = 1;
        $scope.greeting = 1;
        $scope.manageFareRequests = 1;
        $scope.managerButtons = 1;
        $scope.loggedIn = 1;
        $scope.loginFailed = 0;
    };

    //show the cards and buttons specific to staff
    $scope.loginAsStaff = function() {
        $scope.activeTaxis = 1;
        $scope.greeting = 1;
        $scope.manageFareRequests = 1;
        $scope.loggedIn = 1;
        $scope.loginFailed = 0;
    };

    //hide all cards
    $scope.logOut = function() {
        $scope.activeTaxis = 0;
        $scope.greeting = 0;
        $scope.manageFareRequests = 0;
        $scope.yourStatistics = 0;
        $scope.managerButtons = 0;
        $scope.loggedIn = 0;
    };

    //initialise user variables (useful for hello message)
    $scope.name = "";
    //$scope.status = "no";

    //login function which uses the functions above to decide what to hide and show
    $scope.login = function(user,pass) {

        var authenticationDatails = {
            username: user,
            password: pass,
        };

        $http.post("http://webteach_net.hallam.shu.ac.uk/acesjas/api/login", authenticationDatails)
        .then(function(response) {
            $scope.status = response.data;
            if(response.data.authenticated == true) {
                if(response.data.role == 1) {
                    //$scope.status = "Hi, Staff " + response.data.name;
                    $scope.name = response.data.name;
                    $scope.loginAsStaff();
                    $scope.refreshData();
                }
                if(response.data.role == 2) {
                    //$scope.status = "Hi, Manager " + response.data.name;
                    $scope.name = response.data.name;
                    $scope.loginAsManager();
                    $scope.refreshData();
                }
            }
            else
            {
                $scope.loginFailed = 1;
            }
        });

        document.getElementById("loginForm").reset();

    };

 

    //###################################### greeting functions ##########################################################################################################################

    //shows currently logged in user's name
    $scope.showName = function() {
        return $scope.name;
    };


    //###################################### taxi functions ##########################################################################################################################

    //variable useful for determining which row to update
    $scope.isTaxiEditing = 0;
    //determines which row to update
    $scope.editTaxis = function (id) {
        $scope.isTaxiEditing = id;
        $scope.refreshData();
    };

    //saves any changes made to the row locally to the REST service
    $scope.saveTaxiChanges = function(capacity,driver,id,make,model,registration) {

        var taxiDetails = {
        Capacity: capacity,
        Driver: driver,
        Id: id,
        Make: make,
        Model: model,
        Registration: registration
        };

        $http.put("http://webteach_net.hallam.shu.ac.uk/acesjas/api/vehicle/", taxiDetails);
        $scope.isTaxiEditing = 0;
        $scope.refreshData();
        $scope.refreshData();
    };

    //hides all of the editing boxes and some buttons
    $scope.stopEditingTaxis = function () {
        $scope.isTaxiEditing = 0;
        $scope.refreshData();
    };

    //Removes a taxi from the REST service
    $scope.deleteTaxi = function(id) {
        $http.delete("http://webteach_net.hallam.shu.ac.uk/acesjas/api/vehicle/" + id);
        $scope.refreshData();
        $scope.refreshData();
    };

    //Adds a taxi from the REST service
    $scope.addTaxi = function(capacity,driver,id,make,model,registration) {

        var taxiDetails = {
		Capacity: capacity,
		Driver: driver,
		//Id: 12,
		Make: make,
		Model: model,
		Registration: registration
	    };

        //$scope.taxis.push(taxiDetails);
        $http.post("http://webteach_net.hallam.shu.ac.uk/acesjas/api/vehicle", taxiDetails);
        
        $scope.refreshData();
        $scope.refreshData();

        document.getElementById("addTaxiForm").reset();

    };

    //returns the current number of passenger for a taxi
    $scope.getTaxiCurrentPassengers = function(vehicleId)  {
        var taxiCurrentPassengers = 0;
        for (let i = 0; i < $scope.bookings.length; i++) {
            if($scope.bookings[i].VehicleId == vehicleId )
            {
                taxiCurrentPassengers = taxiCurrentPassengers + $scope.bookings[i].CurrentPassenger;
            }
        }
        return taxiCurrentPassengers;
    }

    //returns the driver name from it's taxi ID (useful for showing the name instead of the vehicle ID in bookings)
    $scope.getTaxiName = function(taxiId) {
        for (let i = 0; i < $scope.taxis.length; i++) {
            if($scope.taxis[i].Id == taxiId) {
                return $scope.taxis[i].Driver;
            }
        }
    };

    //sets the variable to the taxi ID that's given as a parameter (useful for selecting a taxi ID when there's more than one on display)
    $scope.isDriverAssigned = null;    //used for addBookingForm form validation (it uses a required hidden field to tell weather you assigned a driver)
    $scope.setDriverId = 0;
    $scope.setBookingTaxi = function(chosenTaxiId) {
        for (let i = 0; i < $scope.taxis.length; i++) {
            if($scope.taxis[i].Id == chosenTaxiId) {
                $scope.setDriverId = chosenTaxiId;
            }
        }
        $scope.isDriverAssigned = 1;    //fill the required field so that you can continue
    };
    
    //returns the registration plate of a taxi from it's ID (useful for showing the registration instead of the vehicle ID in bookings)
    $scope.getTaxiRegistration = function(taxiId) {
        for (let i = 0; i < $scope.taxis.length; i++) {
            if($scope.taxis[i].Id == taxiId) {
                return $scope.taxis[i].Registration;
            }
        }
    };

    //###################################### booking functions ##########################################################################################################################

    //this returns the number of passengers in a booking from the booking ID (useful for comparing it to the current number of people in a taxi)
    $scope.getBookingCurrentPassengers = function(bookingId) {
        for (let i = 0; i < $scope.bookings.length; i++) {
            if($scope.bookings[i].Id == bookingId) {
                return $scope.bookings[i].CurrentPassenger;
            }
        }
    };

    //adds a new booking
    $scope.addBooking = function(currentpassenger,dropofflocation,passengername,pickuplocation,vehicleid) {

        //if theres no vehicle ID then cancel
        if(vehicleid == 0){
            return 0;
        }

        var bookingDetails = {
        CurrentPassenger: currentpassenger,
		DropOffLocation: dropofflocation,
		//Id: 12,
		PassengerName: passengername,
		PickupLocation: pickuplocation,
		VehicleId: vehicleid
	    };

        //$scope.taxis.push(bookingDetails);
        $http.post("http://webteach_net.hallam.shu.ac.uk/acesjas/api/booking", bookingDetails);
        
        $scope.refreshData();
        $scope.refreshData();

        document.getElementById("addBookingForm").reset();
    };

    //deletes a booking based on an id
    $scope.deleteBooking = function(bookingId) {
        $http.delete("http://webteach_net.hallam.shu.ac.uk/acesjas/api/booking/" + bookingId);
        $scope.refreshData();
        $scope.refreshData();
    };

    //decides which booking is currently editing (useful for displaying textboxes for editing a specific row)
    $scope.isBookingEditing = 0;
    $scope.editBookings = function (bookingId) {
        $scope.isBookingEditing = bookingId;
    };

    //saves local changes made to a booking row
    $scope.saveBookingChanges = function(currentPassenger,dropOffLocation,id,passengerName,pickupLocation,vehicleId) {

        var bookingDetails = {
        CurrentPassenger: currentPassenger,
        DropOffLocation: dropOffLocation,
        Id: id,
        PassengerName: passengerName,
        PickupLocation: pickupLocation,
        VehicleId: vehicleId
        };

        $http.put("http://webteach_net.hallam.shu.ac.uk/acesjas/api/booking/", bookingDetails);
        $scope.isBookingEditing = 0;
        $scope.refreshData();
        $scope.refreshData();
    };

    //the variable holds a single booking row and the function assigns a row to it from an id (useful for working with booking data if you only have the ID of the booking)
    $scope.detailsReceived = []
    $scope.getBookingDetailsById = function(bookingId){

        for (let i = 0; i < $scope.bookings.length; i++) {
            if($scope.bookings[i].Id == bookingId) {
                $scope.detailsReceived = $scope.bookings[i];
            }
        }

    }

    //this assigns a taxi to a booking (used when changing the driver for a booking that already exists)
    $scope.assignTaxiToBooking = function(bookingId,taxiId) {

        $scope.getBookingDetailsById(bookingId);

        var bookingDetails = {
        CurrentPassenger: $scope.detailsReceived.CurrentPassenger,
        DropOffLocation: $scope.detailsReceived.DropOffLocation,
        Id: $scope.detailsReceived.Id,
        PassengerName: $scope.detailsReceived.PassengerName,
        PickupLocation: $scope.detailsReceived.PickupLocation,
        VehicleId: taxiId
        };

        $http.put("http://webteach_net.hallam.shu.ac.uk/acesjas/api/booking/", bookingDetails);
        $scope.isBookingEditing = 0;
        $scope.refreshData();
        $scope.refreshData();
    };

    //hides the textboxes for editing bookings
    $scope.stopEditingBookings = function () {
        $scope.isBookingEditing = 0;
    };


    //###################################### route functions ##########################################################################################################################

    //decides which route is editing by giving it the ID of the route (useful for displaying textboxes for editing a single route)
    $scope.isRouteEditing = 0;
    $scope.editRoute = function (id) {
        $scope.isRouteEditing = id;
    };

    //saves local changes made to a route to the REST Service
    $scope.saveRouteChanges = function(id,routeendpoint,routestartpoint) {

        var routeDetails = {
        Id: id,
        RouteEndPoint: routeendpoint,
        RouteStartPoint: routestartpoint
        };

        $http.put("http://webteach_net.hallam.shu.ac.uk/acesjas/api/route/", routeDetails);
        $scope.isRouteEditing = 0;
        $scope.refreshData();
        $scope.refreshData();
    };

    //hides the textboxes for editing routes
    $scope.stopEditingRoute = function () {
        $scope.isRouteEditing = 0;
    };

    //deleted a specific route
    $scope.deleteRoute = function(id) {
        $http.delete("http://webteach_net.hallam.shu.ac.uk/acesjas/api/route/" + id);
        $scope.refreshData();
        $scope.refreshData();
    };

    //adds a route
    $scope.addRoute = function(routeendpoint,routestartpoint) {

        var routeDetails = {
        //Id: id,
        RouteEndPoint: routeendpoint,
        RouteStartPoint: routestartpoint
        };

        //$scope.routes.push(routeDetails);
        $http.post("http://webteach_net.hallam.shu.ac.uk/acesjas/api/route", routeDetails);
        
        $scope.refreshData();
        $scope.refreshData();

        document.getElementById("addRouteForm").reset();
    };

})