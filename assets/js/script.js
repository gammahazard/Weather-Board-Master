let APIkey = '4416b9b64d7f86616c37127909afa59c'

let cities = [''];
// list recent searches
function retrievecity() {
    $('.list-group').empty();
    let city;
    for (city of cities) {
        let listItem = $('<li>').addClass('list-group-item').attr('data-name', city).text(city);
        $('.list-group').append(listItem);
    }
}
// save recent search
function saveCities() {
    localStorage.setItem('cities', cities);
    retrievecity();
}

getCities();

saveCities();
// retrieve city from storage
function getCities() {
    let result = localStorage.getItem('cities');
    if (result !== null) {
        cities = result.split(',');
    }
}
// input search term city, if it exists get city weather
let city;

$('.input-search').on('change', function () {
    city = $('.input-search').val();
    citycurrentforecast();
});

$('.input-group-text').click(function () {
    city = $('.input-search').val();
    citycurrentforecast();
});

$(document).on('click', '.list-group-item', function () {
    city = $(this).attr('data-name');
    citycurrentforecast();
});
// fetch city weather response
function citycurrentforecast() {
    $('.alert').hide();
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${APIkey}`;

    $.ajax({
        url: queryURL,
        method: 'get'
    }).then((res) => {
// if city value exists run rendercity and save to localstorage for search history
        if (!cities.includes(city) && city !== '') {
            cities.unshift(city);
            cities.pop();
            retrievecity();
            saveCities();
        }
// lat and lon fetch for uvi data
        let lon = res.coord.lon;
        let lat = res.coord.lat;
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/uvi?lon=${lon}&lat=${lat}&appid=${APIkey}`,
            method: 'get'
        }).then(res => {    // diff classes for uvi value for color coding
            $('.uv-index').text(`${res.value}`);
            let uvIndex = Math.floor(parseInt(res.value));
            if (uvIndex <= 2) {
                $('.uv-index').addClass('uv-index-low');
            } else if (uvIndex <= 5 && uvIndex > 2) {
                $('.uv-index').addClass('uv-index-moderate');
            } else if (uvIndex <= 7 && uvIndex > 5) {
                $('.uv-index').addClass('uv-index-high');
            } else if (uvIndex <= 10 && uvIndex > 7) {
                $('.uv-index').addClass('uv-index-very-high');
            } else if (uvIndex > 11) {
                $('.uv-index').addClass('uv-index-extreme');
            }
          // todays forecast
        })
        $('#today').empty();
        let todaysContainer = $(`
            <h3 class="mt-5 city-heading">City:  ${res.name} <br>   Date:    ${moment().format('dddd MMM D YYYY')} </h3>
            <i class="today wi ${setWeatherIcon(res.weather[0].icon)}"></i>
            <ul class="temp-list">
                <li>Temperature: <span class="temp">${res.main.temp} ??F</span></li>
                <li>Humidity: <span class="humidity">${res.main.humidity}%</span></li>
                <li>Wind Speed: <span class="wind-speed">${res.wind.speed} MPH</span></li>
                <li>UVI Index: <span class="uv-index"></span>  Units</li>
            </ul>
            `); 
        $('.input-search').val('')
        $('#today').prepend(todaysContainer);
    }).catch((error) => {
        $('.alert').show(error);
    })
// 5 day forecast
    $('.forecast-row').empty();
    fiveday();
}

function fiveday() {
    $('.forecast-row').empty();
    let queryURL = `https://api.openweathermap.org/data/2.5/forecast/?q=${city}&units=imperial&appid=${APIkey}`;

    $.ajax({
        url: queryURL,
        method: 'get'
    }).then((res) => {

        for (i = 0; i < res.list.length; i++) {
            let date = new Date(res.list[i].dt * 1000);
            let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            let name = days[date.getDay()];

            // day of week starting at 15:00 ensures 5 days is displayed
            if (res.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                let forecastContainer = $(`<div class="col-lg-2 forecast-container mr-3">
                    <h5 class="mt-5">${name}</h5>
                    <i class="wi ${setWeatherIcon(res.list[i].weather[0].icon)}"></i>
                    <ul class="temp-list">
                        <li>Temperature: ${res.list[i].main.temp}??F</li>
                        <li>Humidity: ${res.list[i].main.humidity}%</li>
                    </ul>
                    </div>`);
                $('.forecast-row').append(forecastContainer);
            }
        }
    })
}

function setWeatherIcon(icon) {
    let weatherIcon;
    switch (icon) {
        case '01d':
            weatherIcon = "wi-day-sunny"
            break;
        case '01n':
            weatherIcon = "wi-night-clear"
            break;
        case '02d':
        case '02n':
            weatherIcon = "wi-cloudy"
            break;
        case '03d':
        case '03n':
        case '04d':
        case '04n':
            weatherIcon = "wi-night-cloudy"
            break;
        case '09d':
        case '09n':
            weatherIcon = "wi-showers"
            break;
        case '10d':
        case '10n':
            weatherIcon = "wi-rain"
            break;
        case '11d':
        case '11n':
            weatherIcon = "wi-thunderstorm"
            break;
        case '13d':
        case '13n':
            weatherIcon = "wi-snow"
            break;
        case '50d':
        case '50n':
            weatherIcon = "wi-fog"
            break;
        default:
            weatherIcon = "wi-meteor"
    }
    return weatherIcon;
}