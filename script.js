ymaps.ready(init);

var myMap, myPlacemark, myCircle, radius = 800, sort = 0, coord = getCoordinatesFromAddress();

function init(){
	getCoordinatesFromAddress();
	getPhotos();

    myMap  = new ymaps.Map("map", {
    	center: coord,
    	zoom: 13,
    	controls: [
    		//'geolocationControl', 
    		//'searchControl', 
    		'zoomControl'
    		]
    }),


    myPlacemark = new ymaps.Placemark(coord, {}, {draggable: true});
 	myCircle = new ymaps.Circle([coord, radius]);
	myMap.geoObjects.add(myCircle);

	var myListBoxRadius = new ymaps.control.ListBox({
	    data: {
	        content: 'Радиус поиска'
	    },
	    items: [
            new ymaps.control.ListBoxItem({
                data: {
                    content: '10 м',
                    radius: 10
                },
                options: {
                	selectOnClick: false
                }
            }),
            new ymaps.control.ListBoxItem({
                data: {
                    content: '100 м',
                    radius: 100
                },
                options: {
                	selectOnClick: false
                }
            }),
            new ymaps.control.ListBoxItem({
                data: {
                    content: '800 м',
                    radius: 800
                },
                options: {
                	selectOnClick: false
                }
            }),
            new ymaps.control.ListBoxItem({
                data: {
                    content: '6000 м',
                    radius: 6000
                },
                options: {
                	selectOnClick: false
                }
            }),
            new ymaps.control.ListBoxItem({
                data: {
                    content: '50000 м',
                    radius: 50000
                },
                options: {
                	selectOnClick: false
                }
            })
        ]
	});

	var myListBoxSort = new ymaps.control.ListBox({
	    data: {
	        content: 'Сортировка'
	    },
	    items: [
            new ymaps.control.ListBoxItem({
                data: {
                    content: 'По дате добавления',
                    sort: 0,
                },
                options: {
                	selectOnClick: false
                }
            }),
            new ymaps.control.ListBoxItem({
                data: {
                    content: 'По количеству лайков',
                    sort: 1,
                },
                options: {
                	selectOnClick: false
                }
            })
        ]
	});

	var myButton = new ymaps.control.Button({
         data: {
             content: 'Поиск фотографий',
             title: 'Нажмите для поиска фотографий'
         },
         options: {
             selectOnClick: false,
             maxWidth: [30, 100, 150]
         }});


	myPlacemark.events.add("dragend", function (e) {		
		coord = this.geometry.getCoordinates();
		window.history.pushState(null, null, "#" + coord);

		myMap.geoObjects.remove(myCircle);
		myCircle = new ymaps.Circle([coord, radius]);
		myMap.geoObjects.add(myCircle);
	}, myPlacemark);

	myButton.events.add('press', function () {
	      getPhotos();
	    }
	  );

	myListBoxSort.events.add('click', function(e) {
		sort = e.get('target').data.get('sort');
		console.log(e.get('target'));
	})

	myListBoxRadius.events.add('click', function(e) {
		radius = e.get('target').data.get('radius');
		if(!radius) return;
		myMap.geoObjects.remove(myCircle);
		myCircle = new ymaps.Circle([coord, radius]);
		myMap.geoObjects.add(myCircle);
		console.log(radius);
	})

	myMap.geoObjects.add(myPlacemark);
	myMap.controls.add(myListBoxRadius);
	myMap.controls.add(myListBoxSort);
	myMap.controls.add(myButton);
}


function getPhotos() {
	var url = "https://api.vk.com/method/photos.search?lat="+coord[0] + "&long=" + coord[1] + "&count=100&radius="+radius+"&sort="+sort+"&v=5.24"
	$(".block_photos").text("");
	$.ajax({
	    url : url,
	    type : "GET",
	    dataType : "jsonp",
	    success : function(data){
	    	var photos = data.response.items;
			if(data.response.count == 0 || data.error) {
				$(".block_photos").text("Фотографий в данном месте не найдено, попробуйте увеличить радиус поиска.");
				return;
			}
			for(var i in photos) {
				$(".block_photos").append("<a href='http://vk.com/photo"+photos[i].owner_id+"_" + photos[i].id + "' target='_blank'><div id='photo'>"+
					"<img src='"+ photos[i].photo_604 + "' height='130' /></div></a>");
			}
	    }
	});
}

function getCoordinatesFromAddress() {
	var adressCoord;
	var addressLength = document.location.href.lastIndexOf("#");
	var requestString = location.href.substring(addressLength + 1);
	if(addressLength == -1) adressCoord =  [59.935614688488386, 30.32591173751718];
	else  adressCoord = eval("[" +requestString + "]");
	return adressCoord;
}
