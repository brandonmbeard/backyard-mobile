$(document).bind("mobileinit", function(){
	$.mobile.defaultPageTransition = "none";
	$.mobile.useFastClick = "true";
});

function init() {
	document.addEventListener("deviceready", deviceReady, true);
	delete init;
}

function checkPreAuth() {
	console.log("checkPreAuth");
	if (window.localStorage["user_id"] != undefined && window.localStorage["user_key"] != undefined) {
		$.mobile.changePage('main.html');
	}
}

function handleLogin() {
	var form = $("#loginForm");    
	//disable the button so we can't resubmit while we wait
	$("#submitButton",form).attr("disabled","disabled");
	var u = $("#username", form).val();
	var p = $("#password", form).val();
	
	if (u != '' && p!= '') {
		$.ajax({
			url: 'http://backyard.inetinteractive.com/inet_mobile/login',
			dataType: 'jsonp',
			data: {user_login:u,user_password:p},
			success: function(response) {
				if (response.result == 'success') {
					//store
					window.localStorage['user_id'] = response.data.user_id;
					window.localStorage['user_key'] = response.data.user_key;
					$.mobile.changePage('main.html');
				} else {
					navigator.notification.alert("Your login failed", function() {});
				}
				$("#submitButton").removeAttr("disabled");
			}
		});
	} else {
		navigator.notification.alert("You must enter a username and password", function() {});
		$("#submitButton").removeAttr("disabled");
	}
	return false;
}

function deviceReady() {
	console.log("deviceReady");
	$("#loginPage").on("pageinit",function() {
		console.log("pageinit run");
		$("#loginForm").on("submit", handleLogin);
		checkPreAuth();
	});
	$.mobile.changePage("#loginPage");
}

function clearLogout() {
	console.log('Logout!');
	delete window.localStorage['user_id'];
	delete window.localStorage['user_key'];
	$.mobile.changePage("#loginPage");
}

$(document).bind("pagechange", function(event, data) {

	var id = data.toPage[0].id;

	$.ajax({
		url: 'http://backyard.inetinteractive.com/inet_mobile/'+id,
		dataType: 'jsonp',
		data: {user_id:window.localStorage['user_id'],user_key:window.localStorage['user_key']},
		success: function(response) {

			console.log(response.data);

			if (id == 'posts') {

				$('#posts-set').empty();

				$.each(response.data, function(index, el) {
					var post = $(
						'<div data-role="collapsible">' +
							'<h3>'+el.title+'</h3>' +
							'<p class="author">Published '+el.date_published+' by '+el.author+'</p>' +
							'<p>'+el.content+'</p>' +
						'</div>'
					);
					$('#posts-set').append(post);
					$('div[data-role=collapsible]').collapsible();
				});

			} else if (id == 'quickies') {

				$('#quickies-list').empty();

				$.each(response.data, function(index, el) {
					var content = el.content;
					content = content.replace('@rooster ', '');
					content = content.replace('<p>', '<p style="white-space:normal;"><strong>'+el.author+'</strong>: ');
					content += '<p style="color: #999;"><em>'+el.time_since+'</em></p>';
					var quickie = $('<li>'+content+'</li>');
					$('#quickies-list').append(quickie);
				});

				$('#quickies-list').listview("refresh");

			} else if (id == 'directory') {

				$('#directory-set').empty();

				$.each(response.data, function(index, el) {
					var post = $(
						'<div data-role="collapsible" style="line-height:10px;">' +
							'<h3><img src="'+el.img_url+'" width="59" height="70" alt="'+el.display_name+'\'s Mug" class="staffDirectoryPhoto" style="float: left; margin-right: 10px;"/><div style="line-height:7px;"><p>'+el.display_name+'</p><p style="font-size: smaller; color: #999;">'+el.inet_jobtitle+'</p><p style="font-size: smaller; color: #999;"><a href="tel:'+el.inet_office_phone+'">'+el.inet_office_phone+'</a></p></div></h3>' +

							'<div class="contact_detail"><p><strong>Title</strong>: '+el.inet_jobtitle+'</p>' +
							'<p><strong>Department</strong>: '+el.inet_department+'</p>' +
							'<p><strong>Office Location</strong>: '+el.inet_office_location+'</p>' +
							'<p><strong>Office Phone</strong>: <a href="tel: '+el.inet_office_phone+'">'+el.inet_office_phone+'</a></p>' +
							'<p><strong>Mobile Phone</strong>: <a href="tel: '+el.inet_mobile_phone+'">'+el.inet_mobile_phone+'</a></p>' +
							'<p><strong>Home Phone</strong>: <a href="tel: '+el.inet_home_phone+'">'+el.inet_home_phone+'</a></p>' +
							'<p><strong>Skype</strong>: <a href="skype:'+el.inet_skype+'">'+el.inet_skype+'</a></p>' +
							'<p><strong>MSN</strong>: '+el.inet_msn+'</p>' +
							'<p><strong>AIM</strong>: '+el.aim+'</p>' +
							'<p><strong>Yahoo</strong>: '+el.yim+'</p>' +
							'<p><strong>Gtalk</strong>: '+el.jabber+'</p>' +
						'</div></div>'
					);
					$('#directory-set').append(post);
					$('div[data-role=collapsible]').collapsible();
				});
			}

			$('a.logout').on('click', clearLogout);
		}
	});

}); 