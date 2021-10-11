"use strict";

const btn = document.querySelector(".btn-country");
const countriesContainer = document.querySelector(".countries");

///////////////////////////////////////

const renderContent = function (obj, className = "") {
  const html = `<article class="country ${className}">
  <img class="country__img" src="${obj.flags.svg}" />
  <div class="country__data">
    <h3 class="country__name">${obj.name.official}</h3>
    <h4 class="country__region">${obj.region}</h4>
    <p class="country__row"><span>👫</span>${"Too much people"}</p>
    <p class="country__row"><span>🗣️</span>${Object.values(
      obj.languages
    ).shift()}</p>
    <p class="country__row"><span>💰</span>${
      Object.values(obj.currencies).shift().name
    }</p>
  </div>
</article>`;
  countriesContainer.insertAdjacentHTML("beforeend", html);
};

const handleError = function (error) {
  console.error(error);
  countriesContainer.insertAdjacentText("beforeend", error.message);
};

function parseAndDisplay(data, type) {
  const [countryObj] = data;
  renderContent(countryObj, type);
  if (type) {
    return;
  } else {
    return countryObj;
  }
}

const getJson = function (url, errorMsg = "Something went wrong") {
  return fetch(url).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`${response.status}, ${errorMsg}`);
    }
  });
};

//With helper function
const getCountryDate = function (country) {
  getJson(`https://restcountries.com/v3.1/name/${country}`, "Country not found")
    .then((data) => {
      const neighbour = parseAndDisplay(data).borders?.[0];
      if (neighbour) {
        return getJson(
          `https://restcountries.com/v3.1/alpha/${neighbour}`,
          "Country not found"
        );
      } else {
        throw new Error("There is no neighbour");
      }
    })
    .then((data) => parseAndDisplay(data, "neighbour"))
    .catch((err) => handleError(err))
    .finally(() => {
      countriesContainer.style.opacity = 1;
    });
};

function getLocationData(lat, long) {
  return fetch(`https://geocode.xyz/${lat},${long}?geoit=json`).then(
    (response) => {
      if (response.ok) {
        return response.json();
      } else {
        if (response.status === 403) {
          return response.json().then((errMessage) => {
            const text = errMessage.error.message;
            throw new Error(text);
          });
        } else {
          throw new Error("Location does not exist.. Try again");
        }
      }
    }
  );
}

function whereAmI(lat, long) {
  getLocationData(lat, long)
    .then((data) => {
      const country = data.country;
      console.log(`You are in ${data.region}, ${country}`);
      getCountryDate(country);
    })
    .catch((err) => handleError(err))
    .finally(() => {
      countriesContainer.style.opacity = 1;
    });
}

btn.addEventListener("click", function () {
  countriesContainer.textContent = "";
  navigator.geolocation.getCurrentPosition(function (position) {
    const lat = position.coords.latitude;
    const long = position.coords.longitude;
    console.log(lat, long);
    whereAmI(lat.toFixed(2), long.toFixed(2));
  });
});
