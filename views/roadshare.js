
function login(){
	var userid= $('#userid').val(); 
	var password= $('#pd').val(); 
	var URL = "http://localhost:8080/login";
	if (userid == '' || password == ''){
		$('#error').html("Please fill in all the fields.");
	}else {
		$.ajax({
		type: "GET",
		url : URL,
		dataType: "text",
		//sends the selected table as a json object
		data: {"userid": userid, "password":password},
		contentType: "application/json; charset=utf-8",
		success:function(msg){
			var m = JSON.parse(msg);
			if(m.length == 0){
				$('#error').html("Userid or password is incorrect.");
			} else{
				window.location.href = "http://localhost:8080/welcome";
			}
			//$('#table').html(msg); 
		},
		error:function(xhr,ajaxOptions,thrownError){
			alert("error fetching "+ URL);
			//$('#table').html("Error fetching");
		}
		}); 
	}
}

function signup() {
	var userid= $('#userid').val(); 
	var password= $('#pd').val();
	var password2= $('#pd2').val();
	var URL = "http://localhost:8080/signup";
	if (userid == '' || password == '' || password2 == ''){
		$('#error').html("Please fill in all the fields.");
	}
	else if(password==password2){
		$.ajax({
		type: "GET",
		url : URL,
		dataType: "text",
		data: {"userid": userid, "password":password},
		contentType: "application/json; charset=utf-8",
		success:function(msg){
			alert(msg);
			if (msg == "SUCCESS"){
				$('#login').html("<h3>Thank you for signing up!</h3> <br> <a href='http://localhost:8080/' class='btn btn-primary btn-link btn-wd btn-lg'>Go back to login</a>");
			}
			else{
				$('#error').html("Taken userid. Choose another one.");
			}
		},
		error:function(xhr,ajaxOptions,thrownError){
			alert("error fetching "+ URL)
		}
		}); 
	}
	else{
		$('#error').html("Password didn't match.");	
	}
}

function getstarted(){
	var driverId = $('#Did').val(); 
	var routeId = $('#Rid').val();
	var URL = "http://localhost:8080/user?id="+driverId+"&route_id="+routeId;
	window.location.href = URL;
}
