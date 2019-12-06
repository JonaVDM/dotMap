const size = 900;
let offset = 3000;

getLocation();

function getLocation() {
    navigator.geolocation.getCurrentPosition(show);
}

async function show(pos) {
    // Load in the "map"
    let map = document.querySelector('#map');
    map.width = size;
    map.height = size;
    let ctx = map.getContext('2d');

    // get the data
    let box = createBox(pos.coords.latitude, pos.coords.longitude);
    let data = await fetch('/locations.json');
    let locations = await data.json();
    let parsed = parseData(locations, box);

    for (let point of parsed) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, Math.PI * 2, true);
        ctx.fill();
    }
}

function parseData(data, box) {
    let points = [];

    for (let point of data.locations) {
        let lat = point.latitudeE7 / 10**7;
        let lon = point.longitudeE7 / 10**7;

        let p = {
            y: size - Math.round((lat - box.s) / (box.n - box.s) * size),
            x: Math.round((lon - box.w) / (box.e - box.w) * size),
        };

        if (p.x >= 0 && p.x <= size && p.y >= 0 && p.y <= size ) {
            points.push(p);
        }
    }

    return points;
}

function createBox(lat, lon) {
    //Earth’s radius, sphere
    let r = 6378137;

    //Coordinate offsets in radians
    let offsetLat = offset / r;
    let offsetLon = offset / (r * Math.cos(Math.PI * lat / 180));

    //OffsetPosition, decimal degrees
    let lat1 = lat + offsetLat * 180 / Math.PI;
    let lon1 = lon + offsetLon * 180 / Math.PI;

    let lat2 = lat + -offsetLat * 180 / Math.PI;
    let lon2 = lon + -offsetLon * 180 / Math.PI;

    return {
        n: round(lat1, 7),
        e: round(lon1, 7),
        s: round(lat2, 7),
        w: round(lon2, 7)
    };
}

const round = (n, decimals = 0) => Number(`${Math.round(`${n}e${decimals}`)}e-${decimals}`);

