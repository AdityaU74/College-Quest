
mapboxgl.accessToken = mapToken;
    var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      center: college.geometry.coordinates,
      zoom:11
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(college.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${college.title}</h3><p>${college.location}</p>`
            )
    )
    .addTo(map)