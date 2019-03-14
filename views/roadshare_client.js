window.initMap = function(){
	alert("i am in update");
	//get the userid
	var userid = 1; // change this later
	var URL = "http://localhost:8080/update";//double check the url	
	var myLatLng; 
	$.ajax({
		type: "GET",
		url : URL, 
		dataType: "json",
		data : {"userid":userid},
		contentType: "application/json; charset=utf-8",
		success:function(msg){
			lt = msg.lat; 
			lg = msg.lng; 
			myLatLng = {lat: lt, lng: lg};
			//initMap(lat,lng); 		
		},
		error: function(xhr, ajaxOptions, thrownError){
			alert("error fetching " +URL);
			//$("#answer").html("Error fetching ");
		}
	});	
	var options = {
		zoom:8,
		center: myLatLng
	}
	var map = new google.maps.Map(document.getElementById('map'),options); 

	var marker = new google.maps.Marker({
	  position: myLatLng,
	  map: map,
	  title: 'marker'
	});
}

// function initMap(){

// 	var myLatLng =  update(); 
// 	var options = {
// 		zoom:8,
// 		center: myLatLng
// 	}
// 	var map = new google.maps.Map(document.getElementById('map'),options); 

// 	var marker = new google.maps.Marker({
// 	  position: myLatLng,
// 	  map: map,
// 	  title: 'marker'
// 	});
// 	alert('i am initMap'); 
// }




// function marker(){
	
// 	latitude = 39.95
// 	longitude = -75.18
// 	var myLatLng = {lat:latitude , lng: longitude}; 

// 	var map = new google.Map(document.getElementById('map'),{
// 		zoom:8, 
// 		center: myLatLng
// 	}); 

// 	var marker  = new google.maps.marker({
// 		position: myLatLng,
// 		map: map,
// 		title:'m1'
// 	}); 
// }

