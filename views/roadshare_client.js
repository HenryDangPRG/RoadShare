function calculate(){
	var x = document.getElementById("mySelect").selectedIndex; 
	var y = document.getElementById("mySelect").options; 
	var seed = $('#seed').val();
	var URL = "http://localhost:8080/" + y[x].text; 
	$.ajax({
		type: "GET",
		url : URL, 
		dataType: "html",
		data : {"seed":seed},
		contentType: "application/json; charset=utf-8",
		success:function(msg){
			$('#answer').html(msg); 		
		},
		error: function(xhr, ajaxOptions, thrownError){
			alert("error fetching " +URL);
			$("#answer").html("Error fetching ");
		}
	});	
}

function marker(){
	/*
	$.ajax({
		type: "GET",
		url : "http://localhost:8080/", 
		dataType: "html",
		data : {},
		contentType: "application/json; charset=utf-8",
		success:function(msg){
			$('#answer').html(msg); 		
		},
		error: function(xhr, ajaxOptions, thrownError){
			alert("error fetching " +URL);
			$("#answer").html("Error fetching ");
		}
	})
	*/

	latitude = 39.95
	longitude = -75.18
	var myLatLng = {lat:latitude , lng: longitude}; 

	var map = new google.Map(document.getElementById('map'),{
		zoom:8, 
		center: myLatLng
	}); 

	var marker  = new google.maps.marker({
		position: myLatLng,
		map: map,
		title:'m1'
	}); 
}

