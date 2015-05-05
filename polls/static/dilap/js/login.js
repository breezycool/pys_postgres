$(function() {

	/* loader js */
	$('.small, .small-shadow').velocity({
		rotateZ: [0,-360]},{
			loop:true,
			duration: 2000
		});
	$('.medium, .medium-shadow').velocity({
		rotateZ: -240},{
			loop:true,
			duration: 2000
		});
	$('.large, .large-shadow').velocity({
		rotateZ: 180},{
			loop:true,
			duration: 2000
		});
	/* end loader js */

	window.fbAsyncInit = function() {
		Parse.FacebookUtils.init({
			appId      : '1559538814324747',
			xfbml      : true,
			version    : 'v2.3'
		});
	};

	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));

})


function facebookLogin() {
	$('#facebookButton').hide();
	$('.machine').show();
	Parse.FacebookUtils.logIn(null, {
		success: function(user) {
			if (!user.existed()) {
				parseLogin(user.id);
				$('#login').hide('drop',500);
				$('#overlay').hide('drop',500);
			} else {
				$('#login').hide('drop',500);
				$('#overlay').hide('drop',500);
				console.log(user.id);
			}
		},
		error: function(user, error) {
			console.log('error is');
			console.log(error);
			alert("User cancelled the Facebook login or did not fully authorize.");
		}
	});
}

function parseLogin(userID) {
	// fb api call
	FB.api(
		"/me",
		function (response) {
			if (response && !response.error) {
				$('#userInfo').text(response.name);

				if (response.gender == "male")
					isMale = true;
				else
					isMale = false;

				userName = response.name;

				var Point = Parse.Object.extend("_User");
				var point = new Point();
				point.id = userID;
				point.set("isMale", isMale);
				point.set("name", userName);

				point.save(null, {
					success: function(point) {

					},
					error: function(point, error) {

					}
				})

			}
			else
				console.log('some type of error??')
		}
		);
}