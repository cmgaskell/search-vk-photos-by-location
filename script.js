ymaps.ready(init);

var myMap, myPlacemark, myCircle, radius = 800, sort = 0, coord = getCoordinatesFromAddress(), inProgress = false, offset = 0;
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
    })

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
        offset = 0, first_date = true;
        getPhotos();
      }
    );

  myListBoxSort.events.add('click', function(e) {
    var theSort = e.get('target').data.get('sort');
    if(theSort == undefined || theSort == sort) return;
    sort = theSort;
    offset = 0;
    getPhotos();
  })

  myListBoxRadius.events.add('click', function(e) {
    var theRadius = e.get('target').data.get('radius');
    if(!theRadius || theRadius == radius) return;
    radius = theRadius;
    getPhotos();
    myMap.geoObjects.remove(myCircle);
    myCircle = new ymaps.Circle([coord, radius]);
    myMap.geoObjects.add(myCircle);
  })

  myMap.geoObjects.add(myPlacemark);
  myMap.controls.add(myListBoxRadius);
  myMap.controls.add(myListBoxSort);
  myMap.controls.add(myButton);
}

var today = dateOnRussian(new Date());
var current_date = today;

function getPhotos() {
  var url = "https://api.vk.com/method/photos.search?lat="+coord[0] + "&long=" + coord[1] + "&count=100&offset="+offset+"&radius="+radius+"&sort="+sort+"&v=5.24";
  if(offset == 0) {
    $(".block_photos").text("");
    var first_date = true;
    current_date = today; 
  }
  $.ajax({
      url : url,
      type : "GET",
      beforeSend: function () {
        inProgress = true;
      },
      dataType : "jsonp",
      success : function(data){
        console.debug(data);
        var photos = data.response.items;
        if(data.response.count == 0 || data.error) {
          $(".block_photos").text("Фотографий в данном месте не найдено, попробуйте увеличить радиус поиска.");
          return;
        }

        for(var i in photos) {
          var date = unixToDate(photos[i].date);
          if(today == date && first_date) {
            $(".block_photos").append("<div class='page-divider'><div class='page-divider__text'>Сегодня</div></div>");
            first_date = false;
          }
          if(current_date != date) {
            current_date = date;
            $(".block_photos").append("<div class='page-divider'><div class='page-divider__text'>" + date + "</div></div>");            
          } 
          $(".block_photos").append("<a href='http://vk.com/photo"+photos[i].owner_id+"_" + photos[i].id + "' target='_blank'><div id='photo'>"+
            "<img src='"+ photos[i].photo_604 + "' height='130'  title='"+date+"' /></div></a>");
        }

        inProgress = false;
      }
  });
}

function unixToDate(date) {
  var theDate = new Date(date * 1000);
  return dateOnRussian(theDate);
}

function dateOnRussian(date) {
  var today = date;
  var day = today.getDay();
  var monthA = 'января,февраля,марта,апреля,мая,июня,июля,авгста,сентября,октября,ноября,декабря'.split(',');
  var mounth = monthA[today.getMonth()];
  return(day + " " + mounth);
}

function getCoordinatesFromAddress() {
  var adressCoord;
  var addressLength = document.location.href.lastIndexOf("#");
  var requestString = location.href.substring(addressLength + 1);
  if(addressLength == -1) adressCoord =  [59.935614688488386, 30.32591173751718];
  else  adressCoord = eval("[" +requestString + "]");
  return adressCoord;
}

$(window).scroll(function() {
  if($(window).scrollTop() + $(window).height() >= $(document).height() - 200 && !inProgress) {
    if(offset > 2900) return;
    offset += 100;
    getPhotos();
  }
});